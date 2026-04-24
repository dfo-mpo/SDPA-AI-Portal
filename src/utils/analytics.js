// src/analytics.js
import ReactGA from 'react-ga4';

export const initGA = () => {
  ReactGA.initialize('G-4ZD2EZGKSQ');
  console.log('GA4 initialized');
};

export const trackPageview = (path) => {
  ReactGA.send({ hitType: 'pageview', page: path });
};

export const trackEvent = (category, action, label) => {
  console.log(`trackEvent called: ${category} - ${action} - ${label}`);
  ReactGA.event({ category, action, label });
};