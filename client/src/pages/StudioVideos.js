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
    </Container>
  );
};

export default StudioVideos; 