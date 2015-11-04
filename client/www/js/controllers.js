angular.module('starter.controllers', ['ui.router'])

  .controller('WallCtrl', function ($state, $scope, $http, $localStorage, $ionicModal) {
    $scope.$on('$ionicView.enter', function (e) {
      var token = $localStorage.get("govie-auth-token");
      $http.defaults.headers.common['x-access-token'] = token;
      if (token) {
        $http.get('http://213.67.22.6:8976/govie/wall').then(
          function (res) {
            $scope.username = res.data.username;
            $scope.message = res.data.message;
          },
          function () {
            $ionicModal.fromTemplateUrl('templates/login.html').then(function (modal) {
              $scope.modal = modal;
              modal.show();
            });
          });
      } else {
        $ionicModal.fromTemplateUrl('templates/choose.html').then(function (modal) {
          $scope.modal = modal;
          modal.show();
        });
        $scope.$on('modal.hidden', function () {
          $state.go('tab.profile', {}, {reload: true});
        });
      }
    });
  })

  .controller('ChooseCtrl', function ($scope, $ionicModal) {
    $scope.openLogin = function () {
      $ionicModal.fromTemplateUrl('templates/login.html').then(function (modal) {
        $scope.modal.hide();
        $scope.modal = modal;
        modal.show();
      });
    };
    $scope.openCreateUser = function () {
      $ionicModal.fromTemplateUrl('templates/createUser.html').then(function (modal) {
        $scope.modal.hide();
        $scope.modal = modal;
        modal.show();
      });
    };
  })

  .controller('ChatsCtrl', function ($localStorage) {
    $localStorage.set("govie-auth-token", '');
  })

  .controller('TabCtrl', function ($ionicModal, $scope, $localStorage) {
    $scope.modal = null;
    $ionicModal.fromTemplateUrl('templates/splash.html', {}).then(function (modal) {
        modal.show();
        var token = $localStorage.get("govie-auth-token");
        if (token == null) {
          modal.hide();
          $ionicModal.fromTemplateUrl('templates/choose.html', {}).then(function (modal) {
            $scope.modal = modal;
            modal.show();
          });
        }
        else {
          modal.hide();
        }
      }
    );
  })

  .controller('ChatDetailCtrl', function ($scope, $stateParams, Chats) {
    $scope.chat = Chats.get($stateParams.chatId);
  })

  .controller('SplashCtrl', function ($scope, $stateParams) {
    console.log('got splash');
  })

  .controller('CreateUserCtrl', function ($state, $scope, $http, $localStorage, _, owasp) {
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
      console.log(request);
      $http.post('http://213.67.22.6:8976/addUser', request).then(function (res) {
          $localStorage.set("govie-auth-token", res.data.token);
          $http.defaults.headers.common['x-access-token'] = res.data.token;
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

  .controller('LoginCtrl', function ($state, $scope, $http, $localStorage) {
    $scope.wipeErrors = function () {
      $scope.errors = [];
    };
    $scope.login = function (username, password) {
      var request = {username: username, password: password};
      $http.post('http://213.67.22.6:8976/authenticate', request).then(function (res) {
          $localStorage.set("govie-auth-token", res.data.token);
          $http.defaults.headers.common['x-access-token'] = res.data.token;
          $scope.modal.hide();
          $state.go('tab.wall', {}, {reload: true});
        },
        function () {
          $scope.errors = ['Login failed!'];
        });
    };
  })
  .controller('AccountCtrl', function ($scope) {
    $scope.logout = function () {
      $localStorage.set("govie-auth-token", '');
    };
  })
  .controller('SearchCtrl', function ($scope, $http, $localStorage, $state) {
    $scope.openProfile = function (profile) {
      $state.go('tab.profile', {profile: JSON.stringify(profile)}, {reload: true});
    };
    $scope.term = '';
    $scope.search = function (value) {
      console.log(value);
      $http.get('http://213.67.22.6:8976/govie/search?term=' + value, {headers: {'x-access-token': $localStorage.get("govie-auth-token")}}).then(function (res) {
        $scope.hits = res.data.profiles;
      });
    };
  })
  .controller('ProfileCtrl', function ($scope, $http, $localStorage, $stateParams, _) {
    $scope.following = false;
    $scope.follows = function () {
      return $scope.following;
    };
    $scope.follow = function (username) {
      $http.post('http://213.67.22.6:8976/govie/follow', {username: username}, {headers: {'x-access-token': $localStorage.get("govie-auth-token")}}).then(function (res) {
          $scope.following = true;
          $scope.profile.followers.pop();
          $scope.profile.followers.push("bogus");
        },
        function (err) {
          console.log(JSON.stringify(err));//todo show proper error
        });
    };
    $scope.unfollow = function (username) {
      $http.post('http://213.67.22.6:8976/govie/unfollow', {username: username}, {headers: {'x-access-token': $localStorage.get("govie-auth-token")}}).then(function (res) {
          $scope.following = false;
          $scope.profile.followers.pop();
        },
        function (err) {
          console.log(JSON.stringify(err));//todo show proper error
        });
    };
    $scope.isOwnProfile = false;
    $scope.$on('$ionicView.enter', function (e) {
      if ($stateParams.profile.length > 15) {
        $scope.profile = JSON.parse($stateParams.profile);
        $scope.following = _.contains(
          _.map($scope.profile.followers, function (follower) {
            return follower.name
          }), $localStorage.get("govie-profile").username);
      } else {
        $http.get('http://213.67.22.6:8976/govie/profile', {headers: {'x-access-token': $localStorage.get("govie-auth-token")}}).then(function (res) {
          $localStorage.set("govie-profile", res.data.profile);
          $scope.ownProfile = res.data.profile;
          $scope.profile = res.data.profile;
          $scope.isOwnProfile = true;
        });
      }
    });
  });
