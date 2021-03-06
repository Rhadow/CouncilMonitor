var app = angular.module("app", []);

app.factory('Councilors', ['$http', '$q', function ($http, $q) {
    return {
        fetch: function (committeeType) {
            var defer = $q.defer();
            var source = "https://congressonline.azurewebsites.net/Api/Legislators/List?committee=" + committeeType;
            $http.get(source).success(function (data) {
                defer.resolve(data);
            }).error(function () {
                console.log("Fetch Councilor FAILED!!");
            });
            return defer.promise;
        }
    };
}]);

app.factory('Individual', ['$http', '$q', function ($http, $q) {
    return {
        fetch: function (id) {
            var defer = $q.defer();
            var source = "https://congressonline.azurewebsites.net/Api/Legislators/Communication?id=" + id;
            $http.get(source).success(function (data) {
                defer.resolve(data);
            }).error(function () {
                console.log("Fetch Individual FAILED!!");
            });
            return defer.promise;
        }
    };
}]);

app.factory('Analysis', ['$http', '$q', function ($http, $q) {
    return {
        fetch: function (id, session) {
            var defer = $q.defer();
            var source;
            if (session) {
                source = "https://congressonline.azurewebsites.net/Api/Charts/KPI?id=" + id + "&meetingSession=" + session;
            } else {
                source = "https://congressonline.azurewebsites.net/Api/Charts/KPI?id=" + id;
            }
            $http.get(source).success(function (data) {
                defer.resolve(data);
            }).error(function () {
                console.log("Fetch Analysis FAILED!!");
            });
            return defer.promise;
        },

        fetchAll: function (id) {
            var deferred = $q.defer();
            var queue = [];
            for (var i = 5; i > 0; i--) {
                queue.push($http.get("https://congressonline.azurewebsites.net/Api/Charts/KPI?id=" + id + "&meetingSession=" + i));
            }
            $q.all(queue).then(function (results) { deferred.resolve(results) }, function (errors) {
                console.log("Fetch All Analysis fail!");
            }, function (updates) {
                console.log("Updating");
            });
            return deferred.promise;
        }
    };
}]);

app.factory('News', ['$http', '$q', function ($http, $q) {
    return {
        fetch: function (id) {
            var defer = $q.defer();
            var source;
            var config = {
                headers: {
                    'Accept': 'application/json;'
                }
            };
            source = "https://congressonline.azurewebsites.net/Api/Charts/GetNewsCountJsonFile?id=" + id;
            $http.get(source, config).success(function (data) {
                defer.resolve(data);
            }).error(function () {
                console.log("Fetch News FAILED!!");
            });
            return defer.promise;
        }
    };
}]);

app.controller("AppCtrl", ['$scope', '$q', 'Councilors', 'Individual', 'Analysis', 'News', function ($scope, $q, Councilors, Individual, Analysis, News) {

    var analysisCache = [];

    $scope.current = {
        target: 5,
    };

    $scope.updateCommittee = function (committeeType) {
        Councilors.fetch(committeeType).then(function (data) {
            $scope["councilorsByCommittee" + committeeType] = data;
        }).then(function () {
            console.log($scope.types);
            $scope.types = [
            { name: "內政", committeeId: $scope.councilorsByCommittee1 },
            { name: "外交國防", committeeId: $scope.councilorsByCommittee2 },
            { name: "經濟", committeeId: $scope.councilorsByCommittee3 },
            { name: "財政", committeeId: $scope.councilorsByCommittee4 },
            { name: "教育文化", committeeId: $scope.councilorsByCommittee5 },
            { name: "交通", committeeId: $scope.councilorsByCommittee6 },
            { name: "司法法制", committeeId: $scope.councilorsByCommittee7 },
            { name: "社福還衛", committeeId: $scope.councilorsByCommittee8 }
            ];
        });
    };

    $scope.fetchIndividual = function (id) {
        $scope.current.target = 6;
        Individual.fetch(id).then(function (data) {
            $scope.fetchAllAnalysis(id);
            $scope.individual = data;
        });
    };

    $scope.fetchAllAnalysis = function (id) {
        Analysis.fetchAll(id)
            .then(function (data) {
                var statistic;
                var session;
                var radarConfig = {
                    w: 450,
                    h: 450,
                    maxValue: 1,
                    transitionDuration: 400,
                    color: function () { }
                };
                for (var i = 0; i < data.length; i++) {
                    session = 5 - i;

                    if (analysisCache[id]) {
                        analysisCache[id][session] = data[i].data;
                    } else {
                        analysisCache[id] = [];
                        analysisCache[id][session] = data[i].data;
                    }

                    if ($scope.hasData(id, session)) {
                        if (session < $scope.current.target) {
                            statistic = [{
                                axes: analysisCache[id][session]
                            }];
                            $scope.current.target = session;
                            radar = RadarChart.draw("#radar-chart", statistic, radarConfig);
                        }
                    }
                }
            })
            .then(function () {
                $scope.ready.analysis = true;
                if ($scope.ready.analysis && $scope.ready.news) {
                    $scope.ready.data = true;
                }
            });
    }

    $scope.drawAnalysis = function (id, session) {
        var radar;
        var statistic;
        var radarConfig = {
            w: 450,
            h: 450,
            maxValue: 1,
            transitionDuration: 400,
            color: function () { }
        };
        statistic = [{
            axes: analysisCache[id][session]
        }];
        radar = RadarChart.update("#radar-chart", statistic, radarConfig);
    };

    $scope.updateNews = function (id) {
        News.fetch(id)
            .then(function (data) {
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
                    subchart: {
                        show: true
                    },
                    zoom: {
                        enabled: true
                    }
                });
            })
            .then(function () {
                $scope.ready.news = true;
                if ($scope.ready.analysis && $scope.ready.news) {
                    $scope.ready.data = true;
                }
            });
    };

    $scope.search = function (target) {
        var targetNotFound = true;
        $scope.searchTarget = "";
        $scope.suggestions = "";
        for (var i = 0; i < $scope.AllCouncilors.length; i++) {
            if ($scope.AllCouncilors[i].FullName === target) {
                $scope.loadData($scope.AllCouncilors[i].LegislatorId);
                targetNotFound = false;
            }
        }
        if (targetNotFound) {
            alert("找不到 '" + target + "'");
            //sweetAlert("喔喔...", "找不到 '" + target + "'", "error");
        }
    };

    $scope.setTarget = function (name) {
        $scope.searchTarget = name;
        $scope.suggestions = "";
    };

    $scope.filterNews = function (arr, date) {
        var uselessIndex = [];
        var re = new RegExp("^" + date + "/1\\d+");
        // for (var i = 1; i < arr[1].length; i++) {
        //     if (!re.test(arr[0][i]) || arr[1][i] === "0" && arr[2][i] === "0" && arr[3][i] === "0") {
        //         uselessIndex.push(i);
        //     }
        // }
        for (var i = 1; i < arr[1].length; i++) {
            if (!re.test(arr[0][i])) {
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

    $scope.random = function () {
        return Math.floor(Math.random() * 116) + 1;
    };

    $scope.meetingSessionClick = function ($event, committee) {
        if (!$scope.hasData($scope.individual.LegislatorId, committee.MeetingSession)) {
            return;
        }
        $event.preventDefault();
        $scope.drawAnalysis($scope.individual.LegislatorId, committee.MeetingSession);
        $scope.current.target = committee.MeetingSession;
    };

    $scope.hasData = function (id, session) {
        var hasData = false;
        if (typeof (analysisCache[id]) !== 'undefined' &&
            typeof (analysisCache[id][session]) !== 'undefined') {
            for (var i = 0; i < analysisCache[id][session].length; i++) {
                if (analysisCache[id][session][i].value) {
                    hasData = true;
                }
            }
        }
        return hasData;
    };

    $scope.suggest = function () {
        var result = [];
        for (var i = 0; i < $scope.AllCouncilors.length; i++) {
            if ($scope.AllCouncilors[i].FullName.indexOf($scope.searchTarget) >= 0) {
                if ($scope.searchTarget !== "") {
                    result.push($scope.AllCouncilors[i].FullName);
                }
            }
        }
        $scope.suggestionIndex = -1;
        $scope.suggestions = result;
    };

    $scope.pickSuggestion = function (ev, suggestions) {
        var kc = ev.keyCode ? ev.keyCode : ev.which;

        if (suggestions && suggestions.length !== 0) {
            //When Up arrow is pressed
            if (kc === 38) {
                ev.preventDefault();
                if ($scope.suggestionIndex <= 0) {
                    $scope.suggestionIndex = suggestions.length - 1;
                } else {
                    $scope.suggestionIndex--;
                }
                $scope.searchTarget = suggestions[$scope.suggestionIndex];
            }
            //When down arrow is pressed
            if (kc === 40) {
                ev.preventDefault();
                if ($scope.suggestionIndex >= suggestions.length - 1) {
                    $scope.suggestionIndex = 0;
                } else {
                    $scope.suggestionIndex++;
                }
                $scope.searchTarget = suggestions[$scope.suggestionIndex];
            }
            //When enter is pressed
            if (kc === 13) {
                ev.preventDefault();
                $scope.suggestions = "";
            }
        }
    };

    $scope.hoverSuggestion = function (suggestion) {
        $scope.suggestionIndex = $scope.suggestions.indexOf(suggestion);
    };

    $scope.isAnalysisEmpty = function (id) {
        var isEmpty = true;
        if (analysisCache[id]) {
            for (var i = 1; i < analysisCache[id].length; i++) {
                if ($scope.hasData(id, i)) {
                    isEmpty = false;
                }
            }
        }
        return isEmpty;
    }

    for (var i = 0; i < 10; i++) {
        $scope.updateCommittee(i);
    }

    $scope.loadData = function (id) {
        if ($scope.current.id !== id) {
            $scope.ready.news = false;
            $scope.ready.analysis = false;
            $scope.ready.data = false;
            $scope.updateNews(id);
            $scope.fetchIndividual(id);
            $scope.current.id = id;
        }
    }

    Councilors.fetch(0).then(function (data) {
        $scope.ready = {
            data: false,
            news: false,
            analysis: false
        };
        $scope.AllCouncilors = data;
        var x = $scope.random();
        while ($scope.AllCouncilors[i - 1].IsResignation) {
            x = $scope.random();
        }
        $scope.fetchIndividual(x);
        $scope.updateNews(x);
        $scope.current.id = x;
    });

}]);
