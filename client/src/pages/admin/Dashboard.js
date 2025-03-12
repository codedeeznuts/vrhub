import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  VideoLibrary as VideoIcon,
  LocalOffer as TagIcon,
  Business as StudioIcon
} from '@mui/icons-material';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState({
    videos: 0,
    tags: 0,
    studios: 0,
    recentVideos: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Fetch counts and recent videos
        const [videosRes, tagsRes, studiosRes, recentVideosRes] = await Promise.all([
          axios.get('/api/videos?limit=1'),
          axios.get('/api/tags'),
          axios.get('/api/studios'),
          axios.get('/api/videos?limit=5')
        ]);
        
        setStats({
          videos: videosRes.data.pagination.totalVideos,
          tags: tagsRes.data.length,
          studios: studiosRes.data.length,
          recentVideos: recentVideosRes.data.videos
        });
      } catch (err) {
        console.error('Error fetching admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 6 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Stats Cards */}
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
              <VideoIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4">{stats.videos}</Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Videos
              </Typography>
              <Button
                component={RouterLink}
                to="/admin/videos"
                variant="outlined"
                sx={{ mt: 2 }}
              >
                Manage Videos
              </Button>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
              <TagIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4">{stats.tags}</Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Tags
              </Typography>
              <Button
                component={RouterLink}
                to="/admin/tags"
                variant="outlined"
                sx={{ mt: 2 }}
              >
                Manage Tags
              </Button>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
              <StudioIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4">{stats.studios}</Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Studios
              </Typography>
              <Button
                component={RouterLink}
                to="/admin/studios"
                variant="outlined"
                sx={{ mt: 2 }}
              >
                Manage Studios
              </Button>
            </Paper>
          </Grid>
        </Grid>
        
        {/* Recent Videos */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Recently Added Videos
          </Typography>
          
          <List>
            {stats.recentVideos.length === 0 ? (
              <ListItem>
                <ListItemText primary="No videos found" />
              </ListItem>
            ) : (
              stats.recentVideos.map((video, index) => (
                <Box key={video.id}>
                  <ListItem
                    component={RouterLink}
                    to={`/video/${video.id}`}
                    sx={{ 
                      textDecoration: 'none', 
                      color: 'inherit',
                      '&:hover': { backgroundColor: 'action.hover' }
                    }}
                  >
                    <ListItemText
                      primary={video.title}
                      secondary={`Added on ${new Date(video.created_at).toLocaleDateString()}`}
                    />
                    <Button
                      component={RouterLink}
                      to={`/admin/videos?edit=${video.id}`}
                      size="small"
                      sx={{ ml: 2 }}
                    >
                      Edit
                    </Button>
                  </ListItem>
                  {index < stats.recentVideos.length - 1 && <Divider />}
                </Box>
              ))
            )}
          </List>
          
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button
              component={RouterLink}
              to="/admin/videos"
              variant="contained"
            >
              View All Videos
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Dashboard; 