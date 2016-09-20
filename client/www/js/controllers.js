angular.module('starter.controllers', ['ui.router'])

  .controller('WallCtrl', function ($state, $scope, config, $http, $localStorage, $moment) {
    $scope.$on('$ionicView.enter', function (e) {
      $http.defaults.headers.common['x-access-token'] = $localStorage.get("govie-auth-token");
      $http.get(config.url + '/govie/wall').then(
        function (res) {
          $scope.wall = res.data.wall;
          _.each($scope.wall, function (e) {
            e.relativeTime = $moment(e.time).fromNow();
          });
        });
    });
  })

  .controller('ChooseCtrl', function ($scope, $ionicLoading, config, $localStorage, $cordovaOauth, $state, $ionicModal) {
    $scope.openLogin = function () {
      $scope.modal.hide();
      $ionicModal.fromTemplateUrl('templates/login.html').then(function (modal) {
        $scope.modal = modal;
        modal.show();
      });
    };
    $scope.openCreateUser = function () {
      $scope.modal.hide();
      $ionicModal.fromTemplateUrl('templates/createUser.html').then(function (modal) {
        $scope.modal = modal;
        modal.show();
      });
    };

    $scope.twitterLogin = function () {
      console.log('logging in with twitter');
      var secret = 'POIFLLnvyTLZeXV5q3gawFpIMw1X1Wl3xfbz9oMMR0is4UAMJm';
      var key = 'c70nU7fcLJk4Nu7KJFJZPSuIQ';
      $cordovaOauth.twitter(key, secret).then(function (result) {
        $localStorage.setObject('twitterLogin', result);
        $scope.modal.hide();
        $state.go('tab.profile', {profile: ''}, {reload: true});
      }, function (error) {
        console.log(JSON.stringify(error));
      });
    };
  })

  //.controller('ChatsCtrl', function ($localStorage) {
  //$localStorage.set("govie-auth-token", '');
  //})


  .controller('TabCtrl', function ($ionicModal, $scope, $localStorage) {
  })

  .controller('ChatDetailCtrl', function ($scope, $stateParams, Chats) {
    $scope.chat = Chats.get($stateParams.chatId);
  })

  .controller('SplashCtrl', function ($scope, $stateParams) {
  })

  .controller('CreateUserCtrl', function ($state, $scope, $http, $localStorage, _, owasp, config) {
    $scope.hasErrors = function () {
      var errors = $scope.errors;
      if (errors) {
        return errors.length > 0;
      } else {
        return false
      }
    };

    $scope.notEmpty = function (text) {
      if (text) {
        if (text.length > 0) {
          return 'ok'
        }
      }
      return 'nok';
    };

    $scope.passwordApproved = function (password) {
      if (password) {
        if (owasp.test(password).strong) {
          return 'ok'
        }
      }
      return 'nok';
    };

    $scope.createUser = function (alias, username, password) {
      var request = {
        alias: alias,
        username: username,
        password: password
      };
      $http.post(config.url + '/addUser', request).then(function (res) {
          $localStorage.set("govie-auth-token", res.data.token);
          $scope.modal.hide();
          $state.go('tab.profile', {profile: ''}, {reload: true});
        },
        function (err) {
          if (err.status === 400) {
            $scope.errors = err.data.errors;
          } else {
            console.log(JSON.stringify(err));//todo show proper error
          }
        });
    }
  })

  .controller('LoginCtrl', function ($state, $scope, $http, $localStorage, config) {
    $scope.wipeErrors = function () {
      $scope.errors = [];
    };
    $scope.login = function (username, password) {
      var request = {username: username, password: password};
      $http.post(config.url + '/authenticate', request).then(function (res) {
          $localStorage.set("govie-auth-token", res.data.token);
          $scope.modal.hide();
          $state.go('tab.profile', {profile: ''}, {reload: true});
        },
        function () {
          $scope.errors = ['Login failed!'];
        });
    };
  })

  .controller('AccountCtrl', function ($scope, $localStorage, $state) {
    $scope.logout = function () {
      $localStorage.set("twitterLogin", '');
      $localStorage.set("govie-auth-token", '');
      $state.go('tab.profile', {profile: ''}, {reload: true});
    };
  })
  .controller('TicketsCtrl', function ($state, $scope, config, $http, $localStorage) {
    $scope.$on('$ionicView.enter', function (e) {
      $http.defaults.headers.common['x-access-token'] = $localStorage.get("govie-auth-token");
      $http.get(config.url + '/govie/tickets').then(
        function (res) {
          $scope.tickets = res.data.tickets;
        });
    });
  })
  .controller('FollowersCtrl', function ($state, $scope, config, $http, $localStorage) {
    $scope.openProfile = function(username){
      $state.go('tab.profile', {username: username}, {reload: true})
    };
    $scope.$on('$ionicView.enter', function (e) {
      $http.defaults.headers.common['x-access-token'] = $localStorage.get("govie-auth-token");
      $http.get(config.url + '/govie/followers').then(
        function (res) {
          $scope.followers = res.data.followers;
        });
    });
  })
  .controller('FollowsCtrl', function ($state, $scope, config, $http, $localStorage) {
    $scope.openProfile = function(username){
      $state.go('tab.profile', {username: username}, {reload: true})
    };
    $scope.$on('$ionicView.enter', function (e) {
      $http.defaults.headers.common['x-access-token'] = $localStorage.get("govie-auth-token");
      $http.get(config.url + '/govie/follows').then(
        function (res) {
          $scope.follows = res.data.followsf;
        });
    });
  })
  .controller('SearchCtrl', function ($scope, $http, $localStorage, $state, config) {
    $scope.openProfile = function (profile) {
      $state.go('tab.profile', {profile: JSON.stringify(profile)}, {reload: true});
    };
    $scope.term = '';
    $scope.search = function (value) {
      $http.get(config.url + '/govie/search?term=' + value, {headers: {'x-access-token': $localStorage.get("govie-auth-token")}}).then(function (res) {
        $scope.hits = res.data.profiles;
      });
    };
  })
  .controller('ProfileCtrl', function ($scope, $http, $localStorage, $stateParams, _, config, $ionicModal, $moment) {
    $scope.openFollowers = function(username){

    };
    $scope.openFollows = function(username){

    };
    $scope.following = false;
    $scope.follows = function () {
      return $scope.following;
    };
    $scope.follow = function (username) {
      $http.post(config.url + '/govie/follow', {username: username}, {headers: {'x-access-token': $localStorage.get("govie-auth-token")}}).then(function (res) {
          $scope.following = true;
          $scope.profile.followers.push($scope.profile.name);
        },
        function (err) {
          console.log(JSON.stringify(err));//todo show proper error
        });
    };
    $scope.unfollow = function (username) {
      $http.post(config.url + '/govie/unfollow', {username: username}, {headers: {'x-access-token': $localStorage.get("govie-auth-token")}}).then(function (res) {
          $scope.following = false;
          $scope.profile.followers.pop();
        },
        function (err) {
          console.log(JSON.stringify(err));//todo show proper error
        });
    };
    $scope.isOwnProfile = false;
    $scope.websocket = null;

    $scope.$on('$ionicView.enter', function (e) {
      var token = $localStorage.get("govie-auth-token");
      if (token) {

        if ($stateParams.profile.length > 15) {
          $scope.profile = JSON.parse($stateParams.profile);
          $scope.following = _.contains(
            _.map($scope.profile.followers, function (follower) {
              return follower;
            }), $localStorage.get("current-user"));
          $http.get(config.url + '/govie/ratings?username=' + $scope.profile.username, {headers: {'x-access-token': $localStorage.get("govie-auth-token")}}).then(function (res) {
            $scope.ratings = res.data.ratings;
            _.each($scope.ratings, function (e) {
              e.relativeTime = $moment(e.time).fromNow();
            });
          }, function (err) {
            $ionicModal.fromTemplateUrl('templates/login.html').then(function (modal) {
              $scope.modal = modal;
              modal.show();
            });
          });
        } else {
          $http.get(config.url + '/govie/profile', {headers: {'x-access-token': $localStorage.get("govie-auth-token")}}).then(function (res) {
            $localStorage.set("current-user", res.data.profile.username);
            $scope.ownProfile = res.data.profile;
            $scope.profile = res.data.profile;
            $scope.isOwnProfile = true;
            $http.get(config.url + '/govie/ratings?username=' + $scope.profile.username, {headers: {'x-access-token': $localStorage.get("govie-auth-token")}}).then(function (res) {
              $scope.ratings = res.data.ratings;
              _.each($scope.ratings, function (e) {
                e.relativeTime = $moment(e.time).fromNow();
              });
              $scope.websocket = new WebSocket(config.wsurl + '/follow?token=' + $localStorage.get("govie-auth-token"));
              console.log('opened websocket');
              $scope.websocket.onmessage = function (evt) {
                console.log(evt);
                if(evt.data == 'follow') {
                  $scope.$apply(function () {
                    $scope.profile.followers.push("new follower");
                  });
                }else{
                  $scope.$apply(function () {
                    $scope.profile.followers.pop();
                  });
                }
              };
            });
          }, function (err) {
            $ionicModal.fromTemplateUrl('templates/login.html').then(function (modal) {
              $scope.modal = modal;
              modal.show();
            });
          });
        }
      } else {
        var twitterLogin = $localStorage.get("twitterLogin");
        if (twitterLogin) {
          $http.post(config.url + '/twitterAuth', twitterLogin).then(function (res) {
            $localStorage.set("govie-auth-token", res.data.token);
            $state.go('tab.profile', {profile: ''}, {reload: true});
          });
        } else {
          $ionicModal.fromTemplateUrl('templates/choose.html').then(function (modal) {
            $scope.modal = modal;
            modal.show();
          });
        }
      }
    });


    $scope.$on('$ionicView.leave', function (e) {
      if ($scope.websocket) {
        $scope.websocket.close();
        console.log('closing websocket');
      }
    });
  })

  .controller('RateCtrl', function ($scope, config, _, $http, $localStorage, $state, $cordovaGeolocation) {
    $scope.movie = {};
    $scope.person = {};
    $scope.theater = {};
    $scope.request = {};

    $scope.chooseMovie = function (movie) {
      $scope.moviesHits = [];
      $scope.movie = movie;
    };
    $scope.searchMovie = function () {
      $http.get(config.url + '/govie/findMovie?searchterm=' + $scope.movie.title, {headers: {'x-access-token': $localStorage.get("govie-auth-token")}}).then(function (res) {
        $scope.moviesHits = res.data.hits;
      });
    };

    $scope.suggestTheater = function () {
      var posOptions = {timeout: 5000, enableHighAccuracy: false};
      $cordovaGeolocation
        .getCurrentPosition(posOptions)
        .then(function (position) {
          var lat = position.coords.latitude;
          var long = position.coords.longitude;
          $http.get(config.url + '/govie/suggestTheater?lat=' + lat + '&long=' + long, {headers: {'x-access-token': $localStorage.get("govie-auth-token")}}).then(function (res) {
            $scope.theaterHits = res.data;
          });
        }, function (err) {
          console.log(err);
        });
    };

    $scope.chooseTheater = function (theater) {
      $scope.theaterHits = [];
      $scope.theater = theater;
    };

    $scope.searchTheater = function () {
      $http.get(config.url + '/govie/findTheater?searchterm=' + $scope.theater.name, {headers: {'x-access-token': $localStorage.get("govie-auth-token")}}).then(function (res) {
        $scope.theaterHits = res.data.hits;
      });
    };

    $scope.chooseFriend = function (username) {
      $scope.person.term = username;
      $scope.friendHits = [];
    };
    $scope.searchFriend = function () {
      $http.get(config.url + '/govie/search?term=' + $scope.person.term, {headers: {'x-access-token': $localStorage.get("govie-auth-token")}}).then(function (res) {
        $scope.friendHits = res.data.profiles;
      });
    };
    $scope.submitRating = function () {
      var rateReq = {};
      rateReq.note = $scope.request.note;
      rateReq.movie = $scope.movie.title;
      rateReq.theater = $scope.theater.name;
      rateReq.posterUrl = $scope.movie.posterUrl;
      rateReq.friends = [$scope.person.term];
      rateReq.rate = $scope.request.rate;
      $http.post(config.url + '/govie/rate', rateReq, {headers: {'x-access-token': $localStorage.get("govie-auth-token")}}).then(function (res) {
        $state.go('tab.profile', {}, {reload: true});
      });
    };
  });
