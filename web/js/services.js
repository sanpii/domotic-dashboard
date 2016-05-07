'use strict';

angular.module('dashboardServices', ['config'])
    .factory('mqtt', ['MQTT_HOST', 'MQTT_PORT', function (MQTT_HOST, MQTT_PORT) {
        return new Paho.MQTT.Client(MQTT_HOST, MQTT_PORT, 'dashboard');
    }]);
