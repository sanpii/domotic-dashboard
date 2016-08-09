'use strict';

var app = angular.module('dashboard', ['ngRoute', 'config', 'dashboardServices']);

app.controller('index', IndexController)
    .controller('header', HeaderController)
    .controller('vmc', VmcController)
    .controller('weather', WeatherController)
    .controller('sensors', SensorsController)
    .controller('network', NetworkController);

app.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/', {
        templateUrl: '/partials/index.html',
        controller: 'index',
    });
}]);

app.component('graph', {
    templateUrl: '/partials/components/graph.html',
    bindings: {
        name: '@',
        min: '<',
        max: '<',
        current: '<',
    }
});

app.directive('highlighter', ['$timeout', function($timeout) {
    return {
        restrict: 'A',
        scope: {
            model: '=highlighter'
        },
        link: function(scope, element) {
            scope.$watch('model', function (nv, ov) {
                element.addClass('highlight');
                $timeout(function () {
                    element.removeClass('highlight');
                }, 1000);
            });
        }
    };
}]);

app.run();
