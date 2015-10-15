angular.module('starter.controllers', [])

  .controller('WallCtrl', function ($scope, $http, $localStorage, $ionicModal) {
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
          $state.go('tab.wall', {}, {reload: true});
        },
        function (err) {
          if (err.status === 400) {
            $scope.errors = err.data.errors;
          } else {
            console.log(JSON.stringify(err));
          }
        });
    }
  })

  .controller('LoginCtrl', function ($state, $scope, $http, $localStorage) {
    $scope.wipeErrors = function(){
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
    $scope.settings = {
      enableFriends: true
    };
  });
