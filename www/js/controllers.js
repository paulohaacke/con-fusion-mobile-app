angular.module('ConFusion.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $localStorage, $ionicPlatform, $cordovaCamera, $cordovaImagePicker, AuthFactory) {
    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    // Form data for the login modal
    $scope.loginData = $localStorage.getObject('userinfo', '{}');

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/login.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modal = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeLogin = function() {
        $scope.modal.hide();
    };

    // Open the login modal
    $scope.login = function() {
        $scope.modal.show();
    };

    // Perform the login action when the user submits the login form
    $scope.doLogin = function() {
        if ($scope.rememberMe)
            $localStorage.storeObject('userinfo', $scope.loginData);

        AuthFactory.login($scope.loginData);

        $scope.closeLogin();
    };

    $scope.reservation = {};

    // Create the reserve modal that we will use later
    $ionicModal.fromTemplateUrl('templates/reserve.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.reserveform = modal;
    });

    // Triggered in the reserve modal to close it
    $scope.closeReserve = function() {
        $scope.reserveform.hide();
    };

    // Open the reserve modal
    $scope.reserve = function() {
        $scope.reserveform.show();
    };

    // Perform the reserve action when the user submits the reserve form
    $scope.doReserve = function() {
        console.log('Doing reservation', $scope.reservation);

        // Simulate a reservation delay. Remove this and replace with your reservation
        // code if using a server system
        $timeout(function() {
            $scope.closeReserve();
        }, 1000);
    };

    $scope.registration = {}

    // Create the registration modal that we will use later
    $ionicModal.fromTemplateUrl('templates/register.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.registerform = modal;
    });

    // Triggered in the registration modal to close it
    $scope.closeRegister = function() {
        $scope.registerform.hide();
    };

    // Open the registration modal
    $scope.register = function() {
        $scope.registerform.show();
    };

    // Perform the registration action when the user submits the registration form
    $scope.doRegister = function() {
        // Simulate a registration delay. Remove this and replace with your registration
        // code if using a registration system
        $timeout(function() {
            $scope.closeRegister();
        }, 1000);
    };

    $ionicPlatform.ready(function() {
        var options = {
            quality: 50,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: Camera.PictureSourceType.CAMERA,
            allowEdit: true,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 100,
            targetHeight: 100,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false
        };
        $scope.takePicture = function() {
            $cordovaCamera.getPicture(options).then(function(imageData) {
                $scope.registration.imgSrc = "data:image/jpeg;base64," + imageData;
            }, function(err) {
                console.log(err);
            });
        };

        $scope.pickImage = function() {
            $cordovaImagePicker.getPictures({
                    maximumImagesCount: 1,
                    width: 100,
                    height: 100,
                    quality: 50
                })
                .then(function(imgs) {
                    $scope.registration.imgSrc = imgs[0];
                }, function(error) {
                    console.log(error);
                });
        };
    });
})

.controller('MenuController', ['$scope', 'dishes', 'favoriteFactory', 'baseURL', '$ionicListDelegate', '$ionicPlatform', '$cordovaLocalNotification', '$cordovaToast', function($scope, dishes, favoriteFactory, baseURL, $ionicListDelegate, $ionicPlatform, $cordovaLocalNotification, $cordovaToast) {
    $scope.baseURL = baseURL;
    $scope.tab = 1;
    $scope.filtText = '';
    $scope.showDetails = false;

    $scope.dishes = dishes;

    $scope.select = function(setTab) {
        $scope.tab = setTab;

        if (setTab === 2) {
            $scope.filtText = "appetizer";
        } else if (setTab === 3) {
            $scope.filtText = "mains";
        } else if (setTab === 4) {
            $scope.filtText = "dessert";
        } else {
            $scope.filtText = "";
        }
    };

    $scope.isSelected = function(checkTab) {
        return ($scope.tab === checkTab);
    };

    $scope.toggleDetails = function() {
        $scope.showDetails = !$scope.showDetails;
    };

    $scope.addFavorite = function(index) {
        console.log("index is " + index);
        favoriteFactory.save({ _id: index });
        $ionicListDelegate.closeOptionButtons();

        $ionicPlatform.ready(function() {
            $cordovaLocalNotification.schedule({
                    id: 1,
                    title: "Added Favorite",
                    text: $scope.dishes[index].name
                })
                .then(function() {
                    console.log('Added Favorite ' + $scope.dishes[index].name);
                }, function() {
                    console.log('Failed to add Notification ');
                })

            $cordovaToast.show('Added Favorite ' + $scope.dishes[index].name, 'long', 'center')
                .then(function(success) {
                    // success
                }, function(error) {
                    // error
                });
        })
    }
}])

.controller('ContactController', ['$scope', function($scope) {
    $scope.feedback = {
        mychannel: "",
        firstName: "",
        lastName: "",
        agree: false,
        email: ""
    };

    var channels = [{
        value: "tel",
        label: "Tel."
    }, {
        value: "Email",
        label: "Email"
    }];

    $scope.channels = channels;
    $scope.invalidChannelSelection = false;
}])

