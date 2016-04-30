'use strict';

function IndexController($scope, MQTT_HOST, MQTT_PORT)
{
    var mqtt = new Paho.MQTT.Client(MQTT_HOST, MQTT_PORT, 'dashboard');

    $scope.vmc = {};
    $scope.weather = {};
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
                $scope.vmc.speed = data.speed;
                $scope.vmc.forced = data.forced;
            break;
            case 'domotic/weather':
                $scope.weather = data;
            break;
        }

        $scope.$apply();
    };

    $scope.vmc.update = function (state) {
        var message = new Paho.MQTT.Message(state);
        message.destinationName = 'domotic/vmc/state';

        mqtt.send(message);
    };
}
IndexController.$inject = ['$scope', 'MQTT_HOST', 'MQTT_PORT'];
