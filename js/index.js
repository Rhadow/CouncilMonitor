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
                source = "https://congressonline.azurewebsites.net/Api/Charts/KPI?id=" + id + "&meetingSession=" + session;
            } else {
                source = "https://congressonline.azurewebsites.net/Api/Charts/KPI?id=" + id;
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
        fetch: function(id) {
            var defer = $q.defer();
            var source;
            var config = {
                headers: {
                    'Accept': 'application/json;'
                }
            };
            source = "https://congressonline.azurewebsites.net/Api/Charts/GetNewsCountJsonFile?id=" + id;
            $http.get(source, config).success(function(data) {
                defer.resolve(data);
            }).error(function() {
                alert("Fetch work FAILED!!")
            });
            return defer.promise;
        }
    };
}]);

app.controller("AppCtrl", ['$scope', 'Councilors', 'Individual', 'Analysis', 'News', function($scope, Councilors, Individual, Analysis, News) {

    var analysisCache = [];

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
        var radar;
        var statistic;
        var radarConfig = {
            w: 450,
            h: 450,
            maxValue: 1,
            transitionDuration: 400,
            color: function() {}
        };
        if (analysisCache[id]) {
            if (analysisCache[id][session]) {
                statistic = [{
                    axes: analysisCache[id][session]
                }];
                radar = RadarChart.update("#radar-chart", statistic, radarConfig);
            } else {
                Analysis.fetch(id, session).then(function(data) {
                    if (analysisCache[id]) {
                        analysisCache[id][session] = data;
                    } else {
                        analysisCache[id] = [];
                        analysisCache[id][session] = data;
                    }
                    statistic = [{
                        axes: data
                    }];
                    radar = RadarChart.update("#radar-chart", statistic, radarConfig);
                });
            }
        } else {
            Analysis.fetch(id, session).then(function(data) {
                if (analysisCache[id]) {
                    analysisCache[id][session] = data;
                } else {
                    analysisCache[id] = [];
                    analysisCache[id][session] = data;
                }
                statistic = [{
                    axes: data
                }];
                radar = RadarChart.draw("#radar-chart", statistic, radarConfig);
            });
        }
    }

    $scope.updateNews = function(id) {
        News.fetch(id).then(function(data) {
            $scope.news = $scope.filterNews(data, "2014");
            //$scope.news = data;
            var C3Chart = c3.generate({
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
                            count: 10,
                            format: '%Y/%m/%d'
                        },
                        label: {
                            text: '日期(年/月/日)',
                            position: 'outer-center'
                        }
                    },
                    y: {
                        label: {
                            text: '新聞數量(則)',
                            position: 'outer-middle'
                        }
                    },
                },
                zoom: {
                    enabled: true
                },
                subchart: {
                    show: true
                }
            });
        });
    };

    $scope.search = function(target) {
        var targetNotFound = true;
        for (var i = 0; i < $scope.AllCouncilors.length; i++) {
            if ($scope.AllCouncilors[i].FullName === target) {
                $scope.fetchIndividual($scope.AllCouncilors[i].LegislatorId);
                targetNotFound = false;
            }
        }
        if (targetNotFound) {
            alert("找不到 '" + target + "'");
        }
    };

    $scope.filterNews = function(arr, date) {
        var uselessIndex = [];
        var re = new RegExp("^" + date + "/1\\d+");
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
    };

    for (var i = 0; i < 10; i++) {
        $scope.updateCommittee(i);
    }

    Councilors.fetch(0).then(function(data) {
        $scope.AllCouncilors = data;
    });

    $scope.fetchIndividual(1);
    $scope.fetchAnalysis(1, 0);
    $scope.updateNews(1);







}]);
