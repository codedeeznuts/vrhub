import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Avatar
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';

// Default thumbnail if none provided
const DEFAULT_THUMBNAIL = 'https://via.placeholder.com/320x180?text=VR+Video';
// Default studio logo if none provided
const DEFAULT_LOGO = 'https://via.placeholder.com/40x40?text=VR';

const VideoCard = ({ video, onLikeToggle }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  // Add console log to debug video data
  console.log('VideoCard received video:', video);

  const handleCardClick = () => {
    navigate(`/video/${video.id}`);
  };

  const handleLikeClick = async (e) => {
    e.stopPropagation(); // Prevent card click
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      const res = await axios.post(`/api/likes/videos/${video.id}`);
      if (onLikeToggle) {
        onLikeToggle(video.id, res.data.action === 'liked', res.data.likesCount);
      }
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  // Calculate days ago
  const getDaysAgo = () => {
    const createdDate = new Date(video.created_at);
    const now = new Date();
    const diffTime = Math.abs(now - createdDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'scale(1.02)',
        },
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: '#1e1e1e'
      }}
    >
      <CardActionArea onClick={handleCardClick} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
        <Box sx={{ position: 'relative' }}>
          <CardMedia
            component="img"
            height="180"
            image={video.thumbnail_url || DEFAULT_THUMBNAIL}
            alt={video.title}
          />
          <Box 
            sx={{ 
              position: 'absolute', 
              bottom: 0, 
              right: 0, 
              bgcolor: 'rgba(0,0,0,0.7)', 
              px: 1, 
              py: 0.5, 
              borderTopLeftRadius: '4px' 
            }}
          >
            <Typography variant="caption" color="white">
              {video.duration ? `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}` : ''}
            </Typography>
          </Box>
        </Box>
        
        <CardContent sx={{ flexGrow: 1, p: 2 }}>
          <Typography gutterBottom variant="subtitle1" component="div" noWrap sx={{ fontWeight: 'bold', mb: 1 }}>
            {video.title}
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar 
                src={video.studio_logo || DEFAULT_LOGO} 
                alt={video.studio_name || 'Studio'} 
                sx={{ width: 24, height: 24, mr: 1 }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (video.studio_id) navigate(`/studio/${video.studio_id}`);
                }}
              />
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  '&:hover': { textDecoration: 'underline', cursor: 'pointer' } 
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (video.studio_id) navigate(`/studio/${video.studio_id}`);
                }}
              >
                {video.studio_name || 'Unknown Studio'}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AccessTimeIcon fontSize="small" sx={{ color: 'text.secondary', mr: 0.5, fontSize: '0.875rem' }} />
              <Typography variant="caption" color="text.secondary">
                {getDaysAgo()}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>
                {video.likes_count || 0}
              </Typography>
              <Tooltip title={isAuthenticated ? (video.isLiked ? "Unlike" : "Like") : "Login to like"}>
                <IconButton 
                  size="small" 
                  color="secondary" 
                  onClick={handleLikeClick}
                >
                  {video.isLiked ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default VideoCard; 