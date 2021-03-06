// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'ionic.rating',
    'angular-momentjs', 'ngCordova', 'ngCordovaOauth'])

  .run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);

      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleLightContent();
      }

    });
  })

  .config(function ($stateProvider, $urlRouterProvider) {

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider

    // setup an abstract state for the tabs directive
      .state('tab', {
        url: '/tab',
        abstract: true,
        templateUrl: 'templates/tabs.html',
        controller: 'TabCtrl'
      })

      // Each tab has its own nav history stack:

      .state('tab.account', {
        url: '/account',
        views: {
          'tab-profile': {
            templateUrl: 'templates/tab-account.html',
            controller: 'AccountCtrl'
          }
        }
      })
      .state('tab.followers', {
        url: '/followers/:username',
        views: {
          'tab-profile': {
            templateUrl: 'templates/tab-followers.html',
            controller: 'FollowersCtrl'
          }
        }
      })
      .state('tab.likers', {
        url: '/likers/:rateId',
        views: {
          'tab-profile': {
            templateUrl: 'templates/tab-likers.html',
            controller: 'LikersCtrl'
          }
        }
      })
      .state('tab.follows', {
        url: '/follows/:username',
        views: {
          'tab-profile': {
            templateUrl: 'templates/tab-follows.html',
            controller: 'FollowsCtrl'
          }
        }
      })

      .state('splash', {
        url: '/splash',
        views: {
          'splash': {
            templateUrl: 'templates/splash.html',
            controller: 'SplashCtrl'
          }
        }
      })

      .state('tab.wall', {
        url: '/wall',
        views: {
          'tab-wall': {
            templateUrl: 'templates/tab-wall.html',
            controller: 'WallCtrl'
          }
        }
      })

      .state('tab.search', {
        url: '/search',
        views: {
          'tab-search': {
            templateUrl: 'templates/tab-search.html',
            controller: 'SearchCtrl'
          }
        }
      })

      .state('tab.rate', {
        url: '/rate/',
        views: {
          'tab-rate': {
            templateUrl: 'templates/tab-rate.html',
            controller: 'RateCtrl'
          }
        }
      })

      .state('tab.profile', {
        url: '/profile/:profile',
        views: {
          'tab-profile': {
            templateUrl: 'templates/tab-profile.html',
            controller: 'ProfileCtrl'
          }
        }
      })
      .state('tab.tickets', {
        url: '/tickets',
        views: {
          'tab-tickets': {
            templateUrl: 'templates/tab-tickets.html',
            controller: 'TicketsCtrl'
          }
        }
      });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/tab/profile/none');

  });
