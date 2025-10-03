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