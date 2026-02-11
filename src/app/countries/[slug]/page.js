"use client";
import { useAuth } from "@/app/context/AuthContext";
import FavouriteButton from "@/components/FavouriteButton";
import {
  clearSelectedCountry,
  setSelectedCountry,
  selectCountryByName,
  fetchCountries,
} from "@/lib/features/countries/countriesSlice";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const CountryPage = () => {
  // 1. Get URL parameters and setup hooks
  const { slug } = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useAuth();

  // 2. Get country data from Redux store
  const { selectedCountry, loading, error, countries } = useSelector(
    (state) => state.countries,
  );

  useEffect(() => {
    if (countries.length === 0) {
      dispatch(fetchCountries());
    }
  }, []);

  // 3. Weather state (we'll add this functionality later)
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState(null);

  const fetchWeatherData = async (capital) => {
    if (!capital) return;
    setWeatherLoading(true);
    setWeatherError(null);

    try {
      const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHERAPI;
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(capital)}&appid=${API_KEY}&units=metric`,
      );

      if (!response.ok) {
        throw new Error("Weather data not available");
      }

      const data = await response.json();
      setWeatherData(data);
    } catch (err) {
      setWeatherError(err.message);
      console.error("Weather fetch error:", err);
    } finally {
      setWeatherLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCountry?.capital?.[0]) {
      fetchWeatherData(selectedCountry.capital[0]);
    }
  }, [selectedCountry]);

  // 4. Find and set country data from existing store data
  useEffect(() => {
    if (slug && countries.length > 0) {
      // Convert URL slug back to country name
      const countryName = decodeURIComponent(slug.replace(/-/g, " "));
      // Find country in existing data (no API call needed!)
      const foundCountry = countries.find(
        (country) =>
          country.name.common.toLowerCase() === countryName.toLowerCase() ||
          country.name.official.toLowerCase() === countryName.toLowerCase(),
      );

      if (foundCountry) {
        dispatch(setSelectedCountry(foundCountry));
      } else {
        dispatch(clearSelectedCountry());
      }
    }

    // Cleanup when component unmounts
    return () => {
      dispatch(clearSelectedCountry());
    };
  }, [slug, countries, dispatch]);

  // 5. Navigation handler
  const handleBack = () => {
    router.push("/countries");
  };

  // 6. Loading state - only when countries data is being fetched initially
  if (loading || countries.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <Typography variant="h6">Loading countries data...</Typography>
      </Box>
    );
  }

  // 7. Error state
  if (error) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
        gap={2}
      >
        <Typography variant="h6" color="error">
          Error loading country: {error}
        </Typography>
        <Button
          variant="contained"
          onClick={handleBack}
          startIcon={<ArrowBackIcon />}
        >
          Back to Countries
        </Button>
      </Box>
    );
  }

  // 8. No data state
  if (!selectedCountry) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
        gap={2}
      >
        <Typography variant="h6">Country not found</Typography>
        <Button
          variant="contained"
          onClick={handleBack}
          startIcon={<ArrowBackIcon />}
        >
          Back to Countries
        </Button>
      </Box>
    );
  }

  // 9. Helper functions for data formatting
  const getCurrencies = (country) => {
    if (!country.currencies) return "N/A";
    return Object.values(country.currencies)
      .map((currency) => `${currency.name} (${currency.symbol})`)
      .join(", ");
  };

  const getLanguages = (country) => {
    if (!country.languages) return "N/A";
    return Object.values(country.languages).join(", ");
  };

  const formatPopulation = (population) => {
    return new Intl.NumberFormat().format(population);
  };

  // 10. Main component render
  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
      {/* Back Button */}
      <Button
        variant="outlined"
        onClick={handleBack}
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 3 }}
      >
        Back to Countries
      </Button>

      {user && (
        <Box>
          <FavouriteButton country={selectedCountry} />
        </Box>
      )}

      {/* Main Content */}
      <Paper elevation={3} sx={{ p: 4 }}>
        <Grid container spacing={4}>
          {/* Flag and Basic Info */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  gap={3}
                >
                  <Image
                    width={300}
                    height={200}
                    style={{
                      objectFit: "cover",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                    }}
                    src={
                      selectedCountry.flags?.svg || selectedCountry.flags?.png
                    }
                    alt={`Flag of ${selectedCountry.name?.common}`}
                    priority
                  />
                  <Box textAlign="center">
                    <Typography variant="h3" component="h1" gutterBottom>
                      {selectedCountry.name?.common}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Detailed Information */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Country Details
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box display="flex" flexDirection="column" gap={2}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Population
                    </Typography>
                    <Typography variant="body1">
                      {formatPopulation(selectedCountry.population)}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Capital
                    </Typography>
                    <Typography variant="body1">
                      {selectedCountry.capital?.join(", ") || "N/A"}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Languages
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      {getLanguages(selectedCountry)
                        .split(", ")
                        .map((language, index) => (
                          <Chip
                            key={index}
                            label={language}
                            variant="outlined"
                            size="small"
                            sx={{ mr: 1, mb: 1 }}
                          />
                        ))}
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Weather Section */}
        {selectedCountry?.capital?.[0] && (
          <Grid container spacing={4} sx={{ mt: 2 }}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    Weather in {selectedCountry.capital[0]}
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  {weatherLoading && (
                    <Box
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                      minHeight="200px"
                    >
                      <Typography variant="body1">
                        Loading weather data...
                      </Typography>
                    </Box>
                  )}

                  {weatherError && (
                    <Box
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                      minHeight="200px"
                    >
                      <Typography variant="body1" color="error">
                        {weatherError}
                      </Typography>
                    </Box>
                  )}

                  {weatherData && !weatherLoading && (
                    <Grid container spacing={3}>
                      {/* Current Weather */}
                      <Grid item xs={12} md={6}>
                        <Box
                          display="flex"
                          flexDirection="column"
                          alignItems="center"
                          gap={2}
                        >
                          <Box display="flex" alignItems="center" gap={2}>
                            <Image
                              width={80}
                              height={80}
                              src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
                              alt={weatherData.weather[0].description}
                            />
                            <Box>
                              <Typography variant="h3" component="div">
                                {Math.round(weatherData.main.temp)}°C
                              </Typography>
                              <Typography variant="h6" color="text.secondary">
                                {weatherData.weather[0].main}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Grid>

                      {/* Weather Details */}
                      <Grid item xs={12} md={6}>
                        <Box display="flex" flexDirection="column" gap={1.5}>
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="body1" fontWeight="bold">
                              Humidity:
                            </Typography>
                            <Typography variant="body1">
                              {weatherData.main.humidity}%
                            </Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="body1" fontWeight="bold">
                              Wind Speed:
                            </Typography>
                            <Typography variant="body1">
                              {weatherData.wind.speed} m/s
                            </Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="body1" fontWeight="bold">
                              Feels like:
                            </Typography>
                            <Typography variant="body1">
                              {Math.round(weatherData.main.feels_like)}°C
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Paper>
    </Box>
  );
};

export default CountryPage;
