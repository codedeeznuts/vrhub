import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import axios from 'axios';
import VideoCard from '../components/videos/VideoCard';
import Pagination from '../components/layout/Pagination';

const Home = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalVideos: 0
  });
  
  const location = useLocation();

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get page from URL query params
        const params = new URLSearchParams(location.search);
        const page = parseInt(params.get('page')) || 1;
        
        console.log('Fetching videos, page:', page);
        
        // Add a delay to ensure the server is ready
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const res = await axios.get('/api/videos', {
          params: { page, limit: 20 }
        });
        
        console.log('API response:', res.data);
        
        // Check if videos array exists
        if (!res.data.videos) {
          console.error('No videos array in response:', res.data);
          setError('Invalid response from server. Please try again later.');
          return;
        }
        
        // Process videos to ensure they have tags property
        const processedVideos = res.data.videos.map(video => ({
          ...video,
          tags: video.tags || [],
          likes_count: video.likes_count || 0
        }));
        
        console.log('Processed videos:', processedVideos);
        
        setVideos(processedVideos);
        setPagination({
          page: res.data.pagination.page,
          totalPages: res.data.pagination.totalPages,
          totalVideos: res.data.pagination.totalVideos
        });
      } catch (err) {
        console.error('Error fetching videos:', err);
        console.error('Error details:', err.response?.data || err.message);
        setError('Failed to load videos. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [location.search]);

  const handlePageChange = (page) => {
    // Update URL with new page
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('page', page);
    window.history.pushState(null, '', `?${searchParams.toString()}`);
    
    // Force re-render
    window.dispatchEvent(new Event('popstate'));
  };

  const handleLikeToggle = (videoId, isLiked, likesCount) => {
    setVideos(videos.map(video => 
      video.id === videoId 
        ? { ...video, isLiked, likes_count: likesCount } 
        : video
    ));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 2, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Explore VR Videos
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {videos.length === 0 ? (
          <Alert severity="info">
            No videos found. Check back later for new content.
          </Alert>
        ) : (
          <>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Showing {videos.length} of {pagination.totalVideos} videos
            </Typography>
            
            <Grid container spacing={3}>
              {videos.map((video) => (
                <Grid item key={video.id} xs={12} sm={6} md={4} lg={3}>
                  <VideoCard video={video} onLikeToggle={handleLikeToggle} />
                </Grid>
              ))}
            </Grid>
            
            {pagination.totalPages > 1 && (
              <Pagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </Box>
    </Container>
  );
};

export default Home; 