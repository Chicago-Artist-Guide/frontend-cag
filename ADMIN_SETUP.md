# Admin System Setup Guide

This guide explains how to set up and configure the admin system for Chicago Artist Guide.

## Overview

The admin system uses role-based access control (RBAC) with roles stored in Firestore accounts collection. Permissions are enforced server-side via Firestore security rules.

## Admin Roles

Four role levels, from lowest to highest privilege:

1. **staff** - View analytics only
2. **moderator** - View all + moderate openings
3. **admin** - Full management except role assignment
4. **super_admin** - Complete system access including role management

## Initial Setup

### 1. Grant Super Admin Role

**IMPORTANT**: The first super_admin must be created manually in Firestore Console.

1. Open Firebase Console: https://console.firebase.google.com/
2. Navigate to your project → Firestore Database
3. Find the `accounts` collection
4. Locate your account document (by your UID)
5. Add a new field:
   - Field: `admin_role`
   - Type: `string`
   - Value: `super_admin`
6. Save the document

### 2. Grant Additional Admin Roles

Once you have super_admin access:

1. Log in to the application
2. Navigate to `/staff/admin/users/roles`
3. Search for the user by email
4. Assign appropriate role from dropdown
5. Save changes

The system will:
- Log the action in `admin_actions` collection
- Update the user's `admin_role` field
- Update `admin_since` timestamp
- Send email notification (future)

## Manual Role Assignment Script

For bulk role assignment or initial setup, use this Firestore script:

```javascript
// Run in Firebase Console → Firestore → Execute Query
const admin = require('firebase-admin');
const db = admin.firestore();

// Map of emails to roles
const roleAssignments = {
  'chris@ctkadvisors.net': 'super_admin',
  'anna@chicagoartistguide.org': 'admin',
  'mharigoldstein@yahoo.com': 'admin',
  'alex@alexjewell.com': 'moderator',
  'jmfischer55@gmail.com': 'staff'
};

async function assignRoles() {
  for (const [email, role] of Object.entries(roleAssignments)) {
    // Find user account by email
    const snapshot = await db.collection('accounts')
      .where('email', '==', email)
      .limit(1)
      .get();

    if (snapshot.empty) {
      console.log(`Account not found for ${email}`);
      continue;
    }

    const accountDoc = snapshot.docs[0];

    // Update admin_role
    await accountDoc.ref.update({
      admin_role: role,
      admin_since: admin.firestore.FieldValue.serverTimestamp(),
      last_admin_action: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`Assigned ${role} to ${email}`);
  }
}

assignRoles().then(() => console.log('Done'));
```

## Firestore Security Rules

Security rules have been updated with admin functions. Key points:

### Admin Helper Functions
- `isAdmin()` - Has any admin_role
- `hasAdminRole(role)` - Has specific role
- `isSuperAdmin()` - Is super_admin
- `isAdminOrHigher()` - Is admin or super_admin
- `isModeratorOrHigher()` - Is moderator, admin, or super_admin
- `isStaffOrHigher()` - Has any admin role

### Collection Permissions

**accounts:**
- Read: All authenticated users (for matching) + admins
- Create: Authenticated users (cannot set admin_role)
- Update: Own account (cannot change admin_role) OR admins (cannot change admin_role) OR super_admin (can change admin_role)
- Delete: Super admin only

**profiles:**
- Read: All authenticated users + admins
- Create: Own profile only
- Update: Own profile OR admins
- Delete: Super admin only

**admin_actions:**
- Read: Admins only
- Create: Admins only (must match auth.uid)
- Update: Never (audit logs are immutable)
- Delete: Super admin only (for retention policy)

**theatre_requests:**
- Read: Admins only
- Create: Public (signup requests)
- Update: Admins only (approval workflow)
- Delete: Admins only

## Audit Logging

All admin actions are automatically logged to `admin_actions` collection:

```typescript
{
  action_id: string;
  admin_uid: string;
  admin_email: string;
  admin_role: AdminRole;
  action_type: AdminActionType;
  target_type: AdminActionTargetType;
  target_id: string;
  target_name?: string;
  changes?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
    fields_changed?: string[];
  };
  timestamp: Timestamp;
  notes?: string;
}
```

