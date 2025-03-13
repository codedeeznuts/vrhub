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
  Pagination
} from '@mui/material';
import { LocalOffer as TagIcon } from '@mui/icons-material';
import axios from 'axios';

const TAGS_PER_PAGE = 12;
const DEFAULT_THUMBNAIL = 'https://placehold.co/400x225/cccccc/ffffff?text=Tag';

const TagsPage = () => {
  const navigate = useNavigate();
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/tags');
        setTags(res.data);
        setTotalPages(Math.ceil(res.data.length / TAGS_PER_PAGE));
        setError(null);
      } catch (err) {
        console.error('Error fetching tags:', err);
        setError('Failed to load tags');
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo(0, 0);
  };

  const handleTagClick = (tag) => {
    const formattedTagName = tag.name.toLowerCase().replace(/\s+/g, '-');
    navigate(`/tag/${formattedTagName}`);
  };

  // Get current page tags
  const getCurrentPageTags = () => {
    const startIndex = (page - 1) * TAGS_PER_PAGE;
    const endIndex = startIndex + TAGS_PER_PAGE;
    return tags.slice(startIndex, endIndex);
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
      <Box sx={{ mt: 2, mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
          All Tags
        </Typography>

        {tags.length === 0 ? (
          <Alert severity="info">No tags found</Alert>
        ) : (
          <>
            <Grid container spacing={2}>
              {getCurrentPageTags().map(tag => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={tag.id}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      cursor: 'pointer',
                      boxShadow: 'none',
                      border: '1px solid',
                      borderColor: 'divider'
                    }}
                    onClick={() => handleTagClick(tag)}
                  >
                    <CardActionArea sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                      <CardMedia
                        component="img"
                        height="140"
                        image={tag.thumbnail_url || DEFAULT_THUMBNAIL}
                        alt={tag.name}
                      />
                      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Typography variant="h6" component="div" align="center">
                          {tag.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" align="center">
                          {tag.video_count || 0} videos
                        </Typography>
                      </CardContent>
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
                />
              </Box>
            )}
          </>
        )}
      </Box>
    </Container>
  );
};

export default TagsPage; 