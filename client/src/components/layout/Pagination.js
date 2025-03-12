import { Pagination as MuiPagination, Box } from '@mui/material';

const Pagination = ({ page, totalPages, onPageChange }) => {
  const handleChange = (event, value) => {
    onPageChange(value);
    
    // Scroll to top when page changes
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
      <MuiPagination
        count={totalPages}
        page={page}
        onChange={handleChange}
        color="primary"
        size="large"
        showFirstButton
        showLastButton
      />
    </Box>
  );
};

export default Pagination; 