.controller('FeedbackController', ['$scope', 'feedbackFactory', function($scope, feedbackFactory) {
    $scope.sendFeedback = function() {

        console.log($scope.feedback);

        if ($scope.feedback.agree && ($scope.feedback.mychannel == "")) {
            $scope.invalidChannelSelection = true;
            console.log('incorrect');
        } else {
            $scope.invalidChannelSelection = false;
            feedbackFactory.save($scope.feedback);
            $scope.feedback = {
                mychannel: "",
                firstName: "",
                lastName: "",
                agree: false,
                email: ""
            };
            $scope.feedback.mychannel = "";
            $scope.feedbackForm.$setPristine();
            console.log($scope.feedback);
        }
    };
}])

.controller('DishDetailController', ['$scope', '$stateParams', 'dish', 'menuFactory', 'baseURL', '$ionicPopover', 'favoriteFactory', '$ionicModal', '$ionicPlatform', '$cordovaLocalNotification', '$cordovaToast', function($scope, $stateParams, dish, menuFactory, baseURL, $ionicPopover, favoriteFactory, $ionicModal, $ionicPlatform, $cordovaLocalNotification, $cordovaToast) {
    $scope.baseURL = baseURL;
    $scope.dish = {};
    $scope.showDish = false;
    $scope.message = "Loading ...";

    $scope.dish = dish;

    $ionicPopover.fromTemplateUrl('templates/dish-detail-popover.html', {
        scope: $scope
    }).then(function(morePopover) {
        $scope.morePopover = morePopover;
    })

    $scope.openMorePopover = function($event) {
        $scope.morePopover.show($event);
    };

    $scope.closeMorePopover = function() {
        $scope.morePopover.hide();
    };

    $scope.addToFavorites = function() {
        favoriteFactory.addToFavorites(parseInt($stateParams.id, 10));
        $scope.closeMorePopover();

        $ionicPlatform.ready(function() {
            $cordovaLocalNotification.schedule({
                    id: 1,
                    title: "Added Favorite",
                    text: $scope.dish.name
                })
                .then(function() {
                    console.log('Added Favorite ' + $scope.dish.name);
                }, function() {
                    console.log('Failed to add Notification ');
                })

            $cordovaToast.show('Added Favorite ' + $scope.dish.name, 'long', 'bottom')
                .then(function(success) {
                    // success
                }, function(error) {
                    // error
                });
        })
    }

    $ionicModal.fromTemplateUrl('templates/dish-comment.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.commentform = modal;
    });

    $scope.closeComment = function() {
        $scope.commentform.hide();
        $scope.closeMorePopover();
    };

    $scope.comment = function() {
        $scope.commentform.show();
    };

    $scope.mycomment = {
        rating: 5,
        comment: "",
        author: "",
        date: ""
    };

    $scope.submitComment = function() {
        $scope.mycomment.date = new Date().toISOString();
        console.log($scope.mycomment);

        $scope.dish.comments.push($scope.mycomment);
        menuFactory.update({
            id: $scope.dish.id
        }, $scope.dish);

        $scope.mycomment = {
            rating: 5,
            comment: "",
            author: "",
            date: ""
        };

        $scope.closeComment();
    }
}])

.controller('IndexController', ['$scope', 'dish', 'promotion', 'leader', 'baseURL', function($scope, dish, promotion, leader, baseURL) {
    $scope.baseURL = baseURL;
    $scope.leader = leader;
    $scope.dish = dish;
    $scope.promotion = promotion;
}])

.controller('AboutController', ['$scope', 'leaders', 'baseURL', function($scope, leaders, baseURL) {
    $scope.baseURL = baseURL;
    $scope.leaders = leaders;
}])

.controller('FavoriteController', ['dishes', '$scope', '$state', 'favoriteFactory', function(dishes, $scope, $state, favoriteFactory) {

    $scope.tab = 1;
    $scope.showDelete = false;
    $scope.message = "Loading ...";

    favoriteFactory.queryDishes(
        function(response) {
            $scope.dishes = response;
        },
        function(response) {
            $scope.message = "Error: " + response.status + " " + response.statusText;
        });

    $scope.toggleDelete = function() {
        $scope.showDelete = !$scope.showDelete;
    };

    $scope.deleteFavorite = function(dishid) {
        var confirmPopup = $ionicPopup.confirm({
            title: 'Confirm Delete',
            template: 'Are you sure you want to delete this item?'
        });
        confirmPopup.then(function(res) {
            if (res) {
                console.log('Ok to delete');
                favoriteFactory.delete({ id: dishid });
                $state.go($state.current, {}, { reload: true });
                $ionicPlatform.ready(function() {
                    $cordovaVibration.vibrate(100);
                });
            } else {
                console.log('Canceled delete');
            }
        });

        $scope.showDelete = false;
    };
}])

;