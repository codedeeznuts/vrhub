import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CssBaseline, Box } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SettingsProvider } from './context/SettingsContext';

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

// Layout component for main app routes
const MainLayout = ({ children }) => (
  <>
    <Navbar />
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        {children}
      </Box>
    </Box>
  </>
);

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <SettingsProvider>
          <Router>
            <CssBaseline />
            <Routes>
              {/* Auth Routes - Standalone without sidebar */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
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
              <Route path="/" element={<MainLayout><Home /></MainLayout>} />
              <Route path="/video/:id" element={<MainLayout><VideoPage /></MainLayout>} />
              <Route path="/tag/:id" element={<MainLayout><TagVideos /></MainLayout>} />
              <Route path="/studio/:id" element={<MainLayout><StudioVideos /></MainLayout>} />
              <Route path="/search" element={<MainLayout><SearchResults /></MainLayout>} />
              <Route path="/liked" element={<MainLayout><PrivateRoute><LikedVideos /></PrivateRoute></MainLayout>} />
              <Route path="/profile" element={<MainLayout><PrivateRoute><Profile /></PrivateRoute></MainLayout>} />
              
              {/* 404 Route */}
              <Route path="*" element={<MainLayout><NotFound /></MainLayout>} />
            </Routes>
          </Router>
        </SettingsProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
