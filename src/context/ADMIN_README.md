# Admin Authentication System

This directory contains the admin role-based access control (RBAC) system for the Chicago Artist Guide admin interface.

## Overview

The admin system provides role-based permissions for managing the platform. It consists of:

- **Types**: Admin role and permission definitions (`src/types/admin.ts`)
- **Context**: AdminContext provider for sharing admin state (`src/context/AdminContext.tsx`)
- **Hook**: useAdminAuth hook for accessing admin info in components (`src/hooks/useAdminAuth.ts`)
- **Utils**: Permission checking helpers (`src/utils/adminPermissions.ts`)

## Security Model

**IMPORTANT**: This system is for UI/UX purposes only. It controls what interface elements users see, NOT what actions they can actually perform.

Real authorization MUST be enforced server-side via:
- Firestore security rules
- Cloud Functions
- Backend API endpoints

Never rely on these client-side checks for security decisions.

## Admin Roles

Four role levels are supported, stored in the `admin_role` field of the accounts collection:

### 1. Staff (`staff`)
Analytics view-only access
- Can view analytics dashboard
- Cannot access user/company/opening management
- **Use case**: Data analysts, reporting staff

### 2. Moderator (`moderator`)
Content moderation capabilities
- All staff permissions
- Can view users, companies, openings
- Can moderate openings (flag inappropriate content)
- Cannot edit or delete resources
- Cannot export data

### 3. Admin (`admin`)
Full management capabilities
- All moderator permissions
- Can edit and delete users, companies, openings
- Can approve companies
- Can export data
- Cannot manage admin roles

### 4. Super Admin (`super_admin`)
Complete system access
- All admin permissions
- Can manage admin roles (assign/revoke admin privileges)
- Full control over platform

## Setup

### 1. Add AdminProvider to your app

In `App.tsx` or your root component:

```tsx
import { AdminProvider } from '../context/AdminContext';
import { useFirebaseContext } from '../context/FirebaseContext';
import { useUserContext } from '../context/UserContext';

function App() {
  const { firebaseFirestore } = useFirebaseContext();
  const { currentUser } = useUserContext();

  return (
    <AdminProvider currentUser={currentUser} firestore={firebaseFirestore}>
      {/* Your app components */}
    </AdminProvider>
  );
}
```

The AdminProvider should be placed after FirebaseContext and UserContext in the provider tree.

### 2. Set admin_role in Firestore

To grant admin access to a user, add an `admin_role` field to their account document:

```javascript
// In Firestore console or via admin script
db.collection('accounts').doc(userId).update({
  admin_role: 'admin' // Valid values: 'super_admin', 'admin', 'moderator', 'staff'
});
```

### 3. Use the hook in components

```tsx
import { useAdminAuth } from '../hooks/useAdminAuth';

function AdminDashboard() {
  const { isAdmin, adminRole, permissions, hasPermission, loading } = useAdminAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAdmin) {
    return <NotAuthorized />;
  }

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Role: {adminRole}</p>

      {/* Using structured permissions */}
      {permissions?.users.edit && (
        <button>Edit Users</button>
      )}

      {/* Using hasPermission helper */}
      {hasPermission('companies.approve') && (
        <button>Approve Companies</button>
      )}
    </div>
  );
}
```

## Usage Examples

### Checking Multiple Permissions

```tsx
function UserManagementPage() {
  const { permissions, hasPermission } = useAdminAuth();

  const canEdit = permissions?.users.edit;
  const canDelete = permissions?.users.delete;
  const canExport = hasPermission('users.export');

  return (
    <div>
      {canEdit && <EditButton />}
      {canDelete && <DeleteButton />}
      {canExport && <ExportButton />}
    </div>
  );
}
```

### Role-Based Navigation

```tsx
function AdminNav() {
  const { adminRole, permissions } = useAdminAuth();

  return (
    <nav>
      <Link to="/admin/dashboard">Dashboard</Link>

      {permissions?.users.view && (
        <Link to="/admin/users">Users</Link>
      )}

      {permissions?.companies.approve && (
        <Link to="/admin/companies">Companies</Link>
      )}

      {adminRole === 'super_admin' && (
        <Link to="/admin/settings">System Settings</Link>
      )}
    </nav>
  );
}
```

### Protected Routes

```tsx
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../hooks/useAdminAuth';

function ProtectedAdminRoute({ children, requiredPermission }) {
  const { isAdmin, hasPermission, loading } = useAdminAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAdmin) {
    return <Navigate to="/not-authorized" />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/admin/dashboard" />;
  }

  return children;
}

// Usage
<Route
  path="/admin/users"
  element={
    <ProtectedAdminRoute requiredPermission="users.view">
      <UsersPage />
    </ProtectedAdminRoute>
  }
/>
```

