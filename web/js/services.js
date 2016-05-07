'use strict';

angular.module('dashboardServices', ['ngResource', 'config'])
    .factory('mqtt', ['MQTT_HOST', 'MQTT_PORT', function (MQTT_HOST, MQTT_PORT) {
        return new Paho.MQTT.Client(MQTT_HOST, MQTT_PORT, 'dashboard');
    }])
    .factory('pg', ['$resource', 'PG_URL', 'PG_DB', 'PG_USER', 'PG_PASSWORD', function ($resource, PG_URL, PG_DB, PG_USER, PG_PASSWORD) {
        return $resource(
            PG_URL + '/query',
            {db: PG_DB, u: PG_USER, p: PG_PASSWORD},
            {
                query: {method: 'GET', transformResponse: function (data, headersGetter) {
                    var results = {};
                    var json = JSON.parse(data);

                    for (var i = 0; i < json.results[0].series[0].columns.length; i++) {
                        var name = json.results[0].series[0].columns[i];
                        var value = json.results[0].series[0].values[0][i];

                        results[name] = value;
                    }

                    return results;
                }},
            }
        );
    }]);
