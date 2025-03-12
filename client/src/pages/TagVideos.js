import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Typography, Box, Grid, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';
import VideoCard from '../components/videos/VideoCard';

const TagVideos = () => {
  const { id } = useParams();
  const [videos, setVideos] = useState([]);
  const [tag, setTag] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        
        // Get tag details
        const tagRes = await axios.get(`/api/tags/${id}`);
        setTag(tagRes.data);
        
        // Get videos for this tag
        const videosRes = await axios.get(`/api/videos?tag=${id}`);
        setVideos(videosRes.data.videos);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching tag videos:', err);
        setError('Failed to load videos for this tag');
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
      <Typography variant="h4" component="h1" gutterBottom>
        {tag?.name} Videos
      </Typography>
      
      {tag?.description && (
        <Typography variant="body1" color="text.secondary" paragraph>
          {tag.description}
        </Typography>
      )}
      
      {videos.length === 0 ? (
        <Alert severity="info">No videos found for this tag</Alert>
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

export default TagVideos; 