'use strict';

var app = angular.module('dashboard', ['ngRoute', 'config']);

app.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/', {
        templateUrl: '/partials/index.html',
        controller: IndexController
    });
}]);

app.run();
