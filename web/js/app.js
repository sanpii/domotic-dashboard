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
        min: '<',
        max: '<',
        current: '<'
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
        if (nv !== ov) {
          element.addClass('text-success');

          $timeout(function () {
            element.removeClass('text-success');
          }, 5000);
        }
      });
    }
  };
}]);

app.run();
