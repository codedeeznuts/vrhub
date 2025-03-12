import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Typography, Box, Grid, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';
import VideoCard from '../components/videos/VideoCard';

const SearchResults = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get('q') || '';
  
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) {
        setVideos([]);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        const res = await axios.get(`/api/videos?search=${encodeURIComponent(query)}`);
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
  }, [query]);

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
      <Typography variant="h4" component="h1" gutterBottom>
        Search Results for "{query}"
      </Typography>
      
      {videos.length === 0 ? (
        <Alert severity="info">No videos found matching your search</Alert>
      ) : (
        <>
          <Typography variant="body2" color="text.secondary" paragraph>
            Found {videos.length} video{videos.length !== 1 ? 's' : ''}
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