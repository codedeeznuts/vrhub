import { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  CircularProgress, 
  Alert,
  Paper
} from '@mui/material';
import {
  NewReleases as NewIcon,
  Favorite as LikeIcon,
  Shuffle as RandomIcon
} from '@mui/icons-material';
import axios from 'axios';
import VideoCard from '../components/videos/VideoCard';
import FilterButtons from '../components/layout/FilterButtons';

const TagVideos = () => {
  const { name } = useParams();
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
        
        // Get tag details - try to find by formatted name first
        const formattedName = name.replace(/-/g, ' ');
        const tagRes = await axios.get(`/api/tags/${formattedName}`);
        setTag(tagRes.data);
        
        // Get videos for this tag
        const videosRes = await axios.get(`/api/videos?tag=${tagRes.data.id}&sort=${sort}`);
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
  }, [name, location.search]);

  const handleSortChange = (event, newSort) => {
    if (newSort) {
      navigate(`/tag/${name}?sort=${newSort}`);
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
      
      {/* Filter buttons */}
      <FilterButtons value={sortBy} onChange={handleSortChange} />
      
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