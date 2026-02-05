import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { supabase } from "../../supabase/supabase";
 
const initialState = {
  favorites: [],
  loading: false,
};
 
const getCurrentSession = async () => {
  const { supabase } = await import("../../supabase/supabase");
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error || !session?.access_token) {
    throw new Error("No valid authentication session found");
  }
  return session;
};
 
export const fetchFavorites = createAsyncThunk(
  "favorites/fetchFavorites",
  async (_, { rejectWithValue }) => {
    try {
      await getCurrentSession();
      const { supabase } = await import("../../supabase/supabase");
      const { data, error } = await supabase
        .from("favourites")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);
 
export const addFavorite = createAsyncThunk(
  "favorites/addFavorite",
  async (countryData, { rejectWithValue }) => {
    try {
      const session = await getCurrentSession();
      const { supabase } = await import("../../supabase/supabase");
      const { data, error } = await supabase
        .from("favourites")
        .insert({
            user_id:session.user.id,
          country_name: countryData.name,
          country_data: countryData,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);
 
export const removeFavorite = createAsyncThunk(
  "favorites/removeFavorite",
  async (countryName, { rejectWithValue }) => {
    try {
      await getCurrentSession();
      const { supabase } = await import("../../supabase/supabase");
      const { data, error } = await supabase
        .from("favourites")
        .delete()
        .eq("country_name", countryName)
        .select()
        .single();
      if (error) throw error;
      return countryName;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);
 
export const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.favorites = action.payload;
        state.loading = false;
      })
      .addCase(fetchFavorites.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(addFavorite.fulfilled, (state, action) => {
        state.favorites.push(action.payload);
        state.loading = false;
      })
      .addCase(addFavorite.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeFavorite.fulfilled, (state, action) => {
        state.favorites = state.favorites.filter((favorite) => {
          favorite.country_name !== action.payload;
        });
        state.loading = false;
      })
      .addCase(removeFavorite.pending, (state) => {
        state.loading = true;
      });
  },
});
export default favoritesSlice.reducer;
 