angular.module('starter.controllers', ['ui.router'])

  .controller('WallCtrl', function ($state, $scope, config, $http, $localStorage) {
    $scope.$on('$ionicView.enter', function (e) {
      $http.defaults.headers.common['x-access-token'] = $localStorage.get("govie-auth-token");
      $http.get(config.url + '/govie/wall').then(
        function (res) {
          $scope.wall = res.data.wall;
        });
    });
  })

  .controller('ChooseCtrl', function ($scope, $ionicModal, $state) {
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
  })

  //.controller('ChatsCtrl', function ($localStorage) {
  //$localStorage.set("govie-auth-token", '');
  //})


  .controller('TabCtrl', function ($ionicModal, $scope, $localStorage) {
    //$scope.modal = null;
    //$ionicModal.fromTemplateUrl('templates/splash.html', {}).then(function (modal) {
    //    modal.show();
    //    var token = $localStorage.get("govie-auth-token");
    //    if (token == null) {
    //      modal.hide();
    //      $ionicModal.fromTemplateUrl('templates/choose.html', {}).then(function (modal) {
    //        $scope.modal = modal;
    //        modal.show();
    //      });
    //    }
    //    else {
    //      modal.hide();
    //    }
    //  }
    //);
  })

  .controller('ChatDetailCtrl', function ($scope, $stateParams, Chats) {
    $scope.chat = Chats.get($stateParams.chatId);
  })

  .controller('SplashCtrl', function ($scope, $stateParams) {
    console.log('got splash');
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
  .controller('ProfileCtrl', function ($scope, $http, $localStorage, $stateParams, _, config, $ionicModal, $state) {

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
      if (!token) {
        $ionicModal.fromTemplateUrl('templates/choose.html').then(function (modal) {
          $scope.modal = modal;
          modal.show();
        });
      } else {
        if ($stateParams.profile.length > 15) {
          $scope.profile = JSON.parse($stateParams.profile);
          $scope.following = _.contains(
            _.map($scope.profile.followers, function (follower) {
              return follower;
            }), $localStorage.get("current-user"));
          $http.get(config.url + '/govie/ratings?username=' + $scope.profile.username, {headers: {'x-access-token': $localStorage.get("govie-auth-token")}}).then(function (res) {
            $scope.ratings = res.data.ratings;
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
            $http.get(config.url + '/govie/ratings?token=' + $scope.profile.username, {headers: {'x-access-token': $localStorage.get("govie-auth-token")}}).then(function (res) {
              $scope.ratings = res.data.ratings;
              $scope.websocket = new WebSocket(config.wsurl + '/follow?token=' + $localStorage.get("govie-auth-token"));
              console.log('opened websocket');
              $scope.websocket.onmessage = function (evt) {
                console.log('got follower!');
                $scope.$apply(function(){
                  $scope.profile.followers.push("new follower");
                });
              };
            });
          }, function (err) {
            $ionicModal.fromTemplateUrl('templates/login.html').then(function (modal) {
              $scope.modal = modal;
              modal.show();
            });
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

  .controller('RateCtrl', function ($scope, config, _, $http, $localStorage, $state) {
    $scope.movie = {};
    $scope.person = {};
    $scope.request = {}

    $scope.chooseMovie = function (movie) {
      $scope.moviesHits = [];
      $scope.movie = movie;
    };
    $scope.searchMovie = function () {
      $http.get(config.url + '/govie/findMovie?searchterm=' + $scope.movie.title, {headers: {'x-access-token': $localStorage.get("govie-auth-token")}}).then(function (res) {
        $scope.moviesHits = res.data.hits;
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
      rateReq.posterUrl = $scope.movie.posterUrl;
      rateReq.friends = [$scope.person.term];
      rateReq.rate = $scope.request.rate;
      $http.post(config.url + '/govie/rate', rateReq, {headers: {'x-access-token': $localStorage.get("govie-auth-token")}}).then(function (res) {
        $state.go('tab.profile', {}, {reload: true});
      });
    };
  });
