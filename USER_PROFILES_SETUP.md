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

### 3. Code Implementation Steps

#### Step 1: Create Redux Profile Slice

Create `src/lib/features/profile/profileSlice.js`:

```javascript
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initialState = {
  profile: null,
  loading: false,
  error: null,
  updating: false,
};

// Async thunk to fetch user profile
export const fetchProfile = createAsyncThunk(
  "profile/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const { supabase } = await import("@/lib/supabase/supabase");
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        throw new Error("No valid authentication session found");
      }

      const response = await fetch("/api/profile", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch profile");
      }

      const data = await response.json();
      return data.profile;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to update user profile
export const updateProfile = createAsyncThunk(
  "profile/updateProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      const { supabase } = await import("@/lib/supabase/supabase");
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        throw new Error("No valid authentication session found");
      }

      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      const data = await response.json();
      return data.profile;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to upload avatar
export const uploadAvatar = createAsyncThunk(
  "profile/uploadAvatar",
  async (file, { rejectWithValue }) => {
    try {
      const { supabase } = await import("@/lib/supabase/supabase");
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        throw new Error("No valid authentication session found");
      }

      const formData = new FormData();
      formData.append("avatar", file);

      const response = await fetch("/api/profile/avatar", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload avatar");
      }

      const data = await response.json();
      return data.avatar_url;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearProfile: (state) => {
      state.profile = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setProfile: (state, action) => {
      state.profile = action.payload;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch profile
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.error = null;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update profile
      .addCase(updateProfile.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.updating = false;
        state.profile = action.payload;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      })
      // Upload avatar
      .addCase(uploadAvatar.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        state.updating = false;
        if (state.profile) {
          state.profile.avatar_url = action.payload;
        }
        state.error = null;
      })
      .addCase(uploadAvatar.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      });
  },
});

// Selectors
export const selectProfile = (state) => state.profile.profile;
export const selectProfileLoading = (state) => state.profile.loading;
export const selectProfileUpdating = (state) => state.profile.updating;
export const selectProfileError = (state) => state.profile.error;

export const { clearProfile, clearError, setProfile } = profileSlice.actions;

export default profileSlice.reducer;
```

#### Step 2: Update Redux Store

Update `src/lib/store.js` to include the profile reducer:

```javascript
import { configureStore } from "@reduxjs/toolkit";
import countriesReducer from "./features/countries/countriesSlice";
import favouritesReducer from "./features/favourites/favouritesSlice";
import profileReducer from "./features/profile/profileSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      countries: countriesReducer,
      favourites: favouritesReducer,
      profile: profileReducer,
    },
  });
};
```

#### Step 3: Create Profile API Routes

Create `src/app/api/profile/route.js`:

