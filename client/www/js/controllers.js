angular.module('starter.controllers', [])

    .controller('WallCtrl', function ($scope, $http, $localStorage, $ionicModal) {
        $scope.$on('$ionicView.enter', function (e) {
            var token = $localStorage.get("govie-auth-token");
            $http.defaults.headers.common['x-access-token'] = token;
            if (token) {
                $http.get('http://localhost:8080/govie/wall').then(
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

    .controller('CreateUserCtrl', function ($state, $scope, $http, $state, $localStorage) {


        $scope.createUser = function (alias, username, password) {
            var request = {
                alias: alias,
                username: username,
                password: password
            };
            console.log(request);
            $http.post('http://localhost:8080/addUser', request).then(function (res) {
                    $localStorage.set("govie-auth-token", res.data.token);
                    $http.defaults.headers.common['x-access-token'] = res.data.token;
                    $scope.modal.hide();
                    $state.go('tab.wall', {}, {reload: true});
                },
                function (err) {
                    console.log(JSON.stringify(err))
                });
        }
    })

    .controller('LoginCtrl', function ($state, $scope, $http, $localStorage) {
        $scope.login = function (username, password) {
            var request = {username: username, password: password};
            $http.post('http://localhost:8080/authenticate', request).then(function (res) {
                    $localStorage.set("govie-auth-token", res.data.token);
                    $http.defaults.headers.common['x-access-token'] = res.data.token;
                    $scope.modal.hide();
                    $state.go('tab.wall', {}, {reload: true});
                },
                function (err) {
                    console.log(JSON.stringify(err))
                });
        };
    })
    .controller('AccountCtrl', function ($scope) {
        $scope.settings = {
            enableFriends: true
        };
    });
