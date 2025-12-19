# Admin Types and Permissions System

This document describes the admin role and permissions system for the Chicago Artist Guide admin interface.

## Overview

The admin system provides a hierarchical role-based access control (RBAC) system with granular permissions for managing users, companies, openings, and analytics.

## Files

- `admin.ts` - Core type definitions, constants, and type guards
- `adminPermissions.ts` - Utility functions for permission checking
- `admin.example.ts` - Usage examples and patterns (reference only)

## Admin Roles

The system supports four admin roles, listed from highest to lowest privilege:

### 1. Super Admin (`super_admin`)
- Full system access
- Can manage admin roles (assign/revoke admin privileges)
- Can perform all actions on all resources
- **Use case**: System administrators, founders

### 2. Admin (`admin`)
- Full access to all resources
- Cannot manage admin roles (cannot assign/revoke admin privileges)
- Can view, edit, delete users, companies, and openings
- Can approve companies
- **Use case**: Operations managers, senior staff

### 3. Moderator (`moderator`)
- View-only access to users and companies
- Can moderate openings (flag inappropriate content)
- Can view analytics
- Cannot edit or delete any resources
- **Use case**: Content moderators, community managers

### 4. Staff (`staff`)
- Analytics view-only access
- No access to user/company/opening management
- **Use case**: Data analysts, reporting staff

## Permission Structure

Each role has specific permissions across four resource types:

```typescript
interface AdminPermissions {
  users: {
    view: boolean;
    edit: boolean;
    delete: boolean;
    manageRoles: boolean;
  };
  companies: {
    view: boolean;
    edit: boolean;
    delete: boolean;
    approve: boolean;
  };
  openings: {
    view: boolean;
    edit: boolean;
    delete: boolean;
    moderate: boolean;
  };
  analytics: {
    view: boolean;
    export: boolean;
  };
}
```

## Permission Matrix

| Resource / Action | super_admin | admin | moderator | staff |
|-------------------|-------------|-------|-----------|-------|
| **Users**         |             |       |           |       |
| View              | ✓           | ✓     | ✓         | ✗     |
| Edit              | ✓           | ✓     | ✗         | ✗     |
| Delete            | ✓           | ✓     | ✗         | ✗     |
| Manage Roles      | ✓           | ✗     | ✗         | ✗     |
| **Companies**     |             |       |           |       |
| View              | ✓           | ✓     | ✓         | ✗     |
| Edit              | ✓           | ✓     | ✗         | ✗     |
| Delete            | ✓           | ✓     | ✗         | ✗     |
| Approve           | ✓           | ✓     | ✗         | ✗     |
| **Openings**      |             |       |           |       |
| View              | ✓           | ✓     | ✓         | ✗     |
| Edit              | ✓           | ✓     | ✗         | ✗     |
| Delete            | ✓           | ✓     | ✗         | ✗     |
| Moderate          | ✓           | ✓     | ✓         | ✗     |
| **Analytics**     |             |       |           |       |
| View              | ✓           | ✓     | ✓         | ✓     |
| Export            | ✓           | ✓     | ✗         | ✗     |

> **Note**: The `admin_users` collection is automatically synced by `AdminContext` when a user's `admin_role` is set in the `accounts` collection. This allows Firestore rules to efficiently check admin status without querying accounts.

## Usage

### Basic Permission Check

```typescript
import { checkPermission } from '../utils/adminPermissions';

const result = checkPermission(adminRole, 'users', 'edit');
if (result.allowed) {
  // Show edit UI
} else {
  console.log(result.reason); // "Moderator role cannot edit users"
}
```

### Get All Permissions for a Role

```typescript
import { getPermissionsForRole } from '../utils/adminPermissions';

const permissions = getPermissionsForRole('admin');
if (permissions.companies.approve) {
  // Show approve button
}
```

### Check Role Hierarchy

```typescript
import { hasRoleLevel } from '../utils/adminPermissions';

// Check if user has at least moderator privileges
if (hasRoleLevel(currentRole, 'moderator')) {
  // Show moderation features
}
```

### Semantic Helpers

