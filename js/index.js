var app = angular.module("app", []);

app.factory('Councilors', ['$http', '$q', function($http, $q) {
    return {
        fetch: function(committeeType) {
            var defer = $q.defer();
            var source = "https://congressonline.azurewebsites.net/Api/Legislators/List?committee=" + committeeType;
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
            var source = "https://congressonline.azurewebsites.net/Api/Legislators/Communication?id=" + id;
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
                source = "http://opendata-online.test.demo2.miniasp.com.tw/Api/Charts/KPI?id=" + id + "&meetingSession=" + session;
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
            $scope.analysis = data;
            var radarConfig = {
                w: 450,
                h: 450
            };
            var statistic = [{
                axes: $scope.analysis
            }];
            var radar = RadarChart.draw("#radar-chart", statistic, radarConfig);
        });
    }

    $scope.updateNews = function(id, session) {
        News.fetch(id, session).then(function(data) {
            $scope.news = data;
            var chart = c3.generate({
                data: {
                    x: 'x',
                    xFormat: '%Y/%m/%d',
                    columns: $scope.news
                },
                axis: {
                    x: {
                        type: 'timeseries',
                    }
                }
            });
        });
    };









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
