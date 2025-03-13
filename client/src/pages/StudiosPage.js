import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  CardMedia,
  CircularProgress,
  Alert,
  Pagination,
  Avatar
} from '@mui/material';
import { Business as StudioIcon } from '@mui/icons-material';
import axios from 'axios';

const STUDIOS_PER_PAGE = 12;

const StudiosPage = () => {
  const navigate = useNavigate();
  const [studios, setStudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchStudios = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/studios');
        setStudios(res.data);
        setTotalPages(Math.ceil(res.data.length / STUDIOS_PER_PAGE));
        setError(null);
      } catch (err) {
        console.error('Error fetching studios:', err);
        setError('Failed to load studios');
      } finally {
        setLoading(false);
      }
    };

    fetchStudios();
  }, []);

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo(0, 0);
  };

  const handleStudioClick = (studio) => {
    const formattedStudioName = studio.name.toLowerCase().replace(/\s+/g, '-');
    navigate(`/studio/${formattedStudioName}`);
  };

  // Get current page studios
  const getCurrentPageStudios = () => {
    const startIndex = (page - 1) * STUDIOS_PER_PAGE;
    const endIndex = startIndex + STUDIOS_PER_PAGE;
    return studios.slice(startIndex, endIndex);
  };

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        All Studios
      </Typography>

      {studios.length === 0 ? (
        <Alert severity="info">No studios found</Alert>
      ) : (
        <>
          <Grid container spacing={2}>
            {getCurrentPageStudios().map(studio => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={studio.id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    border: '1px solid rgba(0, 0, 0, 0.12)',
                    borderRadius: 1,
                    boxShadow: 'none'
                  }}
                >
                  <CardActionArea 
                    sx={{ height: '100%' }}
                    onClick={() => handleStudioClick(studio)}
                  >
                    <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                      <Avatar 
                        src={studio.logo_url} 
                        alt={studio.name}
                        sx={{ width: 64, height: 64, mr: 2 }}
                      />
                      <Box sx={{ width: 'calc(100% - 80px)', pr: 1 }}>
                        <Typography variant="h6" noWrap>{studio.name}</Typography>
                        {studio.description && (
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical'
                            }}
                          >
                            {studio.description}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange} 
                color="primary" 
                size="large"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default StudiosPage; 