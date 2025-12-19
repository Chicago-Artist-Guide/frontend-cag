# Firestore Security Rules - Admin System Documentation

## Overview

The Firestore security rules have been updated to support a comprehensive admin role-based access control (RBAC) system. This document explains the security architecture, design decisions, and usage patterns.

## Critical Security Principle

**This is a Single Page Application (SPA) - these Firestore rules are the ONLY real security boundary.**

Client-side admin checks (in React components) are purely for UX - they control what UI is shown, but provide NO security. A malicious user can bypass any client-side checks using browser dev tools or API calls.

Therefore, ALL security enforcement MUST happen in these Firestore rules.

## Admin Role Hierarchy

The system implements four admin roles with hierarchical permissions:

```
super_admin (Highest)
    └─ Full system access
    └─ Can grant/revoke admin roles
    └─ Can delete audit logs
    └─ Can delete users/profiles

admin
    └─ Can manage users, companies, productions
    └─ Can approve theatre requests
    └─ Can edit profiles and accounts (except admin_role)
    └─ Can read all collections

moderator
    └─ Can moderate role opportunities
    └─ Can update/delete inappropriate content
    └─ Can read all collections
    └─ Cannot manage user accounts

staff (Lowest)
    └─ Can view analytics
    └─ Can read audit logs
    └─ Cannot modify any data
```

## Helper Functions

### Core Authentication

- `isAuthenticated()` - Checks if user is logged in
- `isOwner(userId)` - Checks if user owns a document
- `ownsAccount(accountData)` - Checks if user owns account
- `ownsProfile(profileData)` - Checks if user owns profile

### Admin Role Checks

- `getUserAccount()` - Fetches current user's account from Firestore
- `isAdmin()` - User has ANY admin role (staff, moderator, admin, super_admin)
- `hasAdminRole(role)` - User has specific role
- `isSuperAdmin()` - User has super_admin role
- `isAdminOrHigher()` - User has admin or super_admin
- `isModeratorOrHigher()` - User has moderator, admin, or super_admin
- `isStaffOrHigher()` - User has any admin role

### Security Validation

- `isValidAdminRoleChange()` - Validates admin_role modifications (super_admin only)
- `isSelfAdminRoleChange()` - Detects self-privilege escalation attempts

## Collection Security Rules

### Accounts Collection

**Read**: All authenticated users (for matching/messaging) + admins
**Create**: Authenticated users can create their own account (admin_role must be null)
**Update**:
  - Users can update own account (cannot change admin_role)
  - Admins can update accounts (cannot change admin_role)
  - Only super_admin can modify admin_role field
**Delete**: Super_admin only

**Security Features**:
- Prevents users from self-granting admin roles
- Prevents admins from escalating their own privileges
- Only super_admin can grant/revoke admin roles

### Profiles Collection

**Read**: All authenticated users + admins
**Create**: Users can create their own profile
**Update**: Owner or admin+
**Delete**: Super_admin only

**Security Features**:
- Admins can moderate profiles
- Maintains read access for matching system

### Productions Collection

**Read**: All authenticated users
**Create**: Users can create productions for their own account
**Update**: Owner or admin+
**Delete**: Owner or admin+

**Security Features**:
- Admins can moderate inappropriate productions
- Maintains ownership validation

### Role Opportunities Collection

**Read**: Public (anyone)
**Create**: Authenticated users
**Update**: Owner or moderator+
**Delete**: Owner or moderator+

**Security Features**:
- Moderators can remove inappropriate openings
- Lower permission level than other collections (moderator vs admin)

### Theatre Requests Collection

**Read**: Request creator or admin+
**Create**: Anyone (public signup flow)
**Update**: Request creator or admin+
**Delete**: Request creator or admin+

**Security Features**:
- Admins can approve/reject requests
- Request creators can update their requests
- Privacy: users cannot read other requests

### Theatre Talent Matches Collection

**Read**: All authenticated users + admins
**Write**: Authenticated users

**Security Features**:
- Admins can read all matches for analytics
- Maintains existing matching functionality

### Admin Actions Collection (Audit Log)

**Read**: Admins only (staff+)
**Create**: Admins only, with validation:
  - Required fields: admin_uid, admin_email, action_type, target_type, target_id, timestamp
  - admin_uid must match authenticated user (prevents impersonation)
  - action_type must be valid enum value
  - target_type must be valid enum value
**Update**: FORBIDDEN (tamper protection)
**Delete**: Super_admin only (data retention cleanup)

**Valid Action Types**:
- `user_edit` - Admin edited user account
- `company_approve` - Admin approved company request
- `opening_moderate` - Admin moderated role opening
- `role_change` - Admin changed user's admin role
- `delete` - Admin deleted content
- `export` - Admin exported data
- `profile_view` - Admin viewed sensitive profile data
- `account_create` - Admin created account

**Valid Target Types**:
- `user`, `company`, `production`, `role`, `match`, `theatre_request`, `account`, `profile`

