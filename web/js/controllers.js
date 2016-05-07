'use strict';

function IndexController($scope, mqtt, pg)
{
    $scope.$watch('weather', function (newValue, oldValue) {
        if (typeof newValue.wind_all !== 'undefined') {
            $scope.beaufort = Math.cbrt(
                Math.pow(newValue.wind_all, 2) / 9
            );
        }
    });

    $scope.vmc = pg.query({
        'q': 'SELECT * FROM vmc ORDER BY created DESC LIMIT 1',
    });
    $scope.weather = pg.query({
        'q': 'SELECT * FROM weather ORDER BY created DESC LIMIT 1',
    });
    $scope.connected = false;

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
                $scope.weather = data;
            break;
        }

        $scope.$apply();
    };

    $scope.vmc_update = function (state) {
        var message = new Paho.MQTT.Message(state);
        message.destinationName = 'domotic/vmc/state';

        mqtt.send(message);
    };

    $scope.scroll= function (anchor) {
        $location.hash(anchor);
        $anchorScroll();
    };
}
IndexController.$inject = ['$scope', 'mqtt', 'pg'];
