import { useState, useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';

const VRPlayer = ({ videoUrl, title, thumbnailUrl }) => {
  const [error, setError] = useState(null);
  const containerRef = useRef(null);
  const scriptLoaded = useRef(false);
  
  useEffect(() => {
    // Reset error state when video URL changes
    setError(null);
    
    // Function to load the DL8 script
    const loadScript = () => {
      return new Promise((resolve, reject) => {
        // Check if script is already in document
        if (document.querySelector('script[src*="dl8-d56e7d4505e6950eac9b8bea589db2be04de18c8.js"]')) {
          scriptLoaded.current = true;
          resolve();
          return;
        }
        
        // Create script element
        const script = document.createElement('script');
        script.src = '//cdn.delight-vr.com/latest/dl8-d56e7d4505e6950eac9b8bea589db2be04de18c8.js';
        script.async = true;
        
        // Set up event handlers
        script.onload = () => {
          scriptLoaded.current = true;
          resolve();
        };
        
        script.onerror = () => {
          reject(new Error('Failed to load DL8 player script'));
        };
        
        // Add script to document
        document.head.appendChild(script);
      });
    };
    
    // Function to initialize the player
    const initializePlayer = () => {
      if (!containerRef.current) return;
      
      // Clear any existing content
      containerRef.current.innerHTML = '';
      
      // Create the dl8-video element
      const playerElement = document.createElement('dl8-video');
      playerElement.setAttribute('title', title || 'VR Video');
      playerElement.setAttribute('format', 'STEREO_180_LR');
      playerElement.setAttribute('display-mode', 'stereo');
      playerElement.setAttribute('loop', '');
      
      // Add poster/thumbnail if available
      if (thumbnailUrl) {
        playerElement.setAttribute('poster', thumbnailUrl);
      }
      
      playerElement.style.width = '100%';
      playerElement.style.height = '100%';
      
      // Add event listener for errors
      playerElement.addEventListener('error', (e) => {
        console.error('DL8 player error:', e);
        setError('Error playing VR video. The format may be unsupported.');
      });
      
      // Create source element
      const sourceElement = document.createElement('source');
      sourceElement.src = videoUrl;
      sourceElement.type = 'video/mp4';
      
      // Append source to player
      playerElement.appendChild(sourceElement);
      
      // Append player to container
      containerRef.current.appendChild(playerElement);
    };
    
    // Load script and initialize player
    loadScript()
      .then(() => {
        initializePlayer();
      })
      .catch((err) => {
        setError(err.message);
      });
    
    // Cleanup function
    return () => {
      // Just clear the container
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [videoUrl, title, thumbnailUrl]); // Dependencies
  
  return (
    <Box sx={{ width: '100%', position: 'relative' }}>
      {/* DL8 VR Player Container */}
      <Box
        ref={containerRef}
        sx={{
          width: '100%',
          aspectRatio: '16/9',
          backgroundColor: '#000',
          position: 'relative'
        }}
      />
      
      {/* Error Message */}
      {error && (
        <Box 
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            zIndex: 10,
            backgroundColor: 'rgba(0,0,0,0.7)'
          }}
        >
          <Typography variant="body2" sx={{ color: '#fff', textAlign: 'center' }}>
            {error}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default VRPlayer; 