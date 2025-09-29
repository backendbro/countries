"use client";

import { useTheme } from "@/app/context/ThemeContext";
import { Brightness4, Brightness7 } from "@mui/icons-material";
import { IconButton } from "@mui/material";

export default function ThemeToggle() {
  const { isDarkMode, toggleTheme, isHydrated } = useTheme();

  // Don't render until hydrated to prevent mismatch
  if (!isHydrated) {
    return (
      <IconButton disabled>
        <Brightness4 />
      </IconButton>
    );
  }

  return (
    <IconButton onClick={toggleTheme}>
      {isDarkMode ? <Brightness7 /> : <Brightness4 />}
    </IconButton>
  );
}