**Security Features**:
- Immutable audit trail (no updates allowed)
- Prevents impersonation in logs
- Validates all required fields
- Only super_admin can cleanup old logs

## Security Principles Implemented

### 1. Never Trust Client-Side Data

All admin role checks fetch the user's account document from Firestore:

```javascript
function getUserAccount() {
  return get(/databases/$(database)/documents/accounts/$(request.auth.uid));
}
```

This prevents users from manipulating client-side auth claims or localStorage to gain admin access.

### 2. Prevent Privilege Escalation

Users cannot modify their own `admin_role` field:

```javascript
// In accounts collection update rule
(request.auth.uid == resource.data.uid &&
 (!request.resource.data.keys().hasAny(['admin_role']) ||
  request.resource.data.admin_role == resource.data.admin_role))
```

Even admins cannot change admin_role - only super_admin can.

### 3. Audit All Sensitive Operations

Admin actions must be logged in the `admin_actions` collection:

```javascript
// Client code must do this when performing admin operations
await addDoc(collection(db, 'admin_actions'), {
  admin_uid: currentUser.uid,
  admin_email: currentUser.email,
  action_type: 'user_edit',
  target_type: 'user',
  target_id: userId,
  changes: { before: {...}, after: {...} },
  timestamp: serverTimestamp(),
  notes: 'Updated user email'
});
```

### 4. Immutable Audit Logs

Once created, audit logs cannot be modified:

```javascript
// No one can update audit logs to prevent tampering
allow update: if false;
```

Only super_admin can delete logs (for data retention policies).

### 5. Defense in Depth

