'use strict';

function IndexController($scope, mqtt, MQTT_USER, MQTT_PASSWORD)
{
    mqtt.connect({
        useSSL: true,
        userName: MQTT_USER,
        password: MQTT_PASSWORD,
        onSuccess: function () {
            $scope.connected = true;
            $scope.$apply();

            mqtt.subscribe('#');
        },
        onFailure: function (message) {
            console.log('Connection failed: ' + message.errorMessage);
        }
    });

    mqtt.onConnectionLost = function (response) {
        $scope.connected = false;
        $scope.$apply();

        if (response.errorCode !== 0) {
            console.log(response.errorMessage);
        }
    };

    mqtt.onMessageArrived = function (message) {
        var data = JSON.parse(message.payloadString);

        $scope.$broadcast(message.destinationName, data);
    };
}
IndexController.$inject = ['$scope', 'mqtt', 'MQTT_USER', 'MQTT_PASSWORD'];

function HeaderController($scope, $location, $anchorScroll)
{
    $scope.scroll= function (anchor) {
        $location.hash(anchor);
        $anchorScroll();
    };
}
HeaderController.$inject = ['$scope', '$location', '$anchorScroll'];

function VmcController($scope, mqtt, pg)
{
    $scope.$on('domotic/vmc', function (event, data) {
        $scope.vmc = data;
    });

    $scope.vmc = pg.query({
        'q': 'SELECT * FROM vmc ORDER BY created DESC LIMIT 1',
    });

    $scope.vmc_update = function (state) {
        var message = new Paho.MQTT.Message(state);
        message.destinationName = 'domotic/vmc/state';

        mqtt.send(message);
    };
}
VmcController.$inject = ['$scope', 'mqtt', 'pg'];

function WeatherController($scope, pg)
{
    $scope.$on('domotic/weather', function (event, data) {
        $scope.weather = data;

        $scope.$broadcast('domotic/temperature', {room_id: 2, temperature: data.temperature_indoor});
        $scope.$broadcast('domotic/temperature', {room_id: 3, temperature: data.temperature_outdoor});
        $scope.$broadcast('domotic/humidity', {room_id: 2, humidity: data.humidity_indoor});
        $scope.$broadcast('domotic/humidity', {room_id: 3, humidity: data.humidity_outdoor});
    });

    $scope.weather = pg.query({
        'q': 'SELECT *, round(cbrt(pow(wind_speed, 2) / 9)) AS beaufort FROM weather ORDER BY created DESC LIMIT 1',
    });
}
WeatherController.$inject = ['$scope', 'pg'];

function SensorsController($scope, pg)
{
    $scope.$on('domotic/temperature', function (event, data) {
        Object.keys($scope.sensors).forEach(function (key) {
            if (data.room_id == $scope.sensors[key].room_id) {
                $scope.sensors[key].temperature = data.temperature;
                return;
            }
        });

        $scope.$apply();
    });

    $scope.$on('domotic/humidity', function (event, data) {
        Object.keys($scope.sensors).forEach(function (key) {
            if (data.room_id == $scope.sensors[key].room_id) {
                $scope.sensors[key].humidity = data.humidity;
                return;
            }
        });

        $scope.$apply();
    });

    var sql = " \
 WITH temperatures AS ( \
    SELECT *, \
    ROW_NUMBER() OVER(PARTITION BY room_id ORDER BY created DESC) \
    FROM temperature \
), \
humidities AS ( \
    SELECT *, \
    ROW_NUMBER() OVER(PARTITION BY room_id ORDER BY created DESC) \
    FROM humidity \
) \
SELECT room_id, label, temperature, humidity \
    FROM room \
    JOIN temperatures USING(room_id) \
    JOIN humidities USING(room_id) \
    WHERE temperatures.row_number = 1 \
        AND humidities.row_number = 1";

    $scope.sensors = pg.query({'q': sql});
}
SensorsController.$inject = ['$scope', 'pg'];

function NetworkController($scope, pg)
{
    var sql = " \
WITH last_minute AS ( \
    SELECT date_trunc('minute', created) \
        FROM connected_device \
        ORDER BY 1 DESC \
        LIMIT 1 \
), \
summary AS ( \
    SELECT name, COUNT(1) \
        FROM connected_device \
        LEFT JOIN device USING(mac) \
        WHERE created >= (SELECT * FROM last_minute) \
        GROUP BY GROUPING SETS (name, ()) \
        ORDER BY 2 DESC \
), \
summary_table AS ( \
    SELECT array_agg(count) \
        FROM summary \
        WHERE name IS NULL \
) \
SELECT array_agg[1] AS nb_devices, array_agg[2] AS nb_unknow_devices \
    FROM summary_table";

    $scope.$on('domotic/network', function (event) {
        $scope.network = pg.query({
            'q': sql,
            'db': 'network',
        });
    });

    $scope.$broadcast('domotic/network');
}
NetworkController.$inject = ['$scope', 'pg'];