## Testing Admin Access

### Test Role Permissions

1. Create test accounts with different roles
2. Log in as each role
3. Verify correct permissions:
   - **staff**: Can only access `/staff/admin/analytics`
   - **moderator**: Can access analytics + openings management
   - **admin**: Can access all except role management
   - **super_admin**: Can access everything

### Test Security Rules

```javascript
// Test in Firebase Console → Rules Playground

// Test: Non-admin cannot read admin_actions
// User: regular user (no admin_role)
// Collection: admin_actions
// Operation: get
// Expected: Denied

// Test: Admin can read admin_actions
// User: admin user (admin_role: 'admin')
// Collection: admin_actions
// Operation: get
// Expected: Allowed

// Test: User cannot set their own admin_role
// User: regular user
// Collection: accounts
// Operation: update (adding admin_role: 'admin')
// Expected: Denied

// Test: Super admin can set any admin_role
// User: super_admin
// Collection: accounts
// Operation: update (setting admin_role: 'moderator')
// Expected: Allowed
```

## Security Best Practices

### DO:
✅ Always use `super_admin` to grant admin roles
✅ Log all sensitive admin actions
✅ Validate permissions in Firestore rules
✅ Use `serverTimestamp()` for audit logs
✅ Test role permissions thoroughly

### DON'T:
❌ Trust client-side permission checks for security
❌ Allow users to set their own admin_role
❌ Skip audit logging for sensitive operations
❌ Grant super_admin role to untrusted users
❌ Modify admin_actions after creation (immutable audit trail)

## Troubleshooting

### "Permission Denied" Errors

1. **Check user has admin_role set**:
   - Open Firestore Console
   - Check accounts/{uid} document
   - Verify admin_role field exists and is valid

2. **Check Firestore rules are deployed**:
   ```bash
   firebase deploy --only firestore:rules
   ```

3. **Check user is authenticated**:
   - Verify `currentUser` is not null
   - Check Firebase Auth token is valid

### Admin Actions Not Logging

1. **Check admin has permission to create logs**:
   - Verify `isAdmin()` returns true
   - Check `admin_role` field is set

2. **Check required fields are set**:
   - admin_uid matches auth.uid
   - admin_email matches account email
   - action_type is valid
   - target_type is valid
   - timestamp is set

### Role Assignment Fails

1. **Verify you are super_admin**:
   - Only super_admin can modify admin_role
   - Check your account's admin_role field

2. **Check target user exists**:
   - Verify account document exists
   - Check UID is correct

3. **Validate role value**:
   - Must be: 'super_admin', 'admin', 'moderator', 'staff', or null
   - Case-sensitive

## Migration from Email Whitelist

The old system used email whitelist in `staffAccess.ts`. To migrate:

1. Identify current staff emails from `STAFF_CONFIG.emails`
2. Determine appropriate role for each person
3. Use script above to assign roles
4. Test each user's access
5. Remove email whitelist (keep for backward compatibility initially)

## Backup and Recovery

### Backup Admin Roles

```javascript
// Export current admin assignments
const admin = require('firebase-admin');
const db = admin.firestore();

async function backupAdminRoles() {
  const snapshot = await db.collection('accounts')
    .where('admin_role', '!=', null)
    .get();

  const admins = snapshot.docs.map(doc => ({
    uid: doc.id,
    email: doc.data().email,
    admin_role: doc.data().admin_role,
    admin_since: doc.data().admin_since
  }));

  console.log(JSON.stringify(admins, null, 2));
}

backupAdminRoles();
```

### Restore Admin Roles

```javascript
// Restore from backup
const backupData = [/* paste backup JSON here */];

async function restoreAdminRoles() {
  for (const admin of backupData) {
    await db.collection('accounts').doc(admin.uid).update({
      admin_role: admin.admin_role,
      admin_since: admin.admin_since
    });
    console.log(`Restored ${admin.email}`);
  }
}

restoreAdminRoles();
```

## Support

For issues or questions:
1. Check this guide
2. Review Firestore rules
3. Check Firebase Console logs
4. Contact development team

---

**Last Updated**: 2025-12-18
**Version**: 1.0.0
