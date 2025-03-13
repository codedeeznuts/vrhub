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
  Snackbar
} from '@mui/material';
import { Add, Edit, Delete, Close } from '@mui/icons-material';

const Tags = () => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form dialog states
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentTag, setCurrentTag] = useState({
    name: '',
    description: '',
    thumbnail_url: ''
  });
  const [formErrors, setFormErrors] = useState({});
  
  // Snackbar notification
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/tags');
      setTags(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch tags');
      console.error('Error fetching tags:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentTag(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!currentTag.name.trim()) {
      errors.name = 'Tag name is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenAddDialog = () => {
    setCurrentTag({ name: '', description: '', thumbnail_url: '' });
    setFormErrors({});
    setOpenAddDialog(true);
  };

  const handleOpenEditDialog = (tag) => {
    setCurrentTag({ ...tag });
    setFormErrors({});
    setOpenEditDialog(true);
  };

  const handleOpenDeleteDialog = (tag) => {
    setCurrentTag(tag);
    setOpenDeleteDialog(true);
  };

  const handleCloseDialogs = () => {
    setOpenAddDialog(false);
    setOpenEditDialog(false);
    setOpenDeleteDialog(false);
  };

  const handleAddTag = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      await axios.post('/api/tags', currentTag);
      await fetchTags();
      handleCloseDialogs();
      setSnackbar({
        open: true,
        message: 'Tag added successfully',
        severity: 'success'
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add tag');
      console.error('Error adding tag:', err);
      setSnackbar({
        open: true,
        message: 'Failed to add tag: ' + (err.response?.data?.message || err.message),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditTag = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      await axios.put(`/api/tags/${currentTag._id}`, currentTag);
      await fetchTags();
      handleCloseDialogs();
      setSnackbar({
        open: true,
        message: 'Tag updated successfully',
        severity: 'success'
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update tag');
      console.error('Error updating tag:', err);
      setSnackbar({
        open: true,
        message: 'Failed to update tag: ' + (err.response?.data?.message || err.message),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTag = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/tags/${currentTag._id}`);
      await fetchTags();
      handleCloseDialogs();
      setSnackbar({
        open: true,
        message: 'Tag deleted successfully',
        severity: 'success'
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete tag');
      console.error('Error deleting tag:', err);
      setSnackbar({
        open: true,
        message: 'Failed to delete tag: ' + (err.response?.data?.message || err.message),
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
          Manage Tags
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<Add />}
          onClick={handleOpenAddDialog}
        >
          Add New Tag
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {loading && tags.length === 0 ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Thumbnail</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Videos Count</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tags.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No tags found. Add your first tag!
                    </TableCell>
                  </TableRow>
                ) : (
                  tags.map((tag) => (
                    <TableRow key={tag._id}>
                      <TableCell>{tag.name}</TableCell>
                      <TableCell>
                        {tag.thumbnail_url ? (
                          <Box
                            component="img"
                            src={tag.thumbnail_url}
                            alt={tag.name}
                            sx={{ height: 40, width: 'auto', borderRadius: 1 }}
                          />
                        ) : (
                          'No thumbnail'
                        )}
                      </TableCell>
                      <TableCell>{tag.description || '-'}</TableCell>
                      <TableCell>{tag.videosCount || 0}</TableCell>
                      <TableCell align="right">
                        <IconButton 
                          color="primary" 
                          onClick={() => handleOpenEditDialog(tag)}
                          size="small"
                        >
                          <Edit />
                        </IconButton>
                        <IconButton 
                          color="error" 
                          onClick={() => handleOpenDeleteDialog(tag)}
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

      {/* Add Tag Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseDialogs} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Tag</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Tag Name"
            type="text"
            fullWidth
            variant="outlined"
            value={currentTag.name}
            onChange={handleInputChange}
            error={!!formErrors.name}
            helperText={formErrors.name}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            margin="dense"
            name="thumbnail_url"
            label="Thumbnail URL"
            type="text"
            fullWidth
            variant="outlined"
            value={currentTag.thumbnail_url}
            onChange={handleInputChange}
            helperText="URL to an image that represents this tag"
            sx={{ mb: 2 }}
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
            value={currentTag.description}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancel</Button>
          <Button 
            onClick={handleAddTag} 
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Add Tag'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Tag Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseDialogs} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Tag</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Tag Name"
            type="text"
            fullWidth
            variant="outlined"
            value={currentTag.name}
            onChange={handleInputChange}
            error={!!formErrors.name}
            helperText={formErrors.name}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            margin="dense"
            name="thumbnail_url"
            label="Thumbnail URL"
            type="text"
            fullWidth
            variant="outlined"
            value={currentTag.thumbnail_url}
            onChange={handleInputChange}
            helperText="URL to an image that represents this tag"
            sx={{ mb: 2 }}
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
            value={currentTag.description}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancel</Button>
          <Button 
            onClick={handleEditTag} 
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Update Tag'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDialogs}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the tag "{currentTag.name}"? This action cannot be undone.
            {currentTag.videosCount > 0 && (
              <Box component="span" sx={{ display: 'block', mt: 1, color: 'error.main' }}>
                Warning: This tag is used in {currentTag.videosCount} videos. Deleting it will remove the tag from those videos.
              </Box>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancel</Button>
          <Button 
            onClick={handleDeleteTag} 
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

export default Tags; 