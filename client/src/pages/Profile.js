import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Grid,
  TextField,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
  Snackbar,
  IconButton,
  Card,
  CardContent,
  CardActions,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Save,
  Close,
  Person,
  Lock,
  Favorite,
  History,
  VideoLibrary
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { Link as RouterLink } from 'react-router-dom';

// Tab Panel Component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [likedVideos, setLikedVideos] = useState([]);
  const [watchHistory, setWatchHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  
  // Tab state
  const [tabValue, setTabValue] = useState(0);
  
  // Snackbar notification
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        ...profileData,
        name: user.name || '',
        email: user.email || ''
      });
      
      // Fetch liked videos and watch history
      fetchUserVideos();
    }
  }, [user]);

  const fetchUserVideos = async () => {
    try {
      setLoadingVideos(true);
      const [likedRes, historyRes] = await Promise.all([
        axios.get('/api/users/liked-videos'),
        axios.get('/api/users/watch-history')
      ]);
      
      setLikedVideos(likedRes.data || []);
      setWatchHistory(historyRes.data || []);
    } catch (err) {
      console.error('Error fetching user videos:', err);
    } finally {
      setLoadingVideos(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const validateProfileForm = () => {
    const errors = {};
    if (!profileData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!profileData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      errors.email = 'Email is invalid';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePasswordForm = () => {
    const errors = {};
    
    if (!profileData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    
    if (!profileData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (profileData.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    }
    
    if (profileData.newPassword !== profileData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdateProfile = async () => {
    if (!validateProfileForm()) return;
    
    try {
      setLoading(true);
      const response = await axios.put('/api/users/profile', {
        name: profileData.name,
        email: profileData.email
      });
      
      // Update user in auth context
      updateUser(response.data);
      
      setSnackbar({
        open: true,
        message: 'Profile updated successfully',
        severity: 'success'
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
      console.error('Error updating profile:', err);
      setSnackbar({
        open: true,
        message: 'Failed to update profile: ' + (err.response?.data?.message || err.message),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!validatePasswordForm()) return;
    
    try {
      setLoading(true);
      await axios.put('/api/users/change-password', {
        currentPassword: profileData.currentPassword,
        newPassword: profileData.newPassword
      });
      
      // Clear password fields
      setProfileData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
      setSnackbar({
        open: true,
        message: 'Password changed successfully',
        severity: 'success'
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
      console.error('Error changing password:', err);
      setSnackbar({
        open: true,
        message: 'Failed to change password: ' + (err.response?.data?.message || err.message),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleClearWatchHistory = async () => {
    try {
      setLoadingVideos(true);
      await axios.delete('/api/users/watch-history');
      setWatchHistory([]);
      setSnackbar({
        open: true,
        message: 'Watch history cleared successfully',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error clearing watch history:', err);
      setSnackbar({
        open: true,
        message: 'Failed to clear watch history',
        severity: 'error'
      });
    } finally {
      setLoadingVideos(false);
    }
  };

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 0, mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="profile tabs"
            centered
          >
            <Tab icon={<Person />} label="Profile" />
            <Tab icon={<Lock />} label="Security" />
            <Tab icon={<Favorite />} label="Liked Videos" />
            <Tab icon={<History />} label="Watch History" />
          </Tabs>
        </Box>
        
        {/* Profile Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar 
                sx={{ 
                  width: 120, 
                  height: 120, 
                  mb: 2,
                  bgcolor: 'primary.main',
                  fontSize: '3rem'
                }}
              >
                {user.name ? user.name.charAt(0).toUpperCase() : <Person fontSize="large" />}
              </Avatar>
              <Typography variant="h5" gutterBottom>
                {user.name}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Member since {new Date(user.createdAt).toLocaleDateString()}
              </Typography>
              {user.role === 'admin' && (
                <Button 
                  variant="outlined" 
                  color="primary" 
                  component={RouterLink} 
                  to="/admin"
                  sx={{ mt: 2 }}
                >
                  Go to Admin Panel
                </Button>
              )}
            </Grid>
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={profileData.name}
                onChange={handleInputChange}
                margin="normal"
                variant="outlined"
                error={!!formErrors.name}
                helperText={formErrors.name}
              />
              
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={profileData.email}
                onChange={handleInputChange}
                margin="normal"
                variant="outlined"
                error={!!formErrors.email}
                helperText={formErrors.email}
              />
              
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleUpdateProfile}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                >
                  Save Changes
                </Button>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Security Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Change Password
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <TextField
            fullWidth
            label="Current Password"
            name="currentPassword"
            type="password"
            value={profileData.currentPassword}
            onChange={handleInputChange}
            margin="normal"
            variant="outlined"
            error={!!formErrors.currentPassword}
            helperText={formErrors.currentPassword}
          />
          
          <TextField
            fullWidth
            label="New Password"
            name="newPassword"
            type="password"
            value={profileData.newPassword}
            onChange={handleInputChange}
            margin="normal"
            variant="outlined"
            error={!!formErrors.newPassword}
            helperText={formErrors.newPassword}
          />
          
          <TextField
            fullWidth
            label="Confirm New Password"
            name="confirmPassword"
            type="password"
            value={profileData.confirmPassword}
            onChange={handleInputChange}
            margin="normal"
            variant="outlined"
            error={!!formErrors.confirmPassword}
            helperText={formErrors.confirmPassword}
          />
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleChangePassword}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <Save />}
            >
              Change Password
            </Button>
          </Box>
        </TabPanel>
        
        {/* Liked Videos Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              Liked Videos
            </Typography>
            <Button 
              component={RouterLink} 
              to="/liked" 
              variant="outlined" 
              startIcon={<VideoLibrary />}
            >
              View All Liked Videos
            </Button>
          </Box>
          <Divider sx={{ mb: 3 }} />
          
          {loadingVideos ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : likedVideos.length === 0 ? (
            <Alert severity="info">
              You haven't liked any videos yet.
            </Alert>
          ) : (
            <List>
              {likedVideos.slice(0, 5).map(video => (
                <ListItem 
                  key={video._id} 
                  button 
                  component={RouterLink} 
                  to={`/video/${video._id}`}
                  divider
                >
                  <ListItemAvatar>
                    <Avatar 
                      variant="rounded" 
                      src={video.thumbnailUrl} 
                      alt={video.title}
                      sx={{ width: 80, height: 45 }}
                    >
                      <VideoLibrary />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={video.title} 
                    secondary={`${video.studio?.name || 'Unknown Studio'} • ${new Date(video.likedAt).toLocaleDateString()}`}
                    sx={{ ml: 1 }}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </TabPanel>
        
        {/* Watch History Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              Watch History
            </Typography>
            <Button 
              variant="outlined" 
              color="error" 
              onClick={handleClearWatchHistory}
              disabled={loadingVideos || watchHistory.length === 0}
            >
              Clear History
            </Button>
          </Box>
          <Divider sx={{ mb: 3 }} />
          
          {loadingVideos ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : watchHistory.length === 0 ? (
            <Alert severity="info">
              Your watch history is empty.
            </Alert>
          ) : (
            <List>
              {watchHistory.slice(0, 10).map(item => (
                <ListItem 
                  key={item._id} 
                  button 
                  component={RouterLink} 
                  to={`/video/${item.video._id}`}
                  divider
                >
                  <ListItemAvatar>
                    <Avatar 
                      variant="rounded" 
                      src={item.video.thumbnailUrl} 
                      alt={item.video.title}
                      sx={{ width: 80, height: 45 }}
                    >
                      <VideoLibrary />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={item.video.title} 
                    secondary={`Watched on ${new Date(item.watchedAt).toLocaleString()}`}
                    sx={{ ml: 1 }}
                  />
                  <ListItemSecondaryAction>
                    <Typography variant="body2" color="textSecondary">
                      {Math.floor(item.progress)}% watched
                    </Typography>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </TabPanel>
      </Paper>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
          action={
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={handleCloseSnackbar}
            >
              <Close fontSize="small" />
            </IconButton>
          }
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Profile; 