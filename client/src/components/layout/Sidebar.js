import { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Home as HomeIcon,
  VideoLibrary as VideoIcon,
  LocalOffer as TagIcon,
  Business as StudioIcon,
  Favorite as LikeIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';

// Drawer width
const drawerWidth = 240;

const Sidebar = () => {
  const { isAuthenticated, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [tags, setTags] = useState([]);
  const [studios, setStudios] = useState([]);
  const [activeTab, setActiveTab] = useState('videos');

  // Fetch tags and studios on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tagsRes, studiosRes] = await Promise.all([
          axios.get('/api/tags'),
          axios.get('/api/studios')
        ]);
        setTags(tagsRes.data);
        setStudios(studiosRes.data);
      } catch (err) {
        console.error('Error fetching sidebar data:', err);
      }
    };

    fetchData();
  }, []);

  // Update active tab based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path === '/') {
      setActiveTab('videos');
    } else if (path.startsWith('/tag/') || path === '/tags') {
      setActiveTab('tags');
    } else if (path.startsWith('/studio/') || path === '/studios') {
      setActiveTab('studios');
    } else if (path === '/liked') {
      setActiveTab('liked');
    } else if (path.startsWith('/admin')) {
      setActiveTab('admin');
    }
  }, [location.pathname]);

  // Handle navigation
  const handleNavigation = (path, tab) => {
    setActiveTab(tab);
    navigate(path);
  };

  // Sidebar content
  const sidebarContent = (
    <>
      <Box sx={{ 
        overflow: 'auto', 
        mt: 8,
        '&::-webkit-scrollbar': {
          display: 'none'
        },
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}>
        <List>
          <ListItem disablePadding>
            <ListItemButton
              selected={activeTab === 'videos'}
              onClick={() => handleNavigation('/', 'videos')}
            >
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Home" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton
              selected={activeTab === 'tags'}
              onClick={() => handleNavigation('/tags', 'tags')}
            >
              <ListItemIcon>
                <TagIcon />
              </ListItemIcon>
              <ListItemText primary="Tags" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton
              selected={activeTab === 'studios'}
              onClick={() => handleNavigation('/studios', 'studios')}
            >
              <ListItemIcon>
                <StudioIcon />
              </ListItemIcon>
              <ListItemText primary="Studios" />
            </ListItemButton>
          </ListItem>

          {isAuthenticated && (
            <ListItem disablePadding>
              <ListItemButton
                selected={activeTab === 'liked'}
                onClick={() => handleNavigation('/liked', 'liked')}
              >
                <ListItemIcon>
                  <LikeIcon />
                </ListItemIcon>
                <ListItemText primary="Liked Videos" />
              </ListItemButton>
            </ListItem>
          )}
        </List>

        {/* Categories Section */}
        <Divider />
        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleNavigation('/tags', 'tags')}>
              <Typography variant="subtitle2" color="text.secondary">
                Categories
              </Typography>
            </ListItemButton>
          </ListItem>
          {tags
            .sort((a, b) => (b.video_count || 0) - (a.video_count || 0))
            .slice(0, 10)
            .map(tag => (
              <ListItem key={tag.id} disablePadding>
                <ListItemButton
                  selected={location.pathname === `/tag/${tag.name.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => handleNavigation(`/tag/${tag.name.toLowerCase().replace(/\s+/g, '-')}`, 'tags')}
                >
                  <ListItemIcon>
                    <TagIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={tag.name} 
                    primaryTypographyProps={{ 
                      noWrap: true,
                      style: { textOverflow: 'ellipsis' }
                    }} 
                  />
                </ListItemButton>
              </ListItem>
            ))}
        </List>

        {isAdmin && (
          <>
            <Divider />
            <List>
              <ListItem>
                <Typography variant="subtitle2" color="text.secondary">
                  Admin
                </Typography>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  selected={activeTab === 'admin'}
                  onClick={() => handleNavigation('/admin', 'admin')}
                >
                  <ListItemIcon>
                    <AdminIcon />
                  </ListItemIcon>
                  <ListItemText primary="Dashboard" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  selected={location.pathname === '/admin/videos'}
                  onClick={() => handleNavigation('/admin/videos', 'admin')}
                >
                  <ListItemIcon>
                    <VideoIcon />
                  </ListItemIcon>
                  <ListItemText primary="Manage Videos" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  selected={location.pathname === '/admin/tags'}
                  onClick={() => handleNavigation('/admin/tags', 'admin')}
                >
                  <ListItemIcon>
                    <TagIcon />
                  </ListItemIcon>
                  <ListItemText primary="Manage Tags" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  selected={location.pathname === '/admin/studios'}
                  onClick={() => handleNavigation('/admin/studios', 'admin')}
                >
                  <ListItemIcon>
                    <StudioIcon />
                  </ListItemIcon>
                  <ListItemText primary="Manage Studios" />
                </ListItemButton>
              </ListItem>
            </List>
          </>
        )}
      </Box>
    </>
  );

  return (
    <>
      {!isMobile ? (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: { 
              width: drawerWidth, 
              boxSizing: 'border-box',
              zIndex: (theme) => theme.zIndex.appBar - 1 
            },
          }}
        >
          {sidebarContent}
        </Drawer>
      ) : null}
    </>
  );
};

export default Sidebar; 