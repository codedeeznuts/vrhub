import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import axios from 'axios';

const Videos = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // State for videos list
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for form dialog
  const [openForm, setOpenForm] = useState(false);
  const [formMode, setFormMode] = useState('add'); // 'add' or 'edit'
  const [formData, setFormData] = useState({
    id: null,
    title: '',
    description: '',
    studio_id: '',
    video_url: '',
    thumbnail_url: '',
    tags: []
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  
  // State for delete confirmation dialog
  const [openDelete, setOpenDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteTitle, setDeleteTitle] = useState('');
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  
  // State for snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // State for tags and studios (for form select options)
  const [tags, setTags] = useState([]);
  const [studios, setStudios] = useState([]);

  // Fetch videos, tags, and studios on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [videosRes, tagsRes, studiosRes] = await Promise.all([
          axios.get('/api/videos'),
          axios.get('/api/tags'),
          axios.get('/api/studios')
        ]);
        
        setVideos(videosRes.data.videos);
        setTags(tagsRes.data);
        setStudios(studiosRes.data);
        
        // Check if there's an edit query parameter
        const params = new URLSearchParams(location.search);
        const editId = params.get('edit');
        
        if (editId) {
          const videoToEdit = videosRes.data.videos.find(
            v => v.id === parseInt(editId)
          );
          
          if (videoToEdit) {
            handleEdit(videoToEdit);
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [location.search]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle tag selection changes
  const handleTagsChange = (event) => {
    const { value } = event.target;
    setFormData({
      ...formData,
      tags: typeof value === 'string' ? value.split(',') : value
    });
  };

  // Open form dialog for adding a new video
  const handleAdd = () => {
    setFormData({
      id: null,
      title: '',
      description: '',
      studio_id: '',
      video_url: '',
      thumbnail_url: '',
      tags: []
    });
    setFormMode('add');
    setFormError('');
    setOpenForm(true);
  };

  // Open form dialog for editing a video
  const handleEdit = (video) => {
    setFormData({
      id: video.id,
      title: video.title,
      description: video.description || '',
      studio_id: video.studio_id || '',
      video_url: video.video_url,
      thumbnail_url: video.thumbnail_url || '',
      tags: video.tags ? video.tags.map(tag => tag.id) : []
    });
    setFormMode('edit');
    setFormError('');
    setOpenForm(true);
  };

  // Open delete confirmation dialog
  const handleDeleteConfirm = (video) => {
    setDeleteId(video.id);
    setDeleteTitle(video.title);
    setOpenDelete(true);
  };

  // Close form dialog
  const handleFormClose = () => {
    setOpenForm(false);
    
    // Remove edit query parameter if present
    if (location.search.includes('edit=')) {
      navigate('/admin/videos');
    }
  };

  // Submit form (add or edit)
  const handleFormSubmit = async () => {
    // Validate form
    if (!formData.title || !formData.video_url) {
      setFormError('Title and video URL are required');
      return;
    }

    try {
      setFormSubmitting(true);
      setFormError('');
      
      const videoData = {
        title: formData.title,
        description: formData.description,
        studio_id: formData.studio_id || null,
        video_url: formData.video_url,
        thumbnail_url: formData.thumbnail_url || null,
        tags: formData.tags
      };
      
      let response;
      
      if (formMode === 'add') {
        response = await axios.post('/api/videos', videoData);
        
        // Add the new video to the list
        setVideos([response.data, ...videos]);
        
        setSnackbar({
          open: true,
          message: 'Video added successfully',
          severity: 'success'
        });
      } else {
        response = await axios.put(`/api/videos/${formData.id}`, videoData);
        
        // Update the video in the list
        setVideos(videos.map(video => 
          video.id === formData.id ? response.data : video
        ));
        
        setSnackbar({
          open: true,
          message: 'Video updated successfully',
          severity: 'success'
        });
      }
      
      handleFormClose();
    } catch (err) {
      console.error('Error submitting form:', err);
      setFormError(err.response?.data?.msg || 'Failed to save video');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete a video
  const handleDelete = async () => {
    try {
      setDeleteSubmitting(true);
      
      await axios.delete(`/api/videos/${deleteId}`);
      
      // Remove the video from the list
      setVideos(videos.filter(video => video.id !== deleteId));
      
      setSnackbar({
        open: true,
        message: 'Video deleted successfully',
        severity: 'success'
      });
      
      setOpenDelete(false);
    } catch (err) {
      console.error('Error deleting video:', err);
      
      setSnackbar({
        open: true,
        message: err.response?.data?.msg || 'Failed to delete video',
        severity: 'error'
      });
    } finally {
      setDeleteSubmitting(false);
    }
  };

  // Close snackbar
  const handleSnackbarClose = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Manage Videos
          </Typography>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAdd}
          >
            Add Video
          </Button>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {videos.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              No videos found
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAdd}
              sx={{ mt: 2 }}
            >
              Add Your First Video
            </Button>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Studio</TableCell>
                  <TableCell>Tags</TableCell>
                  <TableCell>Date Added</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {videos.map((video) => (
                  <TableRow key={video.id}>
                    <TableCell>{video.title}</TableCell>
                    <TableCell>{video.studio_name || '-'}</TableCell>
                    <TableCell>
                      {video.tags && video.tags.length > 0 ? (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {video.tags.map(tag => (
                            <Chip key={tag.id} label={tag.name} size="small" />
                          ))}
                        </Box>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(video.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        onClick={() => handleEdit(video)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteConfirm(video)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
      
      {/* Add/Edit Video Dialog */}
      <Dialog open={openForm} onClose={handleFormClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {formMode === 'add' ? 'Add New Video' : 'Edit Video'}
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleFormClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        
        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}
          
          <TextField
            margin="dense"
            name="title"
            label="Title"
            fullWidth
            required
            value={formData.title}
            onChange={handleInputChange}
          />
          
          <TextField
            margin="dense"
            name="description"
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={formData.description}
            onChange={handleInputChange}
          />
          
          <FormControl fullWidth margin="dense">
            <InputLabel>Studio</InputLabel>
            <Select
              name="studio_id"
              value={formData.studio_id}
              onChange={handleInputChange}
              label="Studio"
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {studios.map(studio => (
                <MenuItem key={studio.id} value={studio.id}>
                  {studio.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl fullWidth margin="dense">
            <InputLabel>Tags</InputLabel>
            <Select
              multiple
              value={formData.tags}
              onChange={handleTagsChange}
              input={<OutlinedInput label="Tags" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((tagId) => {
                    const tag = tags.find(t => t.id === tagId);
                    return tag ? (
                      <Chip key={tag.id} label={tag.name} size="small" />
                    ) : null;
                  })}
                </Box>
              )}
            >
              {tags.map(tag => (
                <MenuItem key={tag.id} value={tag.id}>
                  {tag.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            margin="dense"
            name="video_url"
            label="Video URL"
            fullWidth
            required
            value={formData.video_url}
            onChange={handleInputChange}
            helperText="External URL to the VR video"
          />
          
          <TextField
            margin="dense"
            name="thumbnail_url"
            label="Thumbnail URL"
            fullWidth
            value={formData.thumbnail_url}
            onChange={handleInputChange}
            helperText="External URL to the thumbnail image (optional)"
          />
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleFormClose}>Cancel</Button>
          <Button
            onClick={handleFormSubmit}
            variant="contained"
            disabled={formSubmitting}
          >
            {formSubmitting ? (
              <CircularProgress size={24} />
            ) : formMode === 'add' ? (
              'Add Video'
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle>Delete Video</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the video "{deleteTitle}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDelete(false)}>Cancel</Button>
          <Button
            onClick={handleDelete}
            color="error"
            disabled={deleteSubmitting}
          >
            {deleteSubmitting ? (
              <CircularProgress size={24} />
            ) : (
              'Delete'
            )}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Videos; 