# Firebase Storage Migration Guide

## Overview
This guide outlines the changes needed to migrate from the current wide-open Firebase Storage rules to properly secured rules that match your Firestore security model.

## New Storage Rules Structure

### File Paths
- **Profile Pictures**: `/profiles/{userId}/profile-picture/{fileName}`
- **Production Images**: `/productions/{productionId}/images/{fileName}`
- **Event Images**: `/events/{eventId}/images/{fileName}`
- **Company Logos**: `/companies/{companyId}/logo/{fileName}`
- **General User Uploads**: `/users/{userId}/uploads/{fileName}`
- **Temporary Files**: `/temp/{userId}/{fileName}`

### Security Rules
- Most file access requires authentication
- Users can only upload/modify their own files
- Production owners can upload production images
- Event images are publicly readable (since events are public)
- Default deny for all unspecified paths

## Code Changes Made

### 1. Updated Components

#### Profile Photo Components
- `src/components/SignUp/Individual/ProfilePhoto.tsx`
  - **Old**: `/files-${data.uid}/${data.account_id}-${file.name}`
  - **New**: `/profiles/${data.uid}/profile-picture/${file.name}`

- `src/components/SignUp/Company/Photo.tsx`
  - **Old**: `/files-${data?.account_id}/${file.name}`
  - **New**: `/profiles/${data?.uid}/profile-picture/${file.name}`

- `src/components/Profile/Form/Photo.tsx`
  - **Old**: `/files/${data.account_id}/${file.name}`
  - **New**: `/profiles/${data.uid}/profile-picture/${file.name}`

#### Production Image Components
- `src/components/shared/ImageUpload.tsx`
  - Added `productionId` prop
  - Updated to use proper paths based on type:
    - User type: `/profiles/${data.uid}/profile-picture/${file?.name}`
    - Poster type with productionId: `/productions/${productionId}/images/${file?.name}`
    - Fallback: `/users/${data.uid}/uploads/${file?.name}`

- `src/components/Profile/Company/Production/Manage/ManageProductionBasic.tsx`
  - Added `productionId={formValues?.production_id}` prop to ImageUpload

#### Additional Photos
- `src/components/Profile/Form/AdditionalPhoto.tsx`
  - **Old**: `/files-${data.account_id}/${file.name}`
  - **New**: `/users/${data.uid}/uploads/${file.name}`

### 2. Storage Rules File
- Created `storage.rules` with comprehensive security rules
- Replaces the current wide-open rules

## Deployment Steps

1. **Deploy Storage Rules**:
   ```bash
   firebase deploy --only storage
   ```

2. **Test Uploads**: Verify that all image uploads work correctly with the new paths

3. **Monitor**: Check Firebase Console for any permission errors

## Notes

- The `ProductionPhoto.tsx` component appears to be unused and can be removed if not needed
- For new productions (AddProduction), images will initially upload to `/users/{userId}/uploads/` since no production ID exists yet
- All existing images will need to be migrated to the new paths or the old paths will need to be added to the storage rules temporarily

## Rollback Plan

If issues arise, you can temporarily revert to the old rules:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

But this should only be used temporarily while fixing any issues. 