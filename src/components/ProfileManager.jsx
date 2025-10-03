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