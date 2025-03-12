import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardActionArea,
  CardMedia,
  Typography,
  Box,
  IconButton,
  Avatar
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon
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

  const handleStudioClick = (e) => {
    e.stopPropagation(); // Prevent card click
    if (video.studio_id) {
      navigate(`/studio/${video.studio_id}`);
    }
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
        borderRadius: 0,
        boxShadow: 'none',
        border: 'none',
        overflow: 'hidden',
        backgroundColor: 'transparent'
      }}
    >
      <Box sx={{ position: 'relative' }} onClick={handleCardClick}>
        {/* Video Thumbnail */}
        <CardMedia
          component="img"
          height="180"
          image={video.thumbnail_url || DEFAULT_THUMBNAIL}
          alt={video.title}
          sx={{ cursor: 'pointer' }}
        />
        <Box 
          sx={{ 
            position: 'absolute', 
            bottom: 0, 
            right: 0, 
            bgcolor: 'rgba(0,0,0,0.7)', 
            px: 1, 
            py: 0.5
          }}
        >
          <Typography variant="caption" color="white">
            {video.duration ? `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}` : ''}
          </Typography>
        </Box>
      </Box>
      
      {/* Video Info Section */}
      <Box sx={{ 
        display: 'flex', 
        bgcolor: 'transparent', 
        p: 1,
        alignItems: 'flex-start'
      }}>
        {/* Studio Avatar */}
        <Avatar 
          src={video.studio_logo || DEFAULT_LOGO} 
          alt={video.studio_name || 'Studio'} 
          sx={{ width: 48, height: 48, mr: 1, cursor: 'pointer' }}
          onClick={handleStudioClick}
        />
        
        {/* Video Details */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Title */}
          <Typography 
            variant="subtitle2" 
            component="div" 
            noWrap 
            sx={{ fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer' }}
            onClick={handleCardClick}
          >
            {video.title}
          </Typography>
          
          {/* Studio Name */}
          <Typography 
            variant="caption" 
            color="text.secondary" 
            sx={{ cursor: 'pointer' }}
            onClick={handleStudioClick}
          >
            {video.studio_name || 'Unknown Studio'}
          </Typography>
          
          {/* Days Ago and Likes */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              {getDaysAgo()}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5 }}>
                {video.likes_count || 0}
              </Typography>
              <IconButton 
                size="small" 
                color="secondary" 
                onClick={handleLikeClick}
                sx={{ p: 0.25 }}
              >
                {video.isLiked ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Box>
    </Card>
  );
};

export default VideoCard; 