import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Box,
  CircularProgress,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
  Paper
} from '@mui/material';
import {
  Sort as SortIcon,
  NewReleases as NewIcon,
  Favorite as LikeIcon,
  Shuffle as RandomIcon
} from '@mui/icons-material';
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
  const [sortBy, setSortBy] = useState('newest');
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get page and sort from URL query params
        const params = new URLSearchParams(location.search);
        const page = parseInt(params.get('page')) || 1;
        const sort = params.get('sort') || 'newest';
        
        // Update sort state
        setSortBy(sort);
        
        console.log('Fetching videos, page:', page, 'sort:', sort);
        
        const res = await axios.get('/api/videos', {
          params: { page, limit: 20, sortBy: sort }
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

  const handleSortChange = (event, newSort) => {
    if (newSort !== null) {
      // Update URL with new sort
      const searchParams = new URLSearchParams(location.search);
      searchParams.set('sort', newSort);
      searchParams.set('page', '1'); // Reset to page 1 when changing sort
      navigate(`?${searchParams.toString()}`);
    }
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            VR Porn Videos Top Rated
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