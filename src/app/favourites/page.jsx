'use client'
 
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useDispatch, useSelector } from "react-redux";
import { fetchFavourites } from "@/lib/features/favourites/favouritesSlice";
import { Box, Grid, Typography, Card, CardActionArea, CardContent, IconButton, Tooltip, CircularProgress } from "@mui/material";
import Image from "next/image"; // if using Next.js Image
 import { fetchFavorites } from "@/lib/features/favourites/favouritesSlice";
 
 
const FavouritesPage = () => {
    const {user, loading: authLoading} = useAuth();
    const dispatch = useDispatch();
    const favorites = useSelector((state) => state.favorites.favorites);
    const loading = useSelector((state) => state.favorites.loading);
 
 
    console.log("Favourites: ", favorites);
 
    useEffect(() => {
        if (user) {
            dispatch(fetchFavorites());
        }
    }, [user, dispatch]);
 
    if (authLoading || loading) {
        return <CircularProgress />
    }
 
    // if we have user logged in show "Favourites in use here"
    // if we dont have user logged in show, 'please login'
 
    if(!user) {
        return <div>Please login to see favourites</div>
    }
   
    
    return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
        {favorites.length === 0 ? (
        <Typography variant="h4">No favourites found</Typography>
        ) : (
        <Grid container spacing={2}>
            {favorites.map((favourite) => {
            const country = favourite.country_data;
    
            return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={favourite.id}>
                <Card>
                    <CardActionArea>
                    <CardContent>
                        <Image
                        width={100}
                        height={60}
                        style={{ objectFit: "cover", borderRadius: "4px" }}
                        src={country.flags?.svg}
                        alt={country.name?.common || "Country flag"}
                        />
                    </CardContent>
                    </CardActionArea>
                </Card>
                </Grid>
            );
            })}
        </Grid>
        )}
    </Box>
    );

    
}
 
 
 
export default FavouritesPage;