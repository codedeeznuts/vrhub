import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    siteName: 'VR Hub',
    siteDescription: 'The best platform for VR videos',
    contactEmail: 'contact@vrhub.com',
    maxUploadSize: 1024,
    allowRegistration: true,
    maintenanceMode: false,
    analyticsId: '',
    featuredVideosCount: 6,
    defaultPageSize: 12
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/settings');
        if (response.data) {
          setSettings(response.data);
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Update document title when siteName changes
  useEffect(() => {
    if (settings.siteName) {
      document.title = settings.siteName;
    }
  }, [settings.siteName]);

  return (
    <SettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsContext; 