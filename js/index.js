var app = angular.module("app", []);

app.factory('Councilors', ['$http', '$q', function($http, $q) {
    return {
        fetch: function(committeeType) {
            var defer = $q.defer();
            var source = "http://opendata-online.test.demo2.miniasp.com.tw//Api/Legislators/List?committee=" + committeeType;
            $http.get(source).success(function(data) {
                defer.resolve(data);
            }).error(function() {
                alert("Fetch work FAILED!!")
            });
            return defer.promise;
        }
    };
}]);

app.factory('Individual', ['$http', '$q', function($http, $q) {
    return {
        fetch: function(id) {
            var defer = $q.defer();
            var source = "http://opendata-online.test.demo2.miniasp.com.tw//Api/Legislators/Communication?id=" + id;
            $http.get(source).success(function(data) {
                defer.resolve(data);
            }).error(function() {
                alert("Fetch work FAILED!!")
            });
            return defer.promise;
        }
    };
}]);

app.factory('Analysis', ['$http', '$q', function($http, $q) {
    return {
        fetch: function(id, session) {
            var defer = $q.defer();
            var source;
            if (session) {
                source = "http://opendata-online.test.demo2.miniasp.com.tw//Api/Charts/KPI?id=" + id + "&meetingSession=" + session;
            } else {
                source = "http://opendata-online.test.demo2.miniasp.com.tw/Api/Charts/KPI?id=" + id;
            }
            $http.get(source).success(function(data) {
                defer.resolve(data);
            }).error(function() {
                alert("Fetch work FAILED!!")
            });
            return defer.promise;
        }
    };
}]);

app.factory('News', ['$http', '$q', function($http, $q) {
    return {
        fetch: function(id, session) {
            var defer = $q.defer();
            var source;
            if (session) {
                source = "jsondata/newscount/" + id + "_8-" + session + ".json";
            } else {
                source = "jsondata/newscount/" + id + "_8-0.json";
            }
            $http.get(source).success(function(data) {
                defer.resolve(data);
            }).error(function() {
                alert("Fetch work FAILED!!")
            });
            return defer.promise;
        }
    };
}]);

app.controller("AppCtrl", ['$scope', 'Councilors', 'Individual', 'Analysis', 'News', function($scope, Councilors, Individual, Analysis, News) {

    $scope.updateCommittee = function(committeeType) {
        Councilors.fetch(committeeType).then(function(data) {
            $scope["councilorsByCommittee" + committeeType] = data;
        });
    };

    $scope.fetchIndividual = function(id) {
        Individual.fetch(id).then(function(data) {
            $scope.fetchAnalysis(id);
            $scope.individual = data;
        });
    }

    $scope.fetchAnalysis = function(id, session) {
        Analysis.fetch(id, session).then(function(data) {
            var radarConfig = {
                w: 450,
                h: 450,
                maxValue: 1,
            };
            var statistic = [{
                axes: data
            }];
            var radar = RadarChart.draw("#radar-chart", statistic, radarConfig);
        });
    }

    $scope.updateNews = function(id, session) {
        News.fetch(id, session).then(function(data) {
            $scope.news = filterNews(data, "2014/1");
            var chart = c3.generate({
                data: {
                    x: 'x',
                    xFormat: '%Y/%m/%d',
                    columns: $scope.news,
                    type: "area"
                },
                axis: {
                    x: {
                        type: 'timeseries',
                        tick: {
                            count: 6,
                            format: '%m-%d'
                        }
                    }
                },
                zoom: {
                    enabled: true
                },
                subchart: {
                    show: true
                },
                // point: {
                //     show: false
                // }
            });
        });
    };

    var filterNews = function(arr, date) {
        var uselessIndex = [];
        var re = new RegExp("^" + date + "\\d+");
        for (var i = 1; i < arr[1].length; i++) {          
            if (!re.test(arr[0][i]) || arr[1][i] === "0" && arr[2][i] === "0" && arr[3][i] === "0") {
                uselessIndex.push(i);
            }
        }
        for (var i = uselessIndex.length - 1; i >= 0; i--) {
            for (var j = 0; j < arr.length; j++) {
                arr[j].splice(uselessIndex[i], 1);
            }
        }
        return arr;
    }









    $scope.updateCommittee(1);
    $scope.updateCommittee(2);
    $scope.updateCommittee(3);
    $scope.updateCommittee(4);
    $scope.updateCommittee(5);
    $scope.updateCommittee(6);
    $scope.updateCommittee(7);
    $scope.updateCommittee(8);
    $scope.updateCommittee(9);

    $scope.fetchIndividual(1);
    $scope.fetchAnalysis(1);
    $scope.updateNews(1);







}]);
