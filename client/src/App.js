import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CssBaseline, Box } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Layout Components
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import AdminLayout from './components/admin/AdminLayout';

// Page Components
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VideoPage from './pages/VideoPage';
import TagVideos from './pages/TagVideos';
import StudioVideos from './pages/StudioVideos';
import LikedVideos from './pages/LikedVideos';
import SearchResults from './pages/SearchResults';
import Profile from './pages/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminVideos from './pages/admin/Videos';
import AdminTags from './pages/admin/Tags';
import AdminStudios from './pages/admin/Studios';
import AdminUsers from './pages/admin/Users';
import AdminSettings from './pages/admin/Settings';
import NotFound from './pages/NotFound';

// Route Protection
import PrivateRoute from './components/routing/PrivateRoute';
import AdminRoute from './components/routing/AdminRoute';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <CssBaseline />
          <Routes>
            {/* Admin Routes with AdminLayout */}
            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="videos" element={<AdminVideos />} />
              <Route path="tags" element={<AdminTags />} />
              <Route path="studios" element={<AdminStudios />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
            
            {/* Main App Routes */}
            <Route path="/" element={
              <>
                <Navbar />
                <Box sx={{ display: 'flex' }}>
                  <Sidebar />
                  <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
                    <Routes>
                      {/* Public Routes */}
                      <Route index element={<Home />} />
                      <Route path="login" element={<Login />} />
                      <Route path="register" element={<Register />} />
                      <Route path="video/:id" element={<VideoPage />} />
                      <Route path="tag/:id" element={<TagVideos />} />
                      <Route path="studio/:id" element={<StudioVideos />} />
                      <Route path="search" element={<SearchResults />} />

                      {/* Protected Routes */}
                      <Route path="liked" element={<PrivateRoute><LikedVideos /></PrivateRoute>} />
                      <Route path="profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                      
                      {/* 404 Route */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Box>
                </Box>
              </>
            } />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
