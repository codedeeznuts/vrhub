import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  CircularProgress, 
  Alert,
  ToggleButtonGroup,
  ToggleButton,
  Paper
} from '@mui/material';
import {
  NewReleases as NewIcon,
  Favorite as LikeIcon,
  Shuffle as RandomIcon
} from '@mui/icons-material';
import axios from 'axios';
import VideoCard from '../components/videos/VideoCard';

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get('q') || '';
  const sortParam = searchParams.get('sort') || 'newest';
  
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState(sortParam);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) {
        setVideos([]);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Get sort from URL query params
        const params = new URLSearchParams(location.search);
        const sort = params.get('sort') || 'newest';
        
        // Update sort state
        setSortBy(sort);
        
        const res = await axios.get(`/api/videos?search=${encodeURIComponent(query)}&sortBy=${sort}`);
        setVideos(res.data.videos);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching search results:', err);
        setError('Failed to load search results');
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query, location.search]);

  const handleSortChange = (event, newSort) => {
    if (newSort !== null) {
      // Update URL with new sort
      const params = new URLSearchParams(location.search);
      params.set('sort', newSort);
      navigate(`/search?${params.toString()}`);
    }
  };

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Search Results for "{query}"
        </Typography>
        
        <Paper elevation={0} sx={{ display: 'flex', alignItems: 'center', p: 1, bgcolor: 'background.paper' }}>
          <ToggleButtonGroup
            value={sortBy}
            exclusive
            onChange={handleSortChange}
            aria-label="video sorting"
            size="small"
          >
            <ToggleButton value="newest" aria-label="sort by newest">
              <NewIcon fontSize="small" sx={{ mr: 0.5 }} />
              New
            </ToggleButton>
            <ToggleButton value="most_liked" aria-label="sort by most liked">
              <LikeIcon fontSize="small" sx={{ mr: 0.5 }} />
              Most Liked
            </ToggleButton>
            <ToggleButton value="random" aria-label="sort randomly">
              <RandomIcon fontSize="small" sx={{ mr: 0.5 }} />
              Random
            </ToggleButton>
          </ToggleButtonGroup>
        </Paper>
      </Box>
      
      {videos.length === 0 ? (
        <Alert severity="info">No videos found matching "{query}"</Alert>
      ) : (
        <>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Found {videos.length} videos matching "{query}"
          </Typography>
          
          <Grid container spacing={3}>
            {videos.map(video => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={video.id}>
                <VideoCard video={video} />
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Container>
  );
};

export default SearchResults; 