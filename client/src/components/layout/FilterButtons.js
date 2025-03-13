import React from 'react';
import {
  Box,
  ToggleButtonGroup,
  ToggleButton,
  Typography
} from '@mui/material';
import {
  NewReleases as NewIcon,
  Favorite as LikeIcon,
  Shuffle as RandomIcon
} from '@mui/icons-material';

const FilterButtons = ({ value, onChange }) => {
  return (
    <Box sx={{ mb: 2 }}>
      <ToggleButtonGroup
        value={value}
        exclusive
        onChange={onChange}
        aria-label="video sorting"
        size="small"
        sx={{
          '& .MuiToggleButtonGroup-grouped': {
            border: 0,
            mx: 0.25,
            px: 1, // Reduced horizontal padding inside buttons
            py: 0.25, // Reduced vertical padding
            minWidth: 'auto', // Allow buttons to be smaller
            '&.Mui-selected': {
              borderRadius: '15px',
              backgroundColor: 'primary.main',
              color: 'white',
              '&:hover': {
                backgroundColor: 'primary.dark',
              }
            },
            '&:not(:first-of-type)': {
              borderRadius: '15px',
            },
            '&:first-of-type': {
              borderRadius: '15px',
            }
          }
        }}
      >
        <ToggleButton value="newest" aria-label="sort by newest">
          <NewIcon fontSize="small" sx={{ mr: 0.25, fontSize: '0.875rem' }} />
          <Typography variant="caption" sx={{ fontWeight: 'medium' }}>NEW</Typography>
        </ToggleButton>
        <ToggleButton value="most_liked" aria-label="sort by most liked">
          <LikeIcon fontSize="small" sx={{ mr: 0.25, fontSize: '0.875rem' }} />
          <Typography variant="caption" sx={{ fontWeight: 'medium' }}>MOST LIKED</Typography>
        </ToggleButton>
        <ToggleButton value="random" aria-label="sort randomly">
          <RandomIcon fontSize="small" sx={{ mr: 0.25, fontSize: '0.875rem' }} />
          <Typography variant="caption" sx={{ fontWeight: 'medium' }}>RANDOM</Typography>
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};

export default FilterButtons; 