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
      // Import supabase client to get current session
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
      // Import supabase client to get current session
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
      // Import supabase client to get current session
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
