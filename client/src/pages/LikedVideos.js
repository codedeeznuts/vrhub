import { useState, useEffect } from 'react';
import { Container, Typography, Box, Grid, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';
import VideoCard from '../components/videos/VideoCard';
import { useAuth } from '../context/AuthContext';

const LikedVideos = () => {
  const { isAuthenticated } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLikedVideos = async () => {
      try {
        setLoading(true);
        
        const res = await axios.get('/api/users/liked-videos');
        setVideos(res.data);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching liked videos:', err);
        setError('Failed to load your liked videos');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchLikedVideos();
    }
  }, [isAuthenticated]);

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
        Your Liked Videos
      </Typography>
      
      {videos.length === 0 ? (
        <Alert severity="info">You haven't liked any videos yet</Alert>
      ) : (
        <Grid container spacing={3}>
          {videos.map(video => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={video.id}>
              <VideoCard video={video} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default LikedVideos; 