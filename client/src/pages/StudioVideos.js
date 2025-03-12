import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Typography, Box, Grid, CircularProgress, Alert, Avatar } from '@mui/material';
import axios from 'axios';
import VideoCard from '../components/videos/VideoCard';

const StudioVideos = () => {
  const { id } = useParams();
  const [videos, setVideos] = useState([]);
  const [studio, setStudio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        
        // Get studio details
        const studioRes = await axios.get(`/api/studios/${id}`);
        setStudio(studioRes.data);
        
        // Get videos for this studio
        const videosRes = await axios.get(`/api/videos?studio=${id}`);
        setVideos(videosRes.data.videos);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching studio videos:', err);
        setError('Failed to load videos for this studio');
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [id]);

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
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        {studio?.logo_url && (
          <Avatar 
            src={studio.logo_url} 
            alt={studio.name}
            sx={{ width: 64, height: 64, mr: 2 }}
          />
        )}
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            {studio?.name} Videos
          </Typography>
          
          {studio?.description && (
            <Typography variant="body1" color="text.secondary">
              {studio.description}
            </Typography>
          )}
          
          {studio?.website && (
            <Typography variant="body2" color="primary" component="a" href={studio.website} target="_blank" rel="noopener noreferrer">
              Visit Website
            </Typography>
          )}
        </Box>
      </Box>
      
      {videos.length === 0 ? (
        <Alert severity="info">No videos found for this studio</Alert>
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

export default StudioVideos; 