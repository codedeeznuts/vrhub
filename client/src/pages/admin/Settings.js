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
  Switch,
  FormControlLabel,
  FormGroup,
  Divider,
  CircularProgress,
  Alert,
  Snackbar,
  IconButton,
  Card,
  CardContent,
  CardActions,
  InputAdornment
} from '@mui/material';
import { Save, Close, Settings as SettingsIcon } from '@mui/icons-material';

const Settings = () => {
  const [settings, setSettings] = useState({
    siteName: 'VR Hub',
    siteDescription: 'The best platform for VR videos',
    contactEmail: 'contact@vrhub.com',
    maxUploadSize: 1024,
    allowRegistration: true,
    maintenanceMode: false,
    analyticsId: '',
    featuredVideosCount: 6,
    defaultPageSize: 12
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  // Snackbar notification
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/settings');
      if (response.data) {
        setSettings(response.data);
      }
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch settings');
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) || value === '') {
      setSettings(prev => ({
        ...prev,
        [name]: value === '' ? '' : numValue
      }));
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      await axios.put('/api/settings', settings);
      setSnackbar({
        open: true,
        message: 'Settings saved successfully',
        severity: 'success'
      });
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save settings');
      console.error('Error saving settings:', err);
      setSnackbar({
        open: true,
        message: 'Failed to save settings: ' + (err.response?.data?.message || err.message),
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading) {
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Site Settings
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<Save />}
          onClick={handleSaveSettings}
          disabled={saving}
        >
          {saving ? <CircularProgress size={24} /> : 'Save Settings'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* General Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <SettingsIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">General Settings</Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />
              
              <TextField
                fullWidth
                label="Site Name"
                name="siteName"
                value={settings.siteName}
                onChange={handleInputChange}
                margin="normal"
                variant="outlined"
              />
              
              <TextField
                fullWidth
                label="Site Description"
                name="siteDescription"
                value={settings.siteDescription}
                onChange={handleInputChange}
                margin="normal"
                variant="outlined"
                multiline
                rows={2}
              />
              
              <TextField
                fullWidth
                label="Contact Email"
                name="contactEmail"
                type="email"
                value={settings.contactEmail}
                onChange={handleInputChange}
                margin="normal"
                variant="outlined"
              />
              
              <TextField
                fullWidth
                label="Google Analytics ID"
                name="analyticsId"
                value={settings.analyticsId}
                onChange={handleInputChange}
                margin="normal"
                variant="outlined"
                placeholder="UA-XXXXXXXXX-X"
              />
            </CardContent>
          </Card>
        </Grid>
        
        {/* Content Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <SettingsIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Content Settings</Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />
              
              <TextField
                fullWidth
                label="Max Upload Size (MB)"
                name="maxUploadSize"
                type="number"
                value={settings.maxUploadSize}
                onChange={handleNumberChange}
                margin="normal"
                variant="outlined"
                InputProps={{
                  endAdornment: <InputAdornment position="end">MB</InputAdornment>,
                }}
              />
              
              <TextField
                fullWidth
                label="Featured Videos Count"
                name="featuredVideosCount"
                type="number"
                value={settings.featuredVideosCount}
                onChange={handleNumberChange}
                margin="normal"
                variant="outlined"
              />
              
              <TextField
                fullWidth
                label="Default Page Size"
                name="defaultPageSize"
                type="number"
                value={settings.defaultPageSize}
                onChange={handleNumberChange}
                margin="normal"
                variant="outlined"
              />
            </CardContent>
          </Card>
        </Grid>
        
        {/* System Settings */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <SettingsIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">System Settings</Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />
              
              <FormGroup>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.allowRegistration}
                          onChange={handleInputChange}
                          name="allowRegistration"
                          color="primary"
                        />
                      }
                      label="Allow User Registration"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.maintenanceMode}
                          onChange={handleInputChange}
                          name="maintenanceMode"
                          color="warning"
                        />
                      }
                      label="Maintenance Mode"
                    />
                  </Grid>
                </Grid>
              </FormGroup>
              
              {settings.maintenanceMode && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  When maintenance mode is enabled, only administrators can access the site.
                </Alert>
              )}
            </CardContent>
            <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<Save />}
                onClick={handleSaveSettings}
                disabled={saving}
              >
                {saving ? <CircularProgress size={24} /> : 'Save Settings'}
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

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

export default Settings; 