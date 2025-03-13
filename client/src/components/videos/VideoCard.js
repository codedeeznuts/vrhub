import React from 'react';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardMedia,
  Typography,
  Box,
  IconButton,
  Avatar
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Visibility as VisibilityIcon
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
    if (video.studio_name) {
      const formattedStudioName = video.studio_name.toLowerCase().replace(/\s+/g, '-');
      navigate(`/studio/${formattedStudioName}`);
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

  // Format view count
  const formatViewCount = (count) => {
    if (!count && count !== 0) return '0';
    
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
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
        backgroundColor: 'transparent !important',
        m: 0
      }}
      elevation={0}
    >
      <Box sx={{ position: 'relative', width: '100%', paddingTop: '56.25%' }} onClick={handleCardClick}>
        {/* Video Thumbnail */}
        <CardMedia
          component="img"
          image={video.thumbnail_url || DEFAULT_THUMBNAIL}
          alt={video.title}
          sx={{ 
            cursor: 'pointer',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      </Box>
      
      {/* Video Info Section */}
      <Box sx={{ 
        display: 'flex', 
        bgcolor: 'transparent', 
        p: 0.5,
        pt: 1.5,
        alignItems: 'flex-start',
        backgroundColor: 'transparent !important'
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
          
          {/* Studio Name and Days Ago on one line */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'nowrap', width: '100%' }}>
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ cursor: 'pointer', flexShrink: 0 }}
              onClick={handleStudioClick}
            >
              {video.studio_name || 'Unknown Studio'}
            </Typography>
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ mx: 0.5, flexShrink: 0 }}
            >
              •
            </Typography>
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {getDaysAgo()}
            </Typography>
          </Box>
          
          {/* Views and Likes */}
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
            {/* Views */}
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
              <VisibilityIcon fontSize="small" sx={{ color: 'text.secondary', fontSize: '1rem', mr: 0.5 }} />
              <Typography variant="caption" color="text.secondary">
                {formatViewCount(video.views || 0)}
              </Typography>
            </Box>
            
            {/* Likes */}
            <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={handleLikeClick}>
              {video.isLiked ? 
                <FavoriteIcon fontSize="small" sx={{ color: 'secondary.main', fontSize: '1rem', mr: 0.5 }} /> : 
                <FavoriteBorderIcon fontSize="small" sx={{ color: 'text.secondary', fontSize: '1rem', mr: 0.5 }} />
              }
              <Typography variant="caption" color="text.secondary">
                {video.likes_count || 0}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Card>
  );
};

// Export with React.memo to prevent unnecessary re-renders
export default React.memo(VideoCard); 