```typescript
import {
  canManageUsers,
  canApproveCompanies,
  canModerateOpenings,
  canManageRoles
} from '../utils/adminPermissions';

if (canManageRoles(adminRole)) {
  // Only super_admin can see this
}

if (canApproveCompanies(adminRole)) {
  // Admin and super_admin can see this
}
```

## Firestore Integration

### Account Document Extension

Add these fields to the user's account document in Firestore:

```typescript
interface UserAccount {
  // ... existing fields (uid, email, displayName, type, etc.)

  // Admin fields
  admin_role: AdminRole; // 'super_admin' | 'admin' | 'moderator' | 'staff' | null
  admin_role_assigned_at?: Timestamp;
  admin_role_assigned_by?: string; // UID of admin who assigned the role
  admin_role_notes?: string; // Notes about why role was assigned
  admin_active: boolean; // Whether admin access is currently active
}
```

Additionally, AdminContext auto-syncs admin users to the `admin_users` collection for efficient Firestore rules:

```typescript
// admin_users/{uid}
interface AdminUserDoc {
  uid: string;
  admin_role: AdminRole;
  synced_at: Timestamp;
}
```

### Audit Logging

All admin actions are logged to the `admin_actions` collection:

```typescript
import { AdminAuditLog } from './admin';
import { Timestamp } from 'firebase/firestore';

const auditLog: AdminAuditLog = {
  id: 'generated-id',
  adminUserId: 'admin-uid',
  adminEmail: 'admin@example.com',
  adminRole: 'admin',
  action: 'user_delete',
  resource: 'users',
  resourceId: 'deleted-user-uid',
  metadata: { reason: 'Policy violation' },
  timestamp: Timestamp.now(),
  success: true
};
```

## Security Rules

Example Firestore security rules for admin access:

```javascript
// Firestore security rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }

    function getAdminRole() {
      return get(/databases/$(database)/documents/accounts/$(request.auth.uid)).data.adminRole;
    }

    function isActiveAdmin() {
      let account = get(/databases/$(database)/documents/accounts/$(request.auth.uid)).data;
      return account.adminActive == true && account.adminRole != null;
    }

    function hasPermission(role, resource, action) {
      // Implement permission checks based on ROLE_PERMISSIONS
      // This is a simplified example
      return (role == 'super_admin') ||
             (role == 'admin' && action != 'manageRoles') ||
             (role == 'moderator' && action == 'view') ||
             (role == 'staff' && resource == 'analytics' && action == 'view');
    }

    // Admin audit logs - admins can write, super_admins can read
    match /admin_audit_logs/{logId} {
      allow read: if isActiveAdmin() && getAdminRole() == 'super_admin';
      allow create: if isActiveAdmin();
    }

    // User accounts - admin permissions required
    match /accounts/{accountId} {
      allow read: if isSignedIn();
      allow update: if isActiveAdmin() && hasPermission(getAdminRole(), 'users', 'edit');
      allow delete: if isActiveAdmin() && hasPermission(getAdminRole(), 'users', 'delete');
    }
  }
}
```

## Best Practices

### 1. Always Check Permissions Client-Side for UX

```typescript
// Good: Hide UI elements user can't use
const permissions = getPermissionsForRole(adminRole);
return (
  <div>
    {permissions.users.edit && <EditButton />}
    {permissions.users.delete && <DeleteButton />}
  </div>
);
```

### 2. Always Enforce Permissions Server-Side

```typescript
// In Cloud Functions or Firestore rules
exports.deleteUser = functions.https.onCall(async (data, context) => {
  // Check admin role in Firestore
  const adminDoc = await admin.firestore()
    .collection('accounts')
    .doc(context.auth.uid)
    .get();

  const adminRole = adminDoc.data()?.adminRole;

  // Enforce permission server-side
  if (!hasPermission(adminRole, 'users', 'delete')) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'You do not have permission to delete users'
    );
  }

  // Proceed with deletion
});
```

### 3. Log All Admin Actions

```typescript
async function performAdminAction(action: () => Promise<void>) {
  try {
    await action();
    await logAuditEntry({ success: true });
  } catch (error) {
    await logAuditEntry({
      success: false,
      errorMessage: error.message
    });
    throw error;
  }
}
```

