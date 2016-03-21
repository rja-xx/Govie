angular.module('starter.services', ['ngResource'])

  .factory('_', ['$window', function ($window) {
    return $window._;
  }])

  .factory('config', function ($window) {
    return govieconfig;
  })

  .factory('owasp', ['$window', function ($window) {
    var owasp = $window.owaspPasswordStrengthTest;
    owasp.config({
      allowPassphrases: true,
      maxLength: 128,
      minLength: 6,
      minPhraseLength: 10,
      minOptionalTestsToPass: 2
    });
    return owasp;
  }])

  .factory('$localStorage', ['$window', function ($window) {
    return {
      set: function (key, value) {
        $window.localStorage[key] = value;
      },
      get: function (key, defaultValue) {
        return $window.localStorage[key] || defaultValue;
      },
      setObject: function (key, value) {
        $window.localStorage[key] = JSON.stringify(value);
      },
      getObject: function (key) {
        return JSON.parse($window.localStorage[key] || '{}');
      }
    }
  }]);
