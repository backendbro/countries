"use client";

import { useRouter } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

const { useAuth } = require("@/app/context/AuthContext");
const { AppBar, Toolbar, Button } = require("@mui/material");

const Navigation = ({ children }) => {
  const { user, signOut } = useAuth();
  const router = useRouter();

  return (
    <div>
      <AppBar position="static" color="gradient" sx={{ mb: 3 }}>
        <Toolbar>
          <Button color="inherit" onClick={() => router.push("/countries")}>
            Countries
          </Button>
          <Button color="inherit" onClick={() => router.push("/example")}>
            Example
          </Button>
          <Button color="inherit" onClick={() => router.push("/protected")}>
            Protected
          </Button>
          {user && (
            <Button color="inherit" onClick={() => signOut()}>
              Logout
            </Button>
          )}
          {!user && (
            <Button color="inherit" onClick={() => router.push("/login")}>
              Login
            </Button>
          )}
          {
           user && (
            <Button color="inherit" onClick={() => router.push("/profile")}>
                Profile
            </Button>
            )}
          <ThemeToggle />
        </Toolbar>
      </AppBar>
      {children}
    </div>
  );
};

export default Navigation;
