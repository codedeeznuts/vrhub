import { useEffect, useRef } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';

const VRPlayer = ({ videoUrl, title }) => {
  const containerRef = useRef(null);
  const playerInitialized = useRef(false);

  useEffect(() => {
    // Load Delight VR API script
    const loadDelightVRAPI = () => {
      if (window.DelightVR) {
        initializePlayer();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://delight-vr.com/api/player.js';
      script.async = true;
      script.onload = initializePlayer;
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    };

    // Initialize the VR player
    const initializePlayer = () => {
      if (!containerRef.current || playerInitialized.current) return;

      try {
        playerInitialized.current = true;
        
        // Create player instance
        const player = new window.DelightVR.Player({
          container: containerRef.current,
          video: {
            source: videoUrl
          },
          settings: {
            autoplay: false,
            muted: false,
            loop: false,
            controls: true,
            vrButton: true,
            fullscreenButton: true,
            gyroscope: true,
            title: title
          }
        });

        // Handle player events
        player.on('ready', () => {
          console.log('VR Player ready');
        });

        player.on('error', (error) => {
          console.error('VR Player error:', error);
        });

        return () => {
          player.destroy();
          playerInitialized.current = false;
        };
      } catch (error) {
        console.error('Error initializing VR player:', error);
      }
    };

    loadDelightVRAPI();
  }, [videoUrl, title]);

  return (
    <Box sx={{ width: '100%', position: 'relative' }}>
      <Box
        ref={containerRef}
        sx={{
          width: '100%',
          aspectRatio: '16/9',
          backgroundColor: '#000',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <CircularProgress color="primary" />
        <Typography variant="body2" sx={{ ml: 2, color: '#fff' }}>
          Loading VR Player...
        </Typography>
      </Box>
    </Box>
  );
};

export default VRPlayer; 