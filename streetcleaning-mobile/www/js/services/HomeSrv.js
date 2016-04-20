angular.module('streetcleaning.services.home', [])

    .factory('HomeSrv', function($q, $http, $window, $filter, $rootScope, $translate, $ionicLoading, MapSrv, StorageSrv, Config) {

        var homeServices = {};

        homeServices.getMarkers = function(date) {
            var deferred = $q.defer();
            var formattedDate = homeServices.formatDate(date);

            // var existingMarkers = StorageSrv.getMarkers(formattedDate);

            // if (existingMarkers && existingMarkers.length > 0) {
            //     deferred.resolve(existingMarkers);
            // }
            // else {
            var url = Config.getSCWebURL() + '/rest/day?daymillis=' + date.getTime();

            $http.get(url, {
                headers: {
                    "Accept": "application/json"
                }
            }).then(function(response) {
                var dateMarkers = response.data;
                var markers = [];
                var isFavorite = false;
                for (var i = 0; i < dateMarkers.length; i++) {

                    isFavorite = StorageSrv.isFavorite(dateMarkers[i].streetName)

                    markers.push({
                        id: dateMarkers[i].id,
                        streetName: dateMarkers[i].streetName,
                        streetCode: dateMarkers[i].streetCode,
                        cleaningDay: dateMarkers[i].cleaningDay,
                        startingTime: dateMarkers[i].startingTime,
                        endingTime: dateMarkers[i].endingTime,
                        notes: dateMarkers[i].notes,
                        lat: dateMarkers[i].centralCoords[0].lat,
                        lng: dateMarkers[i].centralCoords[0].lng,
                        centralCoords: dateMarkers[i].centralCoords[0],
                        streetSchedule: $filter('translate')('lbl_start') + ' ' + homeServices.formatTimeHHMM(dateMarkers[i].startingTime) + ' ' + $filter('translate')('lbl_end') + ' ' + homeServices.formatTimeHHMM(dateMarkers[i].endingTime),
                        polyline: MapSrv.formatPolyLine(dateMarkers[i].polylines),
                        favorite: isFavorite
                    });

                }
                deferred.resolve(markers);
                // StorageSrv.saveMarkers(markers, formattedDate).then(function(saved) {
                //     deferred.resolve(saved);
                // }, function(unsaved) {
                //     deferred.resolve(null);
                // }
                // )
            }, function(error) {
                deferred.resolve(null);
            });
            // }

            return deferred.promise;
        }

        homeServices.getFavoriteMarkers = function() {
            var deferred = $q.defer();

            StorageSrv.getFavoriteMarkers().then(function(response) {
                deferred.resolve(response);
            }, function(error) {
                deferred.resolve(null);
            });

            return deferred.promise;

        }

        homeServices.isFavoriteStreet = function(streetName) {
            return StorageSrv.isFavorite(streetName);
        }
        

        homeServices.formatDate = function(today) {
            var dd = today.getDate();
            var mm = today.getMonth() + 1; //January is 0!
            var yyyy = today.getFullYear();

            if (dd < 10) {
                dd = '0' + dd
            }
            if (mm < 10) {
                mm = '0' + mm
            }
            var today = dd + '-' + mm + '-' + yyyy;

            return today;

        }

        homeServices.formatTimeHHMM = function(time) {
            var date = new Date(time);
            var hour = date.getHours();

            if (hour < 10) {
                hour = "0" + hour;
            }

            var mins = date.getMinutes();

            if (mins < 10) {
                mins = "0" + mins;
            }

            var formatted = hour + '.' + mins;

            return formatted;
        }

        homeServices.getMonthName = function(time) {
            var date = new Date(time);
            var month = Config.getMonthName(date.getMonth());

            return month;
        }

        homeServices.getMonthNumber = function(time) {
            var date = new Date(time);

            return date.getMonth();

        }

        homeServices.generateKey = function(today) {
            var dd = today.getDate();
            var mm = today.getMonth() + 1; //January is 0!
            var yyyy = today.getFullYear();

            if (mm < 10) {
                mm = '0' + mm
            }
            var key = mm + '-' + yyyy;

            return key;

        }

        homeServices.getTimeTable = function(streetName) {

            var deferred = $q.defer();

            /** two dimensional 1.
            var arrItems = [];
            arrItems[0] = [];
            arrItems[1] = [];
            arrItems[2] = [];
            arrItems[3] = [];
            arrItems[4] = [];
            arrItems[5] = [];
            arrItems[6] = [];
            arrItems[7] = [];
            arrItems[8] = [];
            arrItems[9] = [];
            arrItems[10] = [];
            arrItems[11] = [];


            

            // $http.get('data/tt.json')
            var url = Config.getSCWebURL() + '/rest/street?streetName=' + marker.streetName;

            $http.get(url, {
                headers: {
                    "Accept": "application/json"
                }
            }).then(function(response) {
                // order items by month and format it.
                i = 0;
                homeServices.orderByStartTime("Time", response.data).forEach(function(item) {
                    var month = homeServices.getMonthName(item.cleaningDay);
                    item.month = month;
                    item.order = homeServices.getMonthNumber(item.cleaningDay);
                    var formattedDate = homeServices.formatDate(new Date(item.cleaningDay));
                    item.formattedDate = formattedDate;
                    if (!arrItems[item.order]) {
                        arrItems[item.order] = [];
                    }
                    arrItems[item.order].push(item)
                })

                deferred.resolve(arrItems);
            }, function(error) {
                deferred.resolve(null);
            });**/

            // associative map.
            var associativeMap = {};

            var url = Config.getSCWebURL() + '/rest/street?streetName=' + streetName;

            $http.get(url, {
                headers: {
                    "Accept": "application/json"
                }
            }).then(function(response) {

                var arr = [];

                response.data.forEach(function(item) {
                    var formattedDate = homeServices.formatDate(new Date(item.cleaningDay));
                    item.formattedDate = formattedDate;
                    var dateOfMonth = new Date(item.cleaningDay);
                    dateOfMonth.setDate(1);
                    var key = $filter('date')(dateOfMonth, 'yyyy-MM-dd');
                    if (associativeMap[key] == null) {
                        associativeMap[key] = [];
                    }
                    associativeMap[key].push(item);
                })

                deferred.resolve(associativeMap);
            }
                );

            return deferred.promise;

        }

        homeServices.orderMapKeys = function(h) {
            var keys = [];
            for (var k in h) {
                keys.push(k);
            }
            return keys.sort();
        }

        var sorters = {
            byTime: function(a, b) {
                return ((a.startingTime < b.startingTime) ? 1 : ((a.startingTime > b.startingTime) ? -1 : 0));
            }
        }


        homeServices.orderByStartTime = function(type, list) {

            var tt = {};

            if (type == "Time") {
                tt = list.sort(sorters.byTime);
            }

            return tt;
        }

        homeServices.addFavorite = function(streetName) {
            var deferred = $q.defer();

            StorageSrv.addFavorite(streetName).then(function(streetName) {
                deferred.resolve(streetName);
             }, function(error) {
                 deferred.resolve(null);

             })

            return deferred.promise;

        }


        return homeServices;
    });