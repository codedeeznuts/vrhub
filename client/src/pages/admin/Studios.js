import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  CircularProgress,
  Alert,
  Snackbar,
  Avatar
} from '@mui/material';
import { Add, Edit, Delete, Close, Business } from '@mui/icons-material';

const Studios = () => {
  const [studios, setStudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form dialog states
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentStudio, setCurrentStudio] = useState({ 
    name: '', 
    description: '', 
    website: '',
    logoUrl: ''
  });
  const [formErrors, setFormErrors] = useState({});
  
  // Snackbar notification
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchStudios();
  }, []);

  const fetchStudios = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/studios');
      setStudios(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch studios');
      console.error('Error fetching studios:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentStudio(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!currentStudio.name.trim()) {
      errors.name = 'Studio name is required';
    }
    
    if (currentStudio.website && !isValidUrl(currentStudio.website)) {
      errors.website = 'Please enter a valid URL';
    }
    
    if (currentStudio.logoUrl && !isValidUrl(currentStudio.logoUrl)) {
      errors.logoUrl = 'Please enter a valid URL for the logo';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleOpenAddDialog = () => {
    setCurrentStudio({ name: '', description: '', website: '', logoUrl: '' });
    setFormErrors({});
    setOpenAddDialog(true);
  };

  const handleOpenEditDialog = (studio) => {
    setCurrentStudio({ ...studio });
    setFormErrors({});
    setOpenEditDialog(true);
  };

  const handleOpenDeleteDialog = (studio) => {
    setCurrentStudio(studio);
    setOpenDeleteDialog(true);
  };

  const handleCloseDialogs = () => {
    setOpenAddDialog(false);
    setOpenEditDialog(false);
    setOpenDeleteDialog(false);
  };

  const handleAddStudio = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      await axios.post('/api/studios', currentStudio);
      await fetchStudios();
      handleCloseDialogs();
      setSnackbar({
        open: true,
        message: 'Studio added successfully',
        severity: 'success'
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add studio');
      console.error('Error adding studio:', err);
      setSnackbar({
        open: true,
        message: 'Failed to add studio: ' + (err.response?.data?.message || err.message),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditStudio = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      await axios.put(`/api/studios/${currentStudio._id}`, currentStudio);
      await fetchStudios();
      handleCloseDialogs();
      setSnackbar({
        open: true,
        message: 'Studio updated successfully',
        severity: 'success'
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update studio');
      console.error('Error updating studio:', err);
      setSnackbar({
        open: true,
        message: 'Failed to update studio: ' + (err.response?.data?.message || err.message),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudio = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/studios/${currentStudio._id}`);
      await fetchStudios();
      handleCloseDialogs();
      setSnackbar({
        open: true,
        message: 'Studio deleted successfully',
        severity: 'success'
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete studio');
      console.error('Error deleting studio:', err);
      setSnackbar({
        open: true,
        message: 'Failed to delete studio: ' + (err.response?.data?.message || err.message),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Manage Studios
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<Add />}
          onClick={handleOpenAddDialog}
        >
          Add New Studio
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {loading && studios.length === 0 ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Logo</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Website</TableCell>
                  <TableCell>Videos Count</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {studios.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No studios found. Add your first studio!
                    </TableCell>
                  </TableRow>
                ) : (
                  studios.map((studio) => (
                    <TableRow key={studio._id}>
                      <TableCell>
                        {studio.logoUrl ? (
                          <Avatar 
                            src={studio.logoUrl} 
                            alt={studio.name}
                            sx={{ width: 40, height: 40 }}
                          />
                        ) : (
                          <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
                            <Business />
                          </Avatar>
                        )}
                      </TableCell>
                      <TableCell>{studio.name}</TableCell>
                      <TableCell>{studio.description || '-'}</TableCell>
                      <TableCell>
                        {studio.website ? (
                          <a href={studio.website} target="_blank" rel="noopener noreferrer">
                            {new URL(studio.website).hostname}
                          </a>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>{studio.videosCount || 0}</TableCell>
                      <TableCell align="right">
                        <IconButton 
                          color="primary" 
                          onClick={() => handleOpenEditDialog(studio)}
                          size="small"
                        >
                          <Edit />
                        </IconButton>
                        <IconButton 
                          color="error" 
                          onClick={() => handleOpenDeleteDialog(studio)}
                          size="small"
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Add Studio Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseDialogs} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Studio</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Studio Name"
            type="text"
            fullWidth
            variant="outlined"
            value={currentStudio.name}
            onChange={handleInputChange}
            error={!!formErrors.name}
            helperText={formErrors.name}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            margin="dense"
            name="description"
            label="Description (Optional)"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={currentStudio.description}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="website"
            label="Website URL (Optional)"
            type="url"
            fullWidth
            variant="outlined"
            value={currentStudio.website}
            onChange={handleInputChange}
            error={!!formErrors.website}
            helperText={formErrors.website}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="logoUrl"
            label="Logo URL (Optional)"
            type="url"
            fullWidth
            variant="outlined"
            value={currentStudio.logoUrl}
            onChange={handleInputChange}
            error={!!formErrors.logoUrl}
            helperText={formErrors.logoUrl}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancel</Button>
          <Button 
            onClick={handleAddStudio} 
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Add Studio'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Studio Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseDialogs} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Studio</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Studio Name"
            type="text"
            fullWidth
            variant="outlined"
            value={currentStudio.name}
            onChange={handleInputChange}
            error={!!formErrors.name}
            helperText={formErrors.name}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            margin="dense"
            name="description"
            label="Description (Optional)"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={currentStudio.description}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="website"
            label="Website URL (Optional)"
            type="url"
            fullWidth
            variant="outlined"
            value={currentStudio.website}
            onChange={handleInputChange}
            error={!!formErrors.website}
            helperText={formErrors.website}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="logoUrl"
            label="Logo URL (Optional)"
            type="url"
            fullWidth
            variant="outlined"
            value={currentStudio.logoUrl}
            onChange={handleInputChange}
            error={!!formErrors.logoUrl}
            helperText={formErrors.logoUrl}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancel</Button>
          <Button 
            onClick={handleEditStudio} 
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Update Studio'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDialogs}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the studio "{currentStudio.name}"? This action cannot be undone.
            {currentStudio.videosCount > 0 && (
              <Box component="span" sx={{ display: 'block', mt: 1, color: 'error.main' }}>
                Warning: This studio is associated with {currentStudio.videosCount} videos. Deleting it will remove the studio association from those videos.
              </Box>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancel</Button>
          <Button 
            onClick={handleDeleteStudio} 
            color="error" 
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

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

export default Studios; 