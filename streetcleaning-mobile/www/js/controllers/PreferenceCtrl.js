angular.module('streetcleaning.controllers.preference', [])
    .controller('PreferenceCtrl', function($scope, $state, $ionicPopup, $timeout, $filter, HomeSrv) {

        var successMarkers = function(response) {
            if (response) {
                favoriteMarkers = response.data;
                $scope.markers = favoriteMarkers;
            } else {
                $scope.markers = [];
            }
        }

        var failureMarkers = function(error) {

        }

        HomeSrv.getFavoriteMarkers().then(successMarkers, failureMarkers);

        $scope.showMarkerDetails = function(arg1, arg2) {
            $state.go('app.markerDetails', {
                marker: JSON.stringify(arg1),
                runningDate: arg2
            });
        }

        $scope.removeFavorite = function(marker) {
            if (marker.favorite) {
                marker.favorite = false;
            } else {
                marker.favorite = true;
            } 
        }


    })