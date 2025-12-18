# Firestore Security Rules Test Scenarios

This document outlines test scenarios for the admin role-based access control (RBAC) system implemented in the Firestore security rules.

## Overview

The security rules implement a hierarchical admin system with four roles:
- `super_admin` - Full access, can manage admin roles
- `admin` - Can manage users, companies, and content
- `moderator` - Can moderate openings and content
- `staff` - Can view analytics and read data

## Admin Helper Functions

### isAdmin()
Checks if user has any admin role (staff, moderator, admin, or super_admin)

### hasAdminRole(role)
Checks if user has a specific admin role

### isSuperAdmin()
Checks if user has super_admin role (highest privilege)

### isAdminOrHigher()
Checks if user has admin or super_admin role

### isModeratorOrHigher()
Checks if user has moderator, admin, or super_admin role

### isStaffOrHigher()
Checks if user has staff, moderator, admin, or super_admin role

## Test Scenarios

### 1. Accounts Collection

#### Test: Regular user tries to set their own admin_role (SHOULD FAIL)
```typescript
// Scenario: User creates account with admin_role
{
  uid: "user123",
  email: "user@example.com",
  admin_role: "super_admin" // INVALID - should be rejected
}
// Expected: CREATE denied
```

#### Test: Regular user tries to update their admin_role (SHOULD FAIL)
```typescript
// Scenario: User tries to escalate privileges
// Current: { uid: "user123", email: "user@example.com", admin_role: null }
// Update to: { admin_role: "admin" }
// Expected: UPDATE denied
```

#### Test: Admin tries to set another user's admin_role (SHOULD FAIL)
```typescript
// Scenario: Admin (not super_admin) tries to grant admin role
// Admin UID: "admin123"
// Target UID: "user456"
// Update: { admin_role: "moderator" }
// Expected: UPDATE denied
```

#### Test: Super admin grants admin role (SHOULD SUCCEED)
```typescript
// Scenario: Super admin grants admin role to user
// Super admin UID: "superadmin123"
// Target UID: "user456"
// Update: { admin_role: "admin" }
// Expected: UPDATE allowed
```

#### Test: Super admin removes admin role (SHOULD SUCCEED)
```typescript
// Scenario: Super admin revokes admin role
// Super admin UID: "superadmin123"
// Target UID: "admin456"
// Update: { admin_role: null }
// Expected: UPDATE allowed
```

#### Test: Admin updates user account (not admin_role) (SHOULD SUCCEED)
```typescript
// Scenario: Admin edits user profile data
// Admin UID: "admin123"
// Target UID: "user456"
// Update: { email: "newemail@example.com", admin_role: <unchanged> }
// Expected: UPDATE allowed
```

#### Test: User updates own account (SHOULD SUCCEED)
```typescript
// Scenario: User updates their own profile
// User UID: "user123"
// Update: { email: "newemail@example.com" }
// Expected: UPDATE allowed
```

### 2. Profiles Collection

#### Test: Admin reads all profiles (SHOULD SUCCEED)
```typescript
// Scenario: Admin queries all profiles for management
// Admin UID: "admin123"
// Query: profiles collection
// Expected: READ allowed
```

#### Test: Admin updates any profile (SHOULD SUCCEED)
```typescript
// Scenario: Admin edits user profile for moderation
// Admin UID: "admin123"
// Target profile UID: "user456"
// Update: { bio: "Edited by admin" }
// Expected: UPDATE allowed
```

#### Test: Regular user reads all profiles (SHOULD SUCCEED)
```typescript
// Scenario: Authenticated user browses profiles
// User UID: "user123"
// Query: profiles collection
// Expected: READ allowed (for matching/discovery)
```

#### Test: Super admin deletes profile (SHOULD SUCCEED)
```typescript
// Scenario: Super admin removes inappropriate profile
// Super admin UID: "superadmin123"
// Target profile ID: "profile456"
// Expected: DELETE allowed
```

#### Test: Regular user deletes another's profile (SHOULD FAIL)
```typescript
// Scenario: User tries to delete someone else's profile
// User UID: "user123"
// Target profile UID: "user456"
// Expected: DELETE denied
```

### 3. Productions Collection

#### Test: Admin reads all productions (SHOULD SUCCEED)
```typescript
// Scenario: Admin views all productions
// Admin UID: "admin123"
// Query: productions collection
// Expected: READ allowed
```

#### Test: Admin edits any production (SHOULD SUCCEED)
```typescript
// Scenario: Admin moderates production content
// Admin UID: "admin123"
// Target production account_id: "company456"
// Update: { description: "Edited by admin" }
// Expected: UPDATE allowed
```

#### Test: Company edits own production (SHOULD SUCCEED)
```typescript
// Scenario: Company updates their production
// Company UID: "company123"
// Production account_id: "company123"
// Update: { description: "Updated description" }
// Expected: UPDATE allowed
```

#### Test: Company deletes another company's production (SHOULD FAIL)
```typescript
// Scenario: Company tries to delete competitor's production
// Company UID: "company123"
// Production account_id: "company456"
// Expected: DELETE denied
```

### 4. Role Opportunities Collection

#### Test: Moderator moderates opening (SHOULD SUCCEED)
```typescript
// Scenario: Moderator flags inappropriate opening
// Moderator UID: "moderator123"
// Target opening UID: "user456"
// Update: { status: "removed", moderation_note: "Inappropriate content" }
// Expected: UPDATE allowed
```

#### Test: Staff moderates opening (SHOULD FAIL)
```typescript
// Scenario: Staff (not moderator) tries to moderate
// Staff UID: "staff123"
// Target opening UID: "user456"
// Update: { status: "removed" }
// Expected: UPDATE denied
```

#### Test: Owner updates own opening (SHOULD SUCCEED)
```typescript
// Scenario: User updates their role opportunity
// User UID: "user123"
// Opening UID: "user123"
// Update: { title: "Updated title" }
// Expected: UPDATE allowed
```

### 5. Theatre Requests Collection

#### Test: Admin reads all theatre requests (SHOULD SUCCEED)
```typescript
// Scenario: Admin views pending theater signup requests
// Admin UID: "admin123"
// Query: theatre_requests collection
// Expected: READ allowed
```

#### Test: Admin updates theatre request (approve/reject) (SHOULD SUCCEED)
```typescript
// Scenario: Admin approves theater request
// Admin UID: "admin123"
// Target request user_id: "newcompany123"
// Update: { status: "approved", approved_by: "admin123" }
// Expected: UPDATE allowed
```

#### Test: Regular user reads another's theatre request (SHOULD FAIL)
```typescript
// Scenario: User tries to read another's request
// User UID: "user123"
// Target request user_id: "user456"
// Expected: READ denied
```

#### Test: Request creator reads own request (SHOULD SUCCEED)
```typescript
// Scenario: User checks status of their request
// User UID: "user123"
// Request user_id: "user123"
// Expected: READ allowed
```

### 6. Theatre Talent Matches Collection

#### Test: Admin reads all matches (SHOULD SUCCEED)
```typescript
// Scenario: Admin views all talent-role matches for analytics
// Admin UID: "admin123"
// Query: theater_talent_matches collection
// Expected: READ allowed
```

#### Test: Regular user reads all matches (SHOULD SUCCEED)
```typescript
// Scenario: User views their matches
// User UID: "user123"
// Query: theater_talent_matches collection
// Expected: READ allowed (existing behavior maintained)
```

### 7. Admin Actions Collection

#### Test: Admin creates audit log (SHOULD SUCCEED)
```typescript
// Scenario: Admin logs their action
// Admin UID: "admin123"
// Create: {
//   admin_uid: "admin123",
//   admin_email: "admin@example.com",
//   action_type: "user_edit",
//   target_type: "user",
//   target_id: "user456",
//   timestamp: serverTimestamp()
// }
// Expected: CREATE allowed
```

#### Test: Admin creates audit log with wrong admin_uid (SHOULD FAIL)
```typescript
// Scenario: Admin tries to impersonate another admin in logs
// Admin UID: "admin123"
// Create: {
//   admin_uid: "admin456", // WRONG - not the authenticated user
//   admin_email: "admin@example.com",
//   action_type: "user_edit",
//   target_type: "user",
//   target_id: "user456",
//   timestamp: serverTimestamp()
// }
// Expected: CREATE denied
```

#### Test: Admin creates audit log with invalid action_type (SHOULD FAIL)
```typescript
// Scenario: Admin creates log with invalid action type
// Admin UID: "admin123"
// Create: {
//   admin_uid: "admin123",
//   admin_email: "admin@example.com",
//   action_type: "invalid_action", // NOT in allowed list
//   target_type: "user",
//   target_id: "user456",
//   timestamp: serverTimestamp()
// }
// Expected: CREATE denied
```

#### Test: Admin creates audit log missing required field (SHOULD FAIL)
```typescript
// Scenario: Admin creates incomplete audit log
// Admin UID: "admin123"
// Create: {
//   admin_uid: "admin123",
//   action_type: "user_edit",
//   // Missing: admin_email, target_type, target_id, timestamp
// }
// Expected: CREATE denied
```

#### Test: Admin tries to update audit log (SHOULD FAIL)
```typescript
// Scenario: Admin tries to modify existing audit log
// Admin UID: "admin123"
// Target action ID: "action789"
// Update: { action_type: "different_action" }
// Expected: UPDATE denied (tamper protection)
```

#### Test: Admin tries to delete audit log (SHOULD FAIL)
```typescript
// Scenario: Admin tries to delete audit log
// Admin UID: "admin123"
// Target action ID: "action789"
// Expected: DELETE denied
```

#### Test: Super admin deletes audit log (SHOULD SUCCEED)
```typescript
// Scenario: Super admin cleans up old audit logs
// Super admin UID: "superadmin123"
// Target action ID: "action789"
// Expected: DELETE allowed
```

#### Test: Regular user reads audit logs (SHOULD FAIL)
```typescript
// Scenario: Non-admin user tries to view audit logs
// User UID: "user123"
// Query: admin_actions collection
// Expected: READ denied
```

#### Test: Staff reads audit logs (SHOULD SUCCEED)
```typescript
// Scenario: Staff member views audit logs
// Staff UID: "staff123"
// Query: admin_actions collection
// Expected: READ allowed (all admins can read logs)
```

## Security Principles Verified

1. **Never trust client-side data**: All admin role checks use server-side Firestore document lookups
2. **Validate admin_role exists in accounts collection**: Uses getUserAccount() function to fetch from database
3. **Log all sensitive operations**: admin_actions collection tracks all admin operations
4. **Prevent role escalation**: Only super_admin can grant/revoke admin roles
5. **Audit log integrity**: No updates allowed, only super_admin can delete

## Running Tests

To test these rules:

1. Use Firebase Emulator Suite:
```bash
firebase emulators:start --only firestore
```

2. Write unit tests using @firebase/rules-unit-testing:
```typescript
import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
```

3. Test each scenario with appropriate user contexts:
```typescript
const adminDb = testEnv.authenticatedContext('admin123');
const userDb = testEnv.authenticatedContext('user123');
```

## Notes

- All tests assume proper authentication (request.auth != null)
- Tests verify both positive (SHOULD SUCCEED) and negative (SHOULD FAIL) cases
- Admin role is stored in accounts collection, not as custom auth claim
- Audit logs are immutable once created (no updates)
- Super admin has highest privilege and can manage all aspects
