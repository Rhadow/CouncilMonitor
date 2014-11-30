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
            console.log(source);
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
            $scope.news = filterNews(data, "2014");
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

    var filterNews = function(arr, date) {
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
    }



    for (var i = 0; i < 10; i++) {
        $scope.updateCommittee(i);
    }

    Councilors.fetch(0).then(function(data) {
        $scope.AllCouncilors = data;
    });

    $scope.fetchIndividual(1);
    $scope.fetchAnalysis(1);
    $scope.updateNews(91, 0);







}]);
