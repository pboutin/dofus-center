/* jshint node: true */

module.exports = function(environment) {
  var ENV = {
    modulePrefix: 'dofus-workbench',
    environment: environment,
    baseURL: '',
    locationType: 'auto',
    dofusDataRepository: 'https://raw.githubusercontent.com/pboutin/dofus-data/master/',
    dofusDataIssuesUrl: 'https://github.com/pboutin/dofus-data/issues/new',
    dofusWorkbenchIssuesUrl: 'https://github.com/pboutin/dofus-workbench/issues/new',
    firebase: {
      apiKey: 'YOUR_KEY',
      authDomain: 'YOUR_FIREBASE_APP.firebaseapp.com',
      databaseURL: 'https://YOUR_FIREBASE_APP.firebaseio.com',
      storageBucket: 'YOUR_FIREBASE_APP.appspot.com',
    },
    torii: {
      sessionServiceName: 'session'
    },
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      },
      EXTEND_PROTOTYPES: {
        Date: false,
      }
    },
    i18n: {
      defaultLocale: 'fr'
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    }
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.baseURL = '/';
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
  }

  if (environment === 'production') {

  }

  return ENV;
};
