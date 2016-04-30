'use strict';

function IndexController($scope, MQTT_HOST, MQTT_PORT)
{
    var mqtt = new Paho.MQTT.Client(MQTT_HOST, MQTT_PORT, 'dashboard');

    $scope.weather = {};
    $scope.connected = false;

    mqtt.connect({
        useSSL: true,
        onSuccess: function () {
            $scope.connected = true;
            $scope.$apply();

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
            case 'domotic/weather':
                $scope.weather = data;
            break;
        }

        $scope.$apply();
    };
}
IndexController.$inject = ['$scope', 'MQTT_HOST', 'MQTT_PORT'];
