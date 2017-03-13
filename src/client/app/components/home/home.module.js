'use-strict';

angular.module('homePage', ['ngRoute', 'ngCookies'])
    .component('homePage', {
        controller: ['$scope',
            '$rootScope',
            '$http',
            '$location',
            '$cookies', function ($scope, $rootScope, $http, $location, $cookies) {
            }]

    });