### 4. Use Type Guards for Safety

```typescript
function processAdminRole(roleValue: unknown) {
  if (isAdminRole(roleValue)) {
    // TypeScript knows roleValue is a valid AdminRole
    const permissions = getPermissionsForRole(roleValue);
  }
}
```

### 5. Display Role Information to Users

```typescript
import { getRoleDisplayName, getRoleDescription } from '../utils/adminPermissions';

function AdminBadge({ role }: { role: NonNullable<AdminRole> }) {
  return (
    <div>
      <strong>{getRoleDisplayName(role)}</strong>
      <p>{getRoleDescription(role)}</p>
    </div>
  );
}
```

## Type Exports

The following types and utilities are exported from `admin.ts`:

### Types
- `AdminRole` - Role enum type
- `AdminResource` - Resource type
- `AdminPermissions` - Permissions interface
- `AdminActionType` - Audit action types
- `AdminAuditLog` - Audit log entry interface
- `AdminProfile` - Account extension interface
- `PermissionCheckResult` - Permission check result
- `FlatPermissionKey` - Flattened permission string type

### Constants
- `ROLE_PERMISSIONS` - Permission mappings
- `ACTION_PERMISSION_MAP` - Action to permission mapping
- `ADMIN_ROLE_LEVELS` - Role hierarchy levels
- `EMPTY_PERMISSIONS` - Empty permissions object
- `ADMIN_ROLE_METADATA` - Role display metadata

### Type Guards
- `isAdminRole(value)` - Check if value is valid admin role
- `isAdminResource(value)` - Check if value is valid resource
- `hasAdminPrivileges(role)` - Check if role has admin privileges

## Testing

Example test cases:

```typescript
import { checkPermission, hasRoleLevel } from '../utils/adminPermissions';

describe('Admin Permissions', () => {
  test('super_admin can manage roles', () => {
    const result = checkPermission('super_admin', 'users', 'manageRoles');
    expect(result.allowed).toBe(true);
  });

  test('admin cannot manage roles', () => {
    const result = checkPermission('admin', 'users', 'manageRoles');
    expect(result.allowed).toBe(false);
  });

  test('moderator can view but not edit users', () => {
    expect(checkPermission('moderator', 'users', 'view').allowed).toBe(true);
    expect(checkPermission('moderator', 'users', 'edit').allowed).toBe(false);
  });

  test('staff only has analytics access', () => {
    expect(checkPermission('staff', 'analytics', 'view').allowed).toBe(true);
    expect(checkPermission('staff', 'users', 'view').allowed).toBe(false);
  });

  test('role hierarchy works correctly', () => {
    expect(hasRoleLevel('super_admin', 'admin')).toBe(true);
    expect(hasRoleLevel('moderator', 'admin')).toBe(false);
  });
});
```

## Migration Guide

If you have existing admin users, migrate them as follows:

1. Add the admin fields to existing account documents
2. Set `adminRole` based on current privileges
3. Set `adminActive` to `true` for active admins
4. Set `adminRoleAssignedAt` to current timestamp
5. Set `adminRoleAssignedBy` to a system user ID

```typescript
// Migration script example
async function migrateAdminAccounts() {
  const accounts = await firestore.collection('accounts')
    .where('isAdmin', '==', true)
    .get();

  for (const doc of accounts.docs) {
    await doc.ref.update({
      adminRole: 'admin', // or determine based on current permissions
      adminActive: true,
      adminRoleAssignedAt: Timestamp.now(),
      adminRoleAssignedBy: 'system'
    });
  }
}
```

## Future Enhancements

Potential additions to the system:

1. **Custom Permissions** - Allow super_admins to create custom permission sets
2. **Time-Limited Roles** - Admin roles that expire after a set time
3. **IP Restrictions** - Limit admin access to specific IP addresses
4. **Two-Factor Authentication** - Require 2FA for admin access
5. **Permission Groups** - Group related permissions together
6. **Delegation** - Allow admins to temporarily delegate permissions

## Support

For questions or issues with the admin system, contact the development team or see `admin.example.ts` for usage examples.