Multiple layers of validation:
- Authentication required
- Role checked in Firestore (not client)
- Field-level validation (admin_role changes)
- Action enumeration (only valid action types)
- Ownership validation (can't impersonate in logs)

## Usage Patterns

### Granting Admin Roles (Super Admin Only)

```typescript
// Client code (React)
const grantAdminRole = async (userId: string, role: AdminRole) => {
  // Check permission (UX only - not security)
  if (!isSuperAdmin(currentUser)) {
    throw new Error('Unauthorized');
  }

  const accountRef = doc(db, 'accounts', userId);

  // Firestore rules will validate this
  await updateDoc(accountRef, {
    admin_role: role,
    admin_since: serverTimestamp(),
  });

  // Log the action
  await addDoc(collection(db, 'admin_actions'), {
    admin_uid: currentUser.uid,
    admin_email: currentUser.email,
    action_type: 'role_change',
    target_type: 'account',
    target_id: userId,
    changes: { admin_role: role },
    timestamp: serverTimestamp(),
  });
};
```

### Admin Moderating Content

```typescript
// Client code (React)
const moderateOpening = async (openingId: string, reason: string) => {
  // Check permission (UX only)
  if (!isModeratorOrHigher(currentUser)) {
    throw new Error('Unauthorized');
  }

  const openingRef = doc(db, 'roleOpportunities', openingId);

  // Firestore rules will validate this
  await updateDoc(openingRef, {
    status: 'removed',
    moderation_note: reason,
    moderated_at: serverTimestamp(),
    moderated_by: currentUser.uid,
  });

  // Log the action
  await addDoc(collection(db, 'admin_actions'), {
    admin_uid: currentUser.uid,
    admin_email: currentUser.email,
    action_type: 'opening_moderate',
    target_type: 'role',
    target_id: openingId,
    notes: reason,
    timestamp: serverTimestamp(),
  });
};
```

### Viewing Sensitive Data

```typescript
// Client code (React)
const viewFullProfile = async (userId: string) => {
  // Check permission (UX only)
  if (!isAdmin(currentUser)) {
    throw new Error('Unauthorized');
  }

  // Log data access for privacy compliance
  await addDoc(collection(db, 'admin_actions'), {
    admin_uid: currentUser.uid,
    admin_email: currentUser.email,
    action_type: 'profile_view',
    target_type: 'profile',
    target_id: userId,
    timestamp: serverTimestamp(),
  });

  // Then fetch the profile (rules allow admin read)
  const profile = await getDoc(doc(db, 'profiles', userId));
  return profile.data();
};
```

## Testing Security Rules

### Local Testing with Emulator

```bash
# Start Firestore emulator
firebase emulators:start --only firestore

# In another terminal, run tests
npm test -- firestore.rules.test.ts
```

### Unit Test Example

```typescript
import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';

describe('Admin RBAC', () => {
  it('prevents users from self-granting admin roles', async () => {
    const db = testEnv.authenticatedContext('user123').firestore();
    const accountRef = db.collection('accounts').doc('user123');

    await assertFails(
      accountRef.update({ admin_role: 'super_admin' })
    );
  });

  it('allows super_admin to grant admin roles', async () => {
    const db = testEnv.authenticatedContext('superadmin123').firestore();
    const accountRef = db.collection('accounts').doc('user456');

    await assertSucceeds(
      accountRef.update({ admin_role: 'admin' })
    );
  });

  it('prevents tampering with audit logs', async () => {
    const db = testEnv.authenticatedContext('admin123').firestore();
    const actionRef = db.collection('admin_actions').doc('action789');

    await assertFails(
      actionRef.update({ action_type: 'different_action' })
    );
  });
});
```

## Migration Guide

### Adding Admin Role to Existing Accounts

```typescript
// One-time migration script (run with admin SDK)
import { getFirestore } from 'firebase-admin/firestore';

const grantInitialAdminRoles = async () => {
  const db = getFirestore();

  const adminEmails = [
    { email: 'admin1@example.com', role: 'super_admin' },
    { email: 'admin2@example.com', role: 'admin' },
    { email: 'staff@example.com', role: 'staff' },
  ];

  for (const { email, role } of adminEmails) {
    const accountQuery = await db.collection('accounts')
      .where('email', '==', email)
      .get();

    if (!accountQuery.empty) {
      const accountRef = accountQuery.docs[0].ref;
      await accountRef.update({
        admin_role: role,
        admin_since: Timestamp.now(),
      });
      console.log(`Granted ${role} to ${email}`);
    }
  }
};
```

### Deploying Updated Rules

```bash
# Deploy to production
firebase deploy --only firestore:rules

# Verify deployment
firebase firestore:rules:list
```

## Common Pitfalls to Avoid

### 1. DO NOT Trust Client-Side Role Checks

```typescript
// WRONG - Not secure
if (userContext.adminRole === 'admin') {
  await deleteDoc(doc(db, 'accounts', userId));
}

// RIGHT - Firestore rules enforce this
try {
  await deleteDoc(doc(db, 'accounts', userId));
} catch (error) {
  // Rules will deny if user lacks permission
  console.error('Permission denied:', error);
}
```

### 2. DO NOT Skip Audit Logging

```typescript
// WRONG - No audit trail
await updateDoc(doc(db, 'accounts', userId), { email: newEmail });

// RIGHT - Always log admin actions
await updateDoc(doc(db, 'accounts', userId), { email: newEmail });
await addDoc(collection(db, 'admin_actions'), {
  admin_uid: currentUser.uid,
  admin_email: currentUser.email,
  action_type: 'user_edit',
  target_type: 'account',
  target_id: userId,
  changes: { email: { before: oldEmail, after: newEmail } },
  timestamp: serverTimestamp(),
});
```

### 3. DO NOT Store Admin Role in Auth Claims

```typescript
// WRONG - Can be manipulated client-side
const customClaims = await getAuth().setCustomUserClaims(uid, {
  adminRole: 'admin' // Don't do this
});

// RIGHT - Store in Firestore, validate in rules
await updateDoc(doc(db, 'accounts', uid), {
  admin_role: 'admin' // Firestore rules validate this
});
```

## Monitoring and Compliance

### Query Audit Logs

```typescript
// Recent admin actions
const recentActions = await getDocs(
  query(
    collection(db, 'admin_actions'),
    orderBy('timestamp', 'desc'),
    limit(100)
  )
);

// Actions by specific admin
const adminActions = await getDocs(
  query(
    collection(db, 'admin_actions'),
    where('admin_uid', '==', adminUid),
    orderBy('timestamp', 'desc')
  )
);

// Specific action type
const roleChanges = await getDocs(
  query(
    collection(db, 'admin_actions'),
    where('action_type', '==', 'role_change'),
    orderBy('timestamp', 'desc')
  )
);
```

### Data Retention

Audit logs should be retained according to compliance requirements:

- Keep for 2 years in hot storage (Firestore)
- Archive to cold storage (Cloud Storage) after 2 years
- Only super_admin can delete logs from Firestore

## Support and Maintenance

### Adding New Admin Roles

To add a new admin role:

1. Update `isValidAdminRoleChange()` function to include new role
2. Update helper functions if needed (e.g., `isContentEditorOrHigher()`)
3. Update collection rules to check for new role
4. Update TypeScript types in `src/types/admin.ts`
5. Update permission matrix in admin context

### Adding New Action Types

To add a new audit log action type:

1. Update the `admin_actions` collection rule's `action_type` validation
2. Update TypeScript enum in `src/types/admin.ts`
3. Document the new action type in this file

### Debugging Permission Denied Errors

```typescript
// Enable Firestore logging
import { setLogLevel } from 'firebase/firestore';
setLogLevel('debug');

// Check rules simulator in Firebase Console
// https://console.firebase.google.com/project/YOUR-PROJECT/firestore/rules

// Test with different user contexts in emulator
const userDb = testEnv.authenticatedContext('user123');
const adminDb = testEnv.authenticatedContext('admin123');
```

## Summary

The Firestore security rules provide comprehensive RBAC for the admin system with:

- Hierarchical role system (super_admin > admin > moderator > staff)
- Privilege escalation prevention
- Immutable audit logging
- Field-level security (admin_role protection)
- Defense in depth with multiple validation layers

Remember: **These rules are the ONLY real security boundary in the SPA.** Client-side checks are for UX only.
