"use client";
import { useAuth } from "@/app/context/AuthContext";
import { addFavorite,removeFavorite,} from "@/lib/features/favourites/favouritesSlice";
import { Favorite, FavoriteBorder } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
 
function FavoriteButton({ country, variant = "button" }) {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const favorites = useSelector((state) => state)
  console.log(favorites)
  const isFavorite = useSelector((state) => state.favorites.favorites.some((fav) => fav.country_name === country?.name?.common)
  );
 
  const loading = useSelector((state) => state.favorites.loading);
 
  const toggleFavorite = () => {
    if (isFavorite) {
      dispatch(removeFavorite(country.name.common));
    } else {
 
      dispatch(addFavorite(country));
    }
  };
  if (!user) return null;
 
  return (
    <Tooltip title={isFavorite ? "Remove from favorites" : "Add to favorites"}>
      <IconButton
        onClick={toggleFavorite}
        disabled={loading}
        color={isFavorite ? "error" : "primary"}
      >
        {isFavorite ? <Favorite /> : <FavoriteBorder />}
      </IconButton>
    </Tooltip>
  );
}
 
export default FavoriteButton;
 