```javascript
import {
  getAuthenticatedUser,
  supabaseServer,
} from "@/lib/supabase/supabase-server";
import { NextResponse } from "next/server";

// GET - Fetch user profile
export async function GET(request) {
  try {
    const { user, error: authError } = await getAuthenticatedUser(request);
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile, error } = await supabaseServer
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        const { data: newProfile, error: createError } = await supabaseServer
          .from("user_profiles")
          .insert({
            user_id: user.id,
            display_name:
              user.user_metadata?.name || user.email?.split("@")[0] || "User",
            avatar_url: user.user_metadata?.avatar_url || null,
          })
          .select()
          .single();

        if (createError) {
          return NextResponse.json(
            { error: "Failed to create profile" },
            { status: 500 }
          );
        }
        return NextResponse.json({ profile: newProfile });
      }
      return NextResponse.json(
        { error: "Failed to fetch profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({ profile });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update user profile
export async function PUT(request) {
  try {
    const { user, error: authError } = await getAuthenticatedUser(request);
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { username, display_name, bio, avatar_url } = await request.json();

    if (username && username.length < 3) {
      return NextResponse.json(
        { error: "Username must be at least 3 characters long" },
        { status: 400 }
      );
    }

    if (username && !/^[a-zA-Z0-9_-]+$/.test(username)) {
      return NextResponse.json(
        {
          error:
            "Username can only contain letters, numbers, hyphens, and underscores",
        },
        { status: 400 }
      );
    }

    const updateData = {};
    if (username !== undefined) updateData.username = username;
    if (display_name !== undefined) updateData.display_name = display_name;
    if (bio !== undefined) updateData.bio = bio;
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url;

    const { data: profile, error } = await supabaseServer
      .from("user_profiles")
      .update(updateData)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      if (error.code === "23505" && error.message.includes("username")) {
        return NextResponse.json(
          { error: "Username is already taken" },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({ profile });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

#### Step 4: Create Avatar Upload API Route

Create `src/app/api/profile/avatar/route.js`:

```javascript
import {
  getAuthenticatedUser,
  supabaseServer,
} from "@/lib/supabase/supabase-server";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { user, error: authError } = await getAuthenticatedUser(request);
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("avatar");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.",
        },
        { status: 400 }
      );
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    const fileExtension = file.name.split(".").pop();
    const fileName = `${user.id}-${Date.now()}.${fileExtension}`;
    const filePath = `avatars/${fileName}`;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const { error: uploadError } = await supabaseServer.storage
      .from("avatars")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: "Failed to upload image" },
        { status: 500 }
      );
    }

    const { data: urlData } = supabaseServer.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const avatar_url = urlData.publicUrl;

    const { data: profile, error: updateError } = await supabaseServer
      .from("user_profiles")
      .update({ avatar_url })
      .eq("user_id", user.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update profile with new avatar" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      avatar_url,
      profile,
      message: "Avatar uploaded successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

#### Step 5: Create ProfileManager Component

Create `src/components/ProfileManager.jsx`:

```javascript
"use client";
import { useAuth } from "@/app/context/AuthContext";
import {
  fetchProfile,
  selectProfile,
  selectProfileError,
  selectProfileLoading,
  selectProfileUpdating,
  updateProfile,
  uploadAvatar,
} from "@/lib/features/profile/profileSlice";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const ProfileManager = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const profile = useSelector(selectProfile);
  const loading = useSelector(selectProfileLoading);
  const updating = useSelector(selectProfileUpdating);
  const error = useSelector(selectProfileError);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    display_name: "",
    bio: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      dispatch(fetchProfile());
    }
  }, [user, dispatch]);

  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || "",
        display_name: profile.display_name || "",
        bio: profile.bio || "",
      });
    }
  }, [profile]);

  const handleInputChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setAvatarPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      if (avatarFile) {
        await dispatch(uploadAvatar(avatarFile)).unwrap();
        setAvatarFile(null);
        setAvatarPreview(null);
      }
      await dispatch(updateProfile(formData)).unwrap();
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        username: profile.username || "",
        display_name: profile.display_name || "",
        bio: profile.bio || "",
      });
    }
    setAvatarFile(null);
    setAvatarPreview(null);
    setIsEditing(false);
  };

  if (!user) {
    return (
      <Card>
        <CardContent>
          <Typography variant="body1" color="text.secondary">
            Please log in to manage your profile.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" p={3}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h5" component="h2">
            Profile Settings
          </Typography>
          {!isEditing ? (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </Button>
          ) : (
            <Box display="flex" gap={1}>
              <Button
                variant="outlined"
                onClick={handleCancel}
                disabled={updating}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={
                  updating ? <CircularProgress size={16} /> : <SaveIcon />
                }
                onClick={handleSave}
                disabled={updating}
              >
                Save Changes
              </Button>
            </Box>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box display="flex" flexDirection="column" gap={3}>
          <Box display="flex" alignItems="center" gap={3}>
            <Box position="relative">
              <Avatar
                src={
                  avatarPreview ||
                  profile?.avatar_url ||
                  user?.user_metadata?.avatar_url
                }
                sx={{ width: 100, height: 100 }}
              >
                {(profile?.display_name || user?.email || "U")[0].toUpperCase()}
              </Avatar>
              {isEditing && (
                <IconButton
                  sx={{
                    position: "absolute",
                    bottom: -5,
                    right: -5,
                    backgroundColor: "primary.main",
                    color: "white",
                    "&:hover": { backgroundColor: "primary.dark" },
                  }}
                  size="small"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <CameraAltIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
            <Box>
              <Typography variant="h6">
                {profile?.display_name || user?.user_metadata?.name || "User"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
              {profile?.username && (
                <Typography variant="body2" color="text.secondary">
                  @{profile.username}
                </Typography>
              )}
            </Box>
          </Box>

          <TextField
            label="Display Name"
            value={formData.display_name}
            onChange={handleInputChange("display_name")}
            disabled={!isEditing}
            fullWidth
            helperText="Your public display name"
          />

          <TextField
            label="Username"
            value={formData.username}
            onChange={handleInputChange("username")}
            disabled={!isEditing}
            fullWidth
            helperText="Unique username (letters, numbers, hyphens, underscores only)"
          />

          <TextField
            label="Bio"
            value={formData.bio}
            onChange={handleInputChange("bio")}
            disabled={!isEditing}
            fullWidth
            multiline
            rows={3}
            helperText="Tell others about yourself"
          />

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            style={{ display: "none" }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProfileManager;
```

#### Step 6: Create Profile Page

Create `src/app/profile/page.jsx`:

```javascript
"use client";
import { useAuth } from "@/app/context/AuthContext";
import ProfileManager from "@/components/ProfileManager";
import { fetchProfile } from "@/lib/features/profile/profileSlice";
import { Box, Typography } from "@mui/material";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const ProfilePage = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();

  useEffect(() => {
    if (user) {
      dispatch(fetchProfile());
    }
  }, [user, dispatch]);

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
      <Typography variant="h4" gutterBottom>
        My Profile
      </Typography>
      <ProfileManager />
    </Box>
  );
};

export default ProfilePage;
```

#### Step 7: Update Navigation

Update `src/components/Navigaton.jsx` to include the profile link:

```javascript
// Add this after the favourites button in the navigation
{
  user && (
    <Button color="inherit" onClick={() => router.push("/profile")}>
      Profile
    </Button>
  );
}
```

### 4. Features Implemented

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
