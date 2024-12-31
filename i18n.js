// i18n.js  
module.exports = {  
    locales: ['en', 'fr'],  
    defaultLocale: 'en', 
    pages: {  
      '*': ['common'], // Load common translations for all pages  
      '/': ['home'], 
      '/fence': ['fence'], 
      '/scale': ['scale'],
      '/help': ['help'],
    },  
    loadLocaleFrom: (lang, ns) =>  
      import(`./src/app/locales/${lang}/${ns}.json`).then((m) => m.default),  
  };  