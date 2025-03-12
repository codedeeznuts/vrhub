import { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
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

const TagVideos = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [videos, setVideos] = useState([]);
  const [tag, setTag] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        
        // Get sort from URL query params
        const params = new URLSearchParams(location.search);
        const sort = params.get('sort') || 'newest';
        
        // Update sort state
        setSortBy(sort);
        
        // Get tag details
        const tagRes = await axios.get(`/api/tags/${id}`);
        setTag(tagRes.data);
        
        // Get videos for this tag
        const videosRes = await axios.get(`/api/videos?tag=${id}&sort=${sort}`);
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
  }, [id, location.search]);

  const handleSortChange = (event, newSort) => {
    if (newSort !== null) {
      // Update URL with new sort
      const searchParams = new URLSearchParams(location.search);
      searchParams.set('sort', newSort);
      navigate(`/tag/${id}?${searchParams.toString()}`);
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
    <Container maxWidth="xl">
      <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
        {tag?.name} Videos
      </Typography>
      
      {/* Full width filter bar */}
      <Box sx={{ mb: 2 }}>
        <ToggleButtonGroup
          value={sortBy}
          exclusive
          onChange={handleSortChange}
          aria-label="video sorting"
          size="small"
          sx={{
            '& .MuiToggleButtonGroup-grouped': {
              border: 0,
              mx: 0.5,
              '&.Mui-selected': {
                borderRadius: '20px',
                backgroundColor: 'primary.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                }
              },
              '&:not(:first-of-type)': {
                borderRadius: '20px',
              },
              '&:first-of-type': {
                borderRadius: '20px',
              }
            }
          }}
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
      </Box>
      
      {videos.length === 0 ? (
        <Alert severity="info">No videos found for this tag</Alert>
      ) : (
        <Grid container spacing={1.5}>
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