# Favourites Feature Setup Guide

This guide will help you set up the favourites feature for your Countries Next.js application.

## Phase 1: Favourites Feature Implementation ✅

### 1. Database Setup

Run the SQL commands in `supabase-setup.sql` in your Supabase SQL Editor:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase-setup.sql`
4. Run the query

This will create:

- `favourites` table with proper structure
- Row Level Security (RLS) policies
- Necessary indexes for performance
- Triggers for automatic timestamp updates

### 2. Environment Variables

Add the following to your `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenWeather API (if using weather feature)
NEXT_PUBLIC_OPENWEATHERAPI=your_openweather_api_key
```

**Important**: The `SUPABASE_SERVICE_ROLE_KEY` is required for the API routes to work properly. You can find this in your Supabase project settings under "API" section.

### 3. Features Implemented

#### ✅ Database & Security

- Secure favourites table with RLS policies
- User-specific data isolation
- Unique constraints to prevent duplicate favourites

#### ✅ Redux State Management

- `favouritesSlice.js` for managing favourites state
- Async thunks for API operations (fetch, add, remove)
- Proper error handling and loading states

#### ✅ API Routes

- `GET /api/favourites` - Fetch user's favourites
- `POST /api/favourites` - Add a new favourite
- `DELETE /api/favourites` - Remove a favourite
- Secure authentication using JWT tokens

#### ✅ UI Components

- `FavouriteButton` component for toggling favourites
- Favourites page (`/favourites`) to view saved countries
- Integration with existing country pages
- Navigation link (only visible when logged in)

### 4. How to Use

1. **Login**: Users must be authenticated to use favourites
2. **Add Favourites**: Click the heart icon on any country page
3. **View Favourites**: Navigate to "Favourites" in the navigation menu
4. **Remove Favourites**: Click the filled heart icon to remove from favourites

### 5. Security Features

- **Row Level Security**: Users can only access their own favourites
- **JWT Authentication**: All API calls require valid authentication tokens
- **Server-side Validation**: Proper user verification in API routes
- **Unique Constraints**: Prevents duplicate favourites per user

## Phase 2: User Profile Feature (Planned)

The following features are planned for Phase 2:

### 🔄 User Profiles Table

- Create `user_profiles` table with RLS policies
- Link to auth.users table
- Fields for username/alias and profile picture

### 🔄 Profile Management

- Redux slice for profile state management
- API routes for profile updates
- Profile management UI component
- Avatar upload functionality

### 🔄 Profile Features

- Update username/alias
- Upload/change profile picture
- Maintain auth table integrity
- Profile display in navigation

## Troubleshooting

### Common Issues

1. **"No authentication token found"**

   - Ensure user is logged in
   - Check that Supabase auth is working properly

2. **"Failed to fetch favourites"**

   - Verify `SUPABASE_SERVICE_ROLE_KEY` is set correctly
   - Check Supabase RLS policies are applied

3. **Database connection errors**
   - Verify Supabase URL and keys are correct
   - Ensure the favourites table exists

### Testing the Feature

1. Login to the application
2. Navigate to any country page
3. Click the heart icon to add to favourites
4. Visit the Favourites page to see saved countries
5. Click the filled heart to remove from favourites

## File Structure

```
src/
├── app/
│   ├── api/
│   │   └── favourites/
│   │       └── route.js          # Favourites API endpoints
│   └── favourites/
│       └── page.jsx              # Favourites page component
├── components/
│   └── FavouriteButton.jsx       # Favourite toggle button
└── lib/
    ├── features/
    │   └── favourites/
    │       └── favouritesSlice.js # Redux slice for favourites
    └── supabase/
        └── supabase-server.js    # Server-side Supabase client
```

## Next Steps

After setting up the favourites feature, you can proceed with Phase 2 to implement user profiles, or extend the current favourites feature with additional functionality like:

- Favourite categories/tags
- Export favourites list
- Share favourite countries
- Favourite statistics and analytics
