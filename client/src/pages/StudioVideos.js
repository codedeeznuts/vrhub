import { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  CircularProgress, 
  Alert, 
  Avatar,
  Paper
} from '@mui/material';
import {
  NewReleases as NewIcon,
  Favorite as LikeIcon,
  TrendingUp as TrendingIcon
} from '@mui/icons-material';
import axios from 'axios';
import VideoCard from '../components/videos/VideoCard';
import FilterButtons from '../components/layout/FilterButtons';

const StudioVideos = () => {
  const { name } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [videos, setVideos] = useState([]);
  const [studio, setStudio] = useState(null);
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
        
        // Get studio details - try to find by formatted name first
        const formattedName = name.replace(/-/g, ' ');
        const studioRes = await axios.get(`/api/studios/${formattedName}`);
        setStudio(studioRes.data);
        
        // Get videos for this studio
        const videosRes = await axios.get(`/api/videos?studio=${studioRes.data.id}&sort=${sort}`);
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
  }, [name, location.search]);

  const handleSortChange = (event, newSort) => {
    if (newSort) {
      navigate(`/studio/${name}?sort=${newSort}`);
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
      <Box sx={{ mt: 2, mb: 4 }}>
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
        
        {/* Filter buttons */}
        <FilterButtons value={sortBy} onChange={handleSortChange} />
        
        {videos.length === 0 ? (
          <Alert severity="info">No videos found for this studio</Alert>
        ) : (
          <Grid container spacing={1.5}>
            {videos.map(video => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={video.id}>
                <VideoCard video={video} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default StudioVideos; 