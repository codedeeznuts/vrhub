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
  Tooltip
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon
} from '@mui/icons-material';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';

// Default thumbnail if none provided
const DEFAULT_THUMBNAIL = 'https://via.placeholder.com/320x180?text=VR+Video';

const VideoCard = ({ video, onLikeToggle }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

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

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'scale(1.02)',
        }
      }}
    >
      <CardActionArea onClick={handleCardClick}>
        <CardMedia
          component="img"
          height="180"
          image={video.thumbnail_url || DEFAULT_THUMBNAIL}
          alt={video.title}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography gutterBottom variant="h6" component="div" noWrap>
            {video.title}
          </Typography>
          
          {video.description && (
            <Typography variant="body2" color="text.secondary" sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              mb: 1
            }}>
              {video.description}
            </Typography>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {video.studio_name && (
                <Chip 
                  label={video.studio_name} 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/studio/${video.studio_id}`);
                  }}
                />
              )}
              
              {video.tags && video.tags.slice(0, 2).map((tag) => (
                <Chip 
                  key={tag.id} 
                  label={tag.name} 
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/tag/${tag.id}`);
                  }}
                />
              ))}
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
                  {video.isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
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