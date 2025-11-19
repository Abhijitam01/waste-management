# Firebase Storage CORS Error Fix

## Problem
Firebase Storage is returning 404 errors and CORS preflight failures when trying to upload/access images.

## Root Causes
1. **File naming issues**: Special characters in filenames can cause problems
2. **Missing metadata**: Uploads without proper content type
3. **Storage rules**: Firebase Storage security rules might be blocking access
4. **CORS configuration**: Firebase Storage bucket CORS settings

## Solutions Implemented

### 1. File Name Sanitization
- Sanitize filenames to remove special characters
- Convert to lowercase for consistency
- Use timestamp prefix to ensure uniqueness

### 2. Upload Metadata
- Added `contentType` metadata
- Added custom metadata with upload timestamp
- Proper error handling for storage failures

### 3. Error Handling
- Try-catch blocks around storage operations
- Reports are saved even if image upload fails
- Clear error messages for users

## Firebase Storage Rules Configuration

You need to configure Firebase Storage rules in the Firebase Console:

1. Go to Firebase Console → Storage → Rules
2. Update rules to allow authenticated uploads:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated users to upload images
    match /waste_images/{imageId} {
      allow read: if true; // Public read access
      allow write: if request.auth != null; // Authenticated write
      allow delete: if request.auth != null;
    }
  }
}
```

Or for development (less secure):

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true; // Allow all for development
    }
  }
}
```

## CORS Configuration

If you're still getting CORS errors, you may need to configure CORS on the Firebase Storage bucket:

1. Install Google Cloud SDK
2. Run this command (replace `your-bucket-name`):

```bash
gsutil cors set cors.json gs://your-bucket-name
```

Create `cors.json`:
```json
[
  {
    "origin": ["http://localhost:3000", "https://your-domain.com"],
    "method": ["GET", "POST", "PUT", "DELETE", "HEAD"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "Authorization"]
  }
]
```

## Testing

1. **Check Firebase Storage Console**:
   - Go to Firebase Console → Storage
   - Verify files are being uploaded
   - Check file permissions

2. **Check Browser Console**:
   - Look for specific error messages
   - Check network tab for failed requests

3. **Verify Authentication**:
   - Ensure user is logged in
   - Check Firebase Auth rules

## Common Issues

### Issue: 404 Not Found
**Solution**: 
- Check if storage bucket name is correct in `.env.local`
- Verify `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` matches your Firebase project

### Issue: CORS Preflight Failed
**Solution**:
- Configure CORS on Firebase Storage bucket (see above)
- Check Firebase Storage rules allow the operation
- Ensure user is authenticated

### Issue: Permission Denied
**Solution**:
- Update Firebase Storage rules (see above)
- Ensure user is logged in
- Check Firebase project permissions

## Environment Variables

Ensure these are set in `web-platform/.env.local`:

```env
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-bucket-name.appspot.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
```

## Code Changes

The following improvements were made:

1. **File name sanitization** in both `WasteDetectionModal.tsx` and `report/page.tsx`
2. **Metadata addition** to uploads
3. **Error handling** to save reports even if image upload fails
4. **Better error messages** for users

## Next Steps

1. Update Firebase Storage rules in Firebase Console
2. Configure CORS if needed
3. Test image uploads
4. Verify images appear in Firebase Storage console
5. Check that download URLs work correctly

