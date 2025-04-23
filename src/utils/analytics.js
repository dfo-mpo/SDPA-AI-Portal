// src/analytics.js
import ReactGA from 'react-ga4';

export const initGA = () => {
  ReactGA.initialize('G-TSWGKRCXVQ'); // replace with your Measurement ID
};

export const trackPageview = (path) => {
  ReactGA.send({ hitType: 'pageview', page: path });
};

export const trackEvent = (category, action, label) => {
    ReactGA.event({ category, action, label });
  };
  
  
