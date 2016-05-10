'use strict';

var app = angular.module('dashboard', ['ngRoute', 'config', 'dashboardServices']);

app.controller('index', IndexController)
    .controller('header', HeaderController)
    .controller('vmc', VmcController)
    .controller('weather', WeatherController)
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
        min: '<',
        max: '<',
        current: '<'
    }
});

app.run();
