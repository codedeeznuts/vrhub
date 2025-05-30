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
  Avatar,
  Button
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import axios from 'axios';
import VRPlayer from '../components/videos/VRPlayer';
import VideoCard from '../components/videos/VideoCard';
import AuthContext from '../context/AuthContext';

// Default studio logo if none provided
const DEFAULT_LOGO = 'https://via.placeholder.com/40x40?text=VR';

const VideoPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);
  
  const [video, setVideo] = useState(null);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewRecorded, setViewRecorded] = useState(false);

  // Record view when page loads
  useEffect(() => {
    const recordView = async () => {
      if (!viewRecorded && id && isAuthenticated) {
        setViewRecorded(true);
        
        try {
          await axios.post(`/api/videos/${id}/view`);
        } catch (err) {
          console.error('Error recording view:', err);
          // Non-critical error, don't show to user
        }
      }
    };

    recordView();
  }, [id, viewRecorded, isAuthenticated]); // This is fine, comment explains why video is excluded

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
          params: { ...relatedParams, limit: 16 }
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

  // Format view count
  const formatViewCount = (count) => {
    if (!count && count !== 0) return '0';
    
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M views`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K views`;
    }
    return `${count} views`;
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
          <Grid item xs={12} md={9}>
            {/* VR Player */}
            <VRPlayer 
              videoUrl={video.video_url} 
              title={video.title} 
              thumbnailUrl={video.thumbnail_url} 
            />
            
            {/* Title, Studio and Likes - directly under video */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                {video.studio_name && (
                  <Avatar 
                    src={video.studio_logo_url || DEFAULT_LOGO}
                    alt={video.studio_name}
                    component={RouterLink}
                    to={`/studio/${video.studio_name.toLowerCase().replace(/\s+/g, '-')}`}
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
              
              {/* Likes */}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {/* Like Button */}
                <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={handleLikeToggle}>
                  {video.isLiked ? 
                    <FavoriteIcon sx={{ color: 'secondary.main', fontSize: '1.2rem', mr: 0.5 }} /> : 
                    <FavoriteBorderIcon sx={{ color: 'text.secondary', fontSize: '1.2rem', mr: 0.5 }} />
                  }
                  <Typography variant="body2" color="text.secondary">
                    {video.likes_count || 0}
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            {/* Video Description and Tags */}
            <Paper sx={{ p: 2, boxShadow: 'none', borderRadius: 0, border: '1px solid', borderColor: 'divider' }}>
              {/* Description */}
              <Typography variant="body1" paragraph>
                {video.description || 'No description available.'}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              {/* Video Info */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ minWidth: 100 }}>
                    Views:
                  </Typography>
                  <Typography variant="body2">
                    {formatViewCount(video.views || 0)}
                  </Typography>
                </Box>
                
                {video.release_date && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 100 }}>
                      Released:
                    </Typography>
                    <Typography variant="body2">
                      {new Date(video.release_date).toLocaleDateString()}
                    </Typography>
                  </Box>
                )}
                
                {/* Tags */}
                {video.tags && video.tags.length > 0 && (
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mt: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 100, mt: 0.5 }}>
                      Tags:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {video.tags.map(tag => (
                        <Chip 
                          key={tag.id} 
                          label={tag.name} 
                          size="small" 
                          component={RouterLink}
                          to={`/tag/${tag.name.toLowerCase()}`}
                          clickable
                          sx={{ 
                            textDecoration: 'none',
                            '&:hover': { opacity: 0.8 }
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>
          
          {/* Right Column - Placeholder for future content */}
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, height: '100%', boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" gutterBottom>
                Additional Content
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                fullWidth 
                sx={{ mb: 2 }}
                href={video.video_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Download Full Video
              </Button>
              <Typography variant="body2" color="text.secondary">
                This space is reserved for future content.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
        
        {/* Related Videos Section - Full Width */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Related Videos
          </Typography>
          {relatedVideos.length > 0 ? (
            <Grid container spacing={2}>
              {relatedVideos.map(relatedVideo => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={relatedVideo.id}>
                  <VideoCard video={relatedVideo} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No related videos found
            </Typography>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default VideoPage; 