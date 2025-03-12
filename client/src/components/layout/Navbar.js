import { useState, useContext } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  IconButton,
  InputBase,
  Menu,
  MenuItem,
  Avatar,
  Tooltip,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
  Search as SearchIcon,
  Brightness4 as DarkIcon,
  Brightness7 as LightIcon,
  Menu as MenuIcon,
  AccountCircle
} from '@mui/icons-material';
import AuthContext from '../../context/AuthContext';
import ThemeContext from '../../context/ThemeContext';
import SettingsContext from '../../context/SettingsContext';

// Styled search component
const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

const Navbar = () => {
  const { isAuthenticated, isAdmin, user, logout } = useContext(AuthContext);
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const { settings } = useContext(SettingsContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [anchorEl, setAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = useState(null);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMobileMenuAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar 
        position="fixed" 
        elevation={0} 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
              onClick={handleMobileMenuOpen}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'none', sm: 'flex' },
              fontWeight: 700,
              letterSpacing: '.1rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            {settings.siteName}
          </Typography>

          <form onSubmit={handleSearch} style={{ flexGrow: 1 }}>
            <Search>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Search videos…"
                inputProps={{ 'aria-label': 'search' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Search>
          </form>

          <Box sx={{ flexGrow: 1 }} />

          <IconButton onClick={toggleTheme} color="inherit">
            {darkMode ? <LightIcon /> : <DarkIcon />}
          </IconButton>

          {isAuthenticated ? (
            <Box sx={{ display: 'flex' }}>
              <Tooltip title="Account settings">
                <IconButton
                  onClick={handleProfileMenuOpen}
                  size="large"
                  edge="end"
                  aria-label="account of current user"
                  aria-haspopup="true"
                  color="inherit"
                >
                  <Avatar sx={{ width: 32, height: 32 }}>
                    {user?.email?.charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                {isAdmin && (
                  <MenuItem onClick={() => { handleMenuClose(); navigate('/admin'); }}>
                    Admin Dashboard
                  </MenuItem>
                )}
                <MenuItem onClick={() => { handleMenuClose(); navigate('/liked'); }}>
                  Liked Videos
                </MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </Box>
          ) : (
            <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
              <Button
                component={RouterLink}
                to="/login"
                color="inherit"
                sx={{ ml: 1 }}
              >
                Login
              </Button>
              <Button
                component={RouterLink}
                to="/register"
                color="inherit"
                sx={{ ml: 1 }}
              >
                Register
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Menu */}
      <Menu
        anchorEl={mobileMenuAnchorEl}
        open={Boolean(mobileMenuAnchorEl)}
        onClose={() => setMobileMenuAnchorEl(null)}
      >
        {!isAuthenticated ? [
          <MenuItem key="login" onClick={() => { setMobileMenuAnchorEl(null); navigate('/login'); }}>
            Login
          </MenuItem>,
          <MenuItem key="register" onClick={() => { setMobileMenuAnchorEl(null); navigate('/register'); }}>
            Register
          </MenuItem>
        ] : [
          isAdmin && 
          <MenuItem key="admin" onClick={() => { setMobileMenuAnchorEl(null); navigate('/admin'); }}>
            Admin Dashboard
          </MenuItem>,
          <MenuItem key="liked" onClick={() => { setMobileMenuAnchorEl(null); navigate('/liked'); }}>
            Liked Videos
          </MenuItem>,
          <MenuItem key="logout" onClick={() => { setMobileMenuAnchorEl(null); logout(); navigate('/'); }}>
            Logout
          </MenuItem>
        ].filter(Boolean)}
      </Menu>
    </Box>
  );
};

export default Navbar; 