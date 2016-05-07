'use strict';

var app = angular.module('dashboard', ['ngRoute', 'config', 'dashboardServices']);

app.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/', {
        templateUrl: '/partials/index.html',
        controller: IndexController
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
