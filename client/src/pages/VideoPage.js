import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Chip,
  Divider,
  IconButton,
  CircularProgress,
  Alert,
  Paper,
  Grid,
  Avatar
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon
} from '@mui/icons-material';
import axios from 'axios';
import VRPlayer from '../components/videos/VRPlayer';
import VideoCard from '../components/videos/VideoCard';
import AuthContext from '../context/AuthContext';

const VideoPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);
  
  const [video, setVideo] = useState(null);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get video details
        const res = await axios.get(`/api/videos/${id}`);
        setVideo(res.data);
        
        // Get related videos (same tags or studio)
        let relatedParams = {};
        if (res.data.tags && res.data.tags.length > 0) {
          // Use tag ID for API call since that's what the backend expects
          relatedParams.tag = res.data.tags[0].id;
        } else if (res.data.studio_id) {
          // Use studio ID for API call since that's what the backend expects
          relatedParams.studio = res.data.studio_id;
        }
        
        const relatedRes = await axios.get('/api/videos', {
          params: { ...relatedParams, limit: 4 }
        });
        
        // Filter out the current video
        setRelatedVideos(
          relatedRes.data.videos.filter(v => v.id !== parseInt(id))
        );
      } catch (err) {
        console.error('Error fetching video:', err);
        setError('Failed to load video. It may have been removed or is unavailable.');
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [id]);

  const handleLikeToggle = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      const res = await axios.post(`/api/likes/videos/${id}`);
      setVideo({
        ...video,
        isLiked: res.data.action === 'liked',
        likes_count: res.data.likesCount
      });
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !video) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 4 }}>
          {error || 'Video not found'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 2, mb: 6 }}>
        <Grid container spacing={2}>
          {/* Left Column - Video Player and Info */}
          <Grid item xs={12} md={8}>
            {/* VR Player */}
            <VRPlayer 
              videoUrl={video.video_url} 
              title={video.title} 
              thumbnailUrl={video.thumbnail_url} 
            />
            
            {/* Title, Studio and Likes - directly under video */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                {video.studio_logo_url && (
                  <Avatar 
                    src={video.studio_logo_url} 
                    alt={video.studio_name || 'Studio'}
                    component={RouterLink}
                    to={`/studio/${video.studio_name?.toLowerCase().replace(/\s+/g, '-')}`}
                    sx={{ mr: 1.5, width: 40, height: 40 }}
                  />
                )}
                <Box>
                  <Typography variant="h5" component="h1" sx={{ fontWeight: 'medium' }}>
                    {video.title}
                  </Typography>
                  {video.studio_name && (
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      component={RouterLink}
                      to={`/studio/${video.studio_name.toLowerCase().replace(/\s+/g, '-')}`}
                      sx={{ textDecoration: 'none', color: 'inherit', '&:hover': { textDecoration: 'underline' } }}
                    >
                      {video.studio_name}
                    </Typography>
                  )}
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ mr: 1 }}>
                  {video.likes_count || 0}
                </Typography>
                <IconButton
                  color="secondary"
                  onClick={handleLikeToggle}
                  size="large"
                >
                  {video.isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>
              </Box>
            </Box>
            
            {/* Video Details Box */}
            <Paper sx={{ p: 3, mt: 1 }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Description
                </Typography>
                {video.description ? (
                  <Typography variant="body1" paragraph>
                    {video.description}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary" italic>
                    No description available
                  </Typography>
                )}
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {video.tags && video.tags.length > 0 && (
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Tags
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {video.tags.map(tag => (
                        <Chip
                          key={tag.id}
                          label={tag.name}
                          size="small"
                          onClick={() => navigate(`/tag/${tag.name.toLowerCase().replace(/\s+/g, '-')}`)}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
                
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Published
                  </Typography>
                  <Typography variant="body2">
                    {new Date(video.created_at).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
          
          {/* Right Column - Related Videos */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'medium', pl: 1 }}>
              Related Videos
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {relatedVideos.length > 0 ? (
                relatedVideos.map(relatedVideo => (
                  <VideoCard key={relatedVideo.id} video={relatedVideo} />
                ))
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ pl: 1 }}>
                  No related videos found
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default VideoPage; 