'use strict';

function IndexController($scope, mqtt, pg)
{
    mqtt.connect({
        useSSL: true,
        onSuccess: function () {
            $scope.connected = true;
            $scope.$apply();

            mqtt.subscribe('domotic/vmc');
            mqtt.subscribe('domotic/weather');
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

        switch (message.destinationName) {
            case 'domotic/vmc':
                $scope.vmc = data;
            break;
            case 'domotic/weather':
                data.beaufort = Math.round(
                    Math.cbrt(
                        Math.pow(data.wind_all, 2) / 9
                    )
                );

                $scope.weather = data;
            break;
        }
        $scope.$apply();
    };
}
IndexController.$inject = ['$scope', 'mqtt', 'pg'];

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

function WeatherController($scope, mqtt, pg)
{
    $scope.weather = pg.query({
        'q': 'SELECT *, round(cbrt(pow(wind_all, 2) / 9)) AS beaufort FROM weather ORDER BY created DESC LIMIT 1',
    });
}
WeatherController.$inject = ['$scope', 'mqtt', 'pg'];

function NetworkController($scope, mqtt, pg)
{
    $scope.network = getNetworkInfo(pg);
    setTimeout(function () {
        $scope.network = getNetworkInfo(pg);
    }, 3 * 60 * 1000);
}
NetworkController.$inject = ['$scope', 'mqtt', 'pg'];

function getNetworkInfo(pg)
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

    return pg.query({
        'q': sql,
        'db': 'network',
    });
}