### Using Permission Helpers

```tsx
import {
  canManageUsers,
  canApproveCompanies,
  canExportData
} from '../utils/adminPermissions';

function QuickActions() {
  const { adminRole } = useAdminAuth();

  return (
    <div>
      {canManageUsers(adminRole) && (
        <QuickAction icon="users" label="Manage Users" />
      )}

      {canApproveCompanies(adminRole) && (
        <QuickAction icon="company" label="Approve Companies" />
      )}

      {canExportData(adminRole) && (
        <QuickAction icon="download" label="Export Data" />
      )}
    </div>
  );
}
```

## Available Permissions

### User Management
- `users.view` - View user accounts
- `users.edit` - Edit user accounts
- `users.delete` - Delete user accounts
- `users.export` - Export user data

### Company Management
- `companies.view` - View companies
- `companies.approve` - Approve new companies
- `companies.edit` - Edit company profiles
- `companies.delete` - Delete companies
- `companies.export` - Export company data

### Opening Management
- `openings.view` - View role openings
- `openings.moderate` - Moderate openings
- `openings.delete` - Delete openings
- `openings.export` - Export opening data

### Production Management
- `productions.view` - View productions
- `productions.edit` - Edit productions
- `productions.delete` - Delete productions
- `productions.export` - Export production data

### Analytics
- `analytics.view` - View analytics
- `analytics.export` - Export analytics data

### System Administration
- `system.settings` - Modify system settings
- `system.logs` - View system logs
- `admin.manage` - Manage other admins

## Permission Helper Functions

Located in `src/utils/adminPermissions.ts`:

```tsx
// Check a specific permission
checkPermission(role, 'users.edit') // returns boolean

// Check role hierarchy
hasRoleLevel(role, 'moderator') // true if role >= moderator

// Get all permissions for a role
getPermissionsForRole(role) // returns AdminPermissions object

// Common checks
canManageUsers(role)
canApproveCompanies(role)
canModerateOpenings(role)
canExportData(role)
canAccessSystemSettings(role)
canManageAdmins(role)

// Display helpers
getRoleDisplayName(role) // "Super Admin"
getRoleDescription(role) // "Full system access..."
getPermissionsList(role) // ["View users", "Edit users", ...]
```

## Migration from useStaffAuth

If you're currently using the deprecated `useStaffAuth` hook:

### Before
```tsx
const { isStaff } = useStaffAuth();

if (isStaff) {
  // Show admin UI
}
```

### After
```tsx
const { isAdmin } = useAdminAuth();

if (isAdmin) {
  // Show admin UI
}
```

### Benefits of Migration
- Role-based access control instead of email whitelist
- Fine-grained permissions
- Easier to manage (update Firestore, not code)
- More scalable as team grows

## Testing

When testing components that use admin auth:

```tsx
import { AdminContext } from '../context/AdminContext';
import { render } from '@testing-library/react';

const mockAdminContext = {
  currentAdminRole: 'admin',
  permissions: {
    users: { view: true, edit: true, delete: true, export: true },
    // ... other permissions
  },
  loading: false,
  hasPermission: (permission) => permission.startsWith('users.')
};

function renderWithAdminContext(component) {
  return render(
    <AdminContext.Provider value={mockAdminContext}>
      {component}
    </AdminContext.Provider>
  );
}

test('shows edit button for admins', () => {
  const { getByText } = renderWithAdminContext(<UserList />);
  expect(getByText('Edit')).toBeInTheDocument();
});
```

## Troubleshooting

### User has admin_role but shows as not admin
1. Check that admin_role value is exactly: 'staff', 'moderator', 'admin', or 'super_admin'
2. Verify Firestore connection is working
3. Check browser console for AdminContext errors
4. Ensure AdminProvider is in the component tree

### Permission checks always return false
1. Verify AdminProvider is mounted with currentUser and firestore props
2. Check that user's account document exists and is fetched
3. Ensure you're checking for the correct permission string
4. Check browser console for warnings

### Loading state never resolves
1. Verify firestore is initialized properly
2. Check that currentUser is being passed to AdminProvider
3. Look for errors in Firestore fetch

## Best Practices

1. **Always check loading state** before rendering admin UI
2. **Use structured permissions** (`permissions?.users.edit`) for cleaner code
3. **Provide fallbacks** for users without permissions
4. **Don't trust client-side checks** - always enforce server-side
5. **Log permission denials** for debugging and security monitoring
6. **Test with different role levels** to ensure correct behavior
7. **Document required permissions** in component comments

## Future Enhancements

Potential improvements to consider:

- Real-time role updates (Firestore listener)
- Permission caching for performance
- Role assignment UI for super admins
- Audit logging for admin actions
- Permission groups for easier management
- Custom role creation
- Time-based permissions (expiring access)
