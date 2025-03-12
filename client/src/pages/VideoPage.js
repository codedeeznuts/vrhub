import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Grid
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
          relatedParams.tag = res.data.tags[0].id;
        } else if (res.data.studio_id) {
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
    <Container maxWidth="lg">
      <Box sx={{ mt: 2, mb: 6 }}>
        {/* VR Player */}
        <VRPlayer 
          videoUrl={video.video_url} 
          title={video.title} 
          thumbnailUrl={video.thumbnail_url} 
        />
        
        {/* Video Info */}
        <Paper sx={{ p: 3, mt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                {video.title}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {video.studio_name && (
                  <Chip
                    label={video.studio_name}
                    color="primary"
                    variant="outlined"
                    onClick={() => navigate(`studio/${video.studio_id}`)}
                    sx={{ mr: 1 }}
                  />
                )}
                
                <Typography variant="body2" color="text.secondary">
                  {new Date(video.created_at).toLocaleDateString()}
                </Typography>
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
          
          {video.description && (
            <Typography variant="body1" paragraph>
              {video.description}
            </Typography>
          )}
          
          {video.tags && video.tags.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Tags:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {video.tags.map(tag => (
                  <Chip
                    key={tag.id}
                    label={tag.name}
                    size="small"
                    onClick={() => navigate(`tag/${tag.id}`)}
                  />
                ))}
              </Box>
            </Box>
          )}
        </Paper>
        
        {/* Related Videos */}
        {relatedVideos.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Related Videos
            </Typography>
            <Grid container spacing={3}>
              {relatedVideos.map(relatedVideo => (
                <Grid item key={relatedVideo.id} xs={12} sm={6} md={3}>
                  <VideoCard video={relatedVideo} />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default VideoPage; 