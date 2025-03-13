import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Box,
  CircularProgress,
  Alert,
  Paper,
  Divider
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
import FilterButtons from '../components/layout/FilterButtons';

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

  // Fetch videos when sortBy changes
  useEffect(() => {
    console.log('sortBy changed to:', sortBy);
    
    const fetchVideosOnSortChange = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get page from URL query params
        const params = new URLSearchParams(location.search);
        const page = parseInt(params.get('page')) || 1;
        
        console.log('Fetching videos on sort change, page:', page, 'sort:', sortBy);
        
        const res = await axios.get('/api/videos', {
          params: { page, limit: 20, sort: sortBy }
        });
        
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
        
        console.log('Videos after sort change:', processedVideos);
        
        setVideos(processedVideos);
        setPagination({
          page: res.data.pagination.page,
          totalPages: res.data.pagination.totalPages,
          totalVideos: res.data.pagination.totalVideos
        });
      } catch (err) {
        console.error('Error fetching videos:', err);
        setError('Failed to load videos. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchVideosOnSortChange();
  }, [sortBy, location.search]);

  useEffect(() => {
    // Update sortBy from URL when location changes
    const params = new URLSearchParams(location.search);
    const sortParam = params.get('sort');
    if (sortParam && sortParam !== sortBy) {
      console.log('Updating sortBy from URL:', sortParam);
      setSortBy(sortParam);
    }
  }, [location.search]);

  const handlePageChange = (page) => {
    // Update URL with new page
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('page', page);
    navigate(`?${searchParams.toString()}`);
  };

  const handleSortChange = (event, newSort) => {
    if (newSort !== null && newSort !== sortBy) {
      console.log('Sort button clicked:', newSort);
      
      // Force a re-render by setting loading
      setLoading(true);
      
      // Directly update the sort state
      setSortBy(newSort);
      
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
        <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
          Featured Videos
        </Typography>
        
        {/* Filter buttons */}
        <FilterButtons value={sortBy} onChange={handleSortChange} />
        
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
            
            <Grid container spacing={1.5} key={`video-grid-${sortBy}`}>
              {videos.map((video) => (
                <Grid item key={video.id} xs={12} sm={6} md={4} lg={3}>
                  <VideoCard 
                    key={`${video.id}-${sortBy}`} 
                    video={video} 
                    onLikeToggle={handleLikeToggle} 
                  />
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