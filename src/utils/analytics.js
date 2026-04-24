// src/utils/analytics.js

export const initGA = () => {
  window.dataLayer = window.dataLayer || [];
  console.log('dataLayer initialized');
};

export const trackPageview = (path) => {
  window.dataLayer.push({
    event: 'pageview',
    page: path,
  });
};

export const trackEvent = (category, action, label) => {
  console.log(`trackEvent called: ${category} - ${action} - ${label}`);
  window.dataLayer.push({
    event: action,
    event_category: category,
    event_label: label,
  });
};