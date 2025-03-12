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
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar
} from '@mui/material';
import { Add, Edit, Delete, Close, Person, AdminPanelSettings } from '@mui/icons-material';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form dialog states
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState({ 
    email: '', 
    password: '',
    name: '',
    role: 'user',
    isActive: true
  });
  const [formErrors, setFormErrors] = useState({});
  
  // Snackbar notification
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/users');
      
      // Map database field names to component field names
      const mappedUsers = response.data.map(user => ({
        _id: user.id,
        email: user.email,
        name: user.name,
        role: user.is_admin ? 'admin' : 'user',
        isActive: user.is_active,
        createdAt: user.created_at
      }));
      
      setUsers(mappedUsers);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentUser(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = (isNewUser) => {
    const errors = {};
    
    if (!currentUser.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(currentUser.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (isNewUser && !currentUser.password) {
      errors.password = 'Password is required';
    } else if (isNewUser && currentUser.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (!currentUser.name.trim()) {
      errors.name = 'Name is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenAddDialog = () => {
    setCurrentUser({ 
      email: '', 
      password: '',
      name: '',
      role: 'user',
      isActive: true
    });
    setFormErrors({});
    setOpenAddDialog(true);
  };

  const handleOpenEditDialog = (user) => {
    // Map user fields for the edit form
    setCurrentUser({
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      password: '' // Don't include password in edit form
    });
    setFormErrors({});
    setOpenEditDialog(true);
  };

  const handleOpenDeleteDialog = (user) => {
    setCurrentUser(user);
    setOpenDeleteDialog(true);
  };

  const handleCloseDialogs = () => {
    setOpenAddDialog(false);
    setOpenEditDialog(false);
    setOpenDeleteDialog(false);
  };

  const handleAddUser = async () => {
    if (!validateForm(true)) return;
    
    try {
      setLoading(true);
      const dataToSend = {
        email: currentUser.email,
        password: currentUser.password,
        name: currentUser.name,
        is_admin: currentUser.role === 'admin',
        is_active: currentUser.isActive
      };
      
      await axios.post('/api/users', dataToSend);
      await fetchUsers();
      handleCloseDialogs();
      setSnackbar({
        open: true,
        message: 'User added successfully',
        severity: 'success'
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add user');
      console.error('Error adding user:', err);
      setSnackbar({
        open: true,
        message: 'Failed to add user: ' + (err.response?.data?.message || err.message),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async () => {
    if (!validateForm(false)) return;
    
    try {
      setLoading(true);
      // Only send password if it was changed
      const dataToSend = { 
        email: currentUser.email,
        name: currentUser.name,
        is_admin: currentUser.role === 'admin',
        is_active: currentUser.isActive
      };
      
      if (currentUser.password) {
        dataToSend.password = currentUser.password;
      }
      
      await axios.put(`/api/users/${currentUser._id}`, dataToSend);
      await fetchUsers();
      handleCloseDialogs();
      setSnackbar({
        open: true,
        message: 'User updated successfully',
        severity: 'success'
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user');
      console.error('Error updating user:', err);
      setSnackbar({
        open: true,
        message: 'Failed to update user: ' + (err.response?.data?.message || err.message),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/users/${currentUser._id}`);
      await fetchUsers();
      handleCloseDialogs();
      setSnackbar({
        open: true,
        message: 'User deleted successfully',
        severity: 'success'
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
      console.error('Error deleting user:', err);
      setSnackbar({
        open: true,
        message: 'Failed to delete user: ' + (err.response?.data?.message || err.message),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const getInitials = (name) => {
    if (!name) return ''; // Return empty string if name is null or undefined
    
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Manage Users
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<Add />}
          onClick={handleOpenAddDialog}
        >
          Add New User
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {loading && users.length === 0 ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Joined</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No users found. Add your first user!
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ mr: 2, bgcolor: user.role === 'admin' ? 'secondary.main' : 'primary.main' }}>
                            {user.role === 'admin' ? <AdminPanelSettings /> : getInitials(user.name)}
                          </Avatar>
                          <Typography>{user.name || 'Unnamed User'}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{user.email || 'No Email'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={(user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User')} 
                          color={user.role === 'admin' ? 'secondary' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={user.isActive !== false ? 'Active' : 'Inactive'} 
                          color={user.isActive !== false ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton 
                          color="primary" 
                          onClick={() => handleOpenEditDialog(user)}
                          size="small"
                        >
                          <Edit />
                        </IconButton>
                        <IconButton 
                          color="error" 
                          onClick={() => handleOpenDeleteDialog(user)}
                          size="small"
                          disabled={user._id === localStorage.getItem('userId')} // Prevent deleting yourself
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

      {/* Add User Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseDialogs} maxWidth="sm" fullWidth>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Full Name"
            type="text"
            fullWidth
            variant="outlined"
            value={currentUser.name}
            onChange={handleInputChange}
            error={!!formErrors.name}
            helperText={formErrors.name}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            margin="dense"
            name="email"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={currentUser.email}
            onChange={handleInputChange}
            error={!!formErrors.email}
            helperText={formErrors.email}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="password"
            label="Password"
            type="password"
            fullWidth
            variant="outlined"
            value={currentUser.password}
            onChange={handleInputChange}
            error={!!formErrors.password}
            helperText={formErrors.password}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="role-select-label">Role</InputLabel>
            <Select
              labelId="role-select-label"
              name="role"
              value={currentUser.role}
              label="Role"
              onChange={handleInputChange}
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="status-select-label">Status</InputLabel>
            <Select
              labelId="status-select-label"
              name="isActive"
              value={currentUser.isActive}
              label="Status"
              onChange={handleInputChange}
            >
              <MenuItem value={true}>Active</MenuItem>
              <MenuItem value={false}>Inactive</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancel</Button>
          <Button 
            onClick={handleAddUser} 
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Add User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseDialogs} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Full Name"
            type="text"
            fullWidth
            variant="outlined"
            value={currentUser.name}
            onChange={handleInputChange}
            error={!!formErrors.name}
            helperText={formErrors.name}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            margin="dense"
            name="email"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={currentUser.email}
            onChange={handleInputChange}
            error={!!formErrors.email}
            helperText={formErrors.email}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="password"
            label="New Password (leave blank to keep current)"
            type="password"
            fullWidth
            variant="outlined"
            value={currentUser.password}
            onChange={handleInputChange}
            error={!!formErrors.password}
            helperText={formErrors.password}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="role-edit-label">Role</InputLabel>
            <Select
              labelId="role-edit-label"
              name="role"
              value={currentUser.role}
              label="Role"
              onChange={handleInputChange}
              disabled={currentUser._id === localStorage.getItem('userId')} // Can't change your own role
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="status-edit-label">Status</InputLabel>
            <Select
              labelId="status-edit-label"
              name="isActive"
              value={currentUser.isActive}
              label="Status"
              onChange={handleInputChange}
              disabled={currentUser._id === localStorage.getItem('userId')} // Can't deactivate yourself
            >
              <MenuItem value={true}>Active</MenuItem>
              <MenuItem value={false}>Inactive</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancel</Button>
          <Button 
            onClick={handleEditUser} 
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Update User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDialogs}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the user "{currentUser.name}" ({currentUser.email})? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancel</Button>
          <Button 
            onClick={handleDeleteUser} 
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

export default Users; 