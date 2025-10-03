# User Profiles Feature Setup Guide (Phase 2)

This guide will help you set up the user profiles feature for your Countries Next.js application. This is Phase 2 of the implementation, building on top of the favourites feature from Phase 1.

## Prerequisites

- ✅ Phase 1 (Favourites feature) must be completed first
- ✅ Supabase project with authentication enabled
- ✅ Environment variables configured from Phase 1

## Phase 2: User Profiles Feature Implementation

### 1. Database Setup

Run the SQL commands in `supabase-profiles-setup.sql` in your Supabase SQL Editor:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase-profiles-setup.sql`
4. Run the query

This will create:

- `user_profiles` table with proper structure
- Row Level Security (RLS) policies for profiles
- Automatic profile creation trigger on user signup
- Necessary indexes for performance
- Username uniqueness constraints

### 2. Storage Setup (CRITICAL - Required for Avatar Uploads)

⚠️ **IMPORTANT**: You must create the storage bucket or avatar uploads will fail!

**Option A: Via Supabase Dashboard (Recommended)**

1. Go to **Storage** in your Supabase dashboard
2. Click **"Create a new bucket"**
3. Set **Name**: `avatars`
4. **Enable "Public bucket"** ✅ (critical for avatar access)
5. Optional: Set file size limit to 5MB

**Option B: Via SQL (Automated)**
The updated `supabase-profiles-setup.sql` now includes bucket creation. Just run the SQL file and it will create everything automatically.

**Storage Policies** (automatically created by SQL):

```sql
-- Allow authenticated users to upload their own avatars
CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow public access to view avatars
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Allow users to update their own avatars
CREATE POLICY "Users can update own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own avatars
CREATE POLICY "Users can delete own avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

### 3. Features Implemented

#### ✅ Database & Security

- Secure user profiles table with RLS policies
- Automatic profile creation on user signup
- Username uniqueness validation
- Avatar storage with proper permissions

#### ✅ Redux State Management

- `profileSlice.js` for managing profile state
- Async thunks for profile operations (fetch, update, upload avatar)
- Proper error handling and loading states
- Profile caching and state management

#### ✅ API Routes

- `GET /api/profile` - Fetch user profile (auto-creates if missing)
- `PUT /api/profile` - Update profile information
- `POST /api/profile/avatar` - Upload avatar image
- Secure authentication and validation

#### ✅ UI Components

- `ProfileManager` component for profile editing
- Profile page (`/profile`) for profile management
- Avatar upload with preview functionality
- Form validation and error handling
- Navigation integration

### 4. Profile Features

#### 🎯 **Profile Information**

- **Display Name**: Public name shown to other users
- **Username**: Unique identifier (optional)
- **Bio**: Personal description
- **Avatar**: Profile picture upload

#### 🔒 **Security Features**

- User can only edit their own profile
- Username uniqueness validation
- File type and size validation for avatars
- Secure image upload to Supabase Storage

#### 🎨 **User Experience**

- Inline editing with save/cancel options
- Real-time avatar preview
- Form validation with helpful error messages
- Loading states and progress indicators

### 5. How to Use

1. **Login**: Users must be authenticated to access profile features
2. **Auto Profile Creation**: Profile is automatically created on first login
3. **Edit Profile**: Click "Edit Profile" button to modify information
4. **Upload Avatar**: Click camera icon on avatar to upload new image
5. **Save Changes**: Click "Save Changes" to persist updates

### 6. File Structure

```
src/
├── app/
│   ├── api/
│   │   └── profile/
│   │       ├── route.js              # Profile CRUD endpoints
│   │       └── avatar/
│   │           └── route.js          # Avatar upload endpoint
│   └── profile/
│       └── page.jsx                  # Profile management page
├── components/
│   └── ProfileManager.jsx            # Profile editing component
└── lib/
    └── features/
        └── profile/
            └── profileSlice.js       # Redux slice for profiles
```

### 7. Environment Variables

No additional environment variables are required beyond Phase 1. The existing Supabase configuration handles both favourites and profiles.

### 8. Avatar Upload Specifications

- **Supported Formats**: JPEG, PNG, GIF, WebP
- **Maximum Size**: 5MB per image
- **Storage**: Supabase Storage bucket (`avatars`)
- **Access**: Public read access for display
- **Security**: Users can only upload/modify their own avatars

### 9. Database Schema

#### user_profiles table:

```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key to auth.users, Unique)
- username: TEXT (Unique, Optional)
- display_name: TEXT
- avatar_url: TEXT
- bio: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### 10. API Endpoints

#### GET /api/profile

- Fetches current user's profile
- Auto-creates profile if it doesn't exist
- Returns profile data

#### PUT /api/profile

- Updates profile information
- Validates username format and uniqueness
- Returns updated profile

#### POST /api/profile/avatar

- Uploads avatar image
- Validates file type and size
- Updates profile with new avatar URL
- Returns new avatar URL

### 11. Integration with Existing Features

The profile system integrates seamlessly with:

- **Authentication**: Uses existing auth system
- **Favourites**: Profile info can be displayed alongside favourites
- **Navigation**: Profile link appears for authenticated users
- **Redux Store**: Shares the same store with other features

### 12. Troubleshooting

#### Common Issues

1. **"Failed to create profile"**

   - Ensure the user_profiles table exists
   - Check RLS policies are properly configured
   - Verify the auto-creation trigger is active

2. **"Username is already taken"**

   - Username must be unique across all users
   - Try a different username

3. **Avatar upload fails**

   - Ensure the `avatars` storage bucket exists
   - Check file size (max 5MB) and type (image formats only)
   - Verify storage RLS policies are configured

4. **Profile not loading**
   - Check authentication status
   - Verify API routes are accessible
   - Check browser console for errors

### 13. Testing the Feature

1. **Login** to the application
2. **Navigate** to the Profile page via the navigation menu
3. **Edit Profile** by clicking the "Edit Profile" button
4. **Upload Avatar** by clicking the camera icon
5. **Update Information** (display name, username, bio)
6. **Save Changes** and verify updates persist

### 14. Future Enhancements

Potential future improvements:

- Profile visibility settings (public/private)
- Profile viewing for other users
- Social features (follow/unfollow)
- Profile statistics and activity
- Advanced avatar editing (crop, resize)
- Profile themes and customization

## Summary

Phase 2 adds comprehensive user profile management to your application, allowing users to:

- ✅ Manage their profile information
- ✅ Upload and change avatar images
- ✅ Set unique usernames and display names
- ✅ Add personal bio information
- ✅ Maintain secure, private profile data

The implementation follows security best practices and integrates seamlessly with the existing favourites feature from Phase 1.
