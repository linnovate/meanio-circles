'use strict';

angular.module('mean.circles').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider.state('manage circles', {
      url: '/circles/manage',
      templateUrl: 'circles/views/index.html',
      requiredCircles: {
        circles: ['admin']
      }
    }).state('create circles', {
      url: '/circles/create',
      templateUrl: 'circles/views/create.html',
      requiredCircles: {
        circles: ['admin']
      }
    });
  }
])
  .run(['$rootScope', '$state', '$http', '$log', 'MeanUser', function ($rootScope, $state, $http, $log, MeanUser) {
    $rootScope.$on('$stateChangeStart', function (e, toState) {
      var acl = MeanUser.acl;
      // If the route has a circle requirement on it validate it
      if (toState.requiredCircles && angular.isArray(toState.requiredCircles.circles)) {
        for (var j = 0; j < toState.requiredCircles.circles.length; j++) {
          var requiredCircle = toState.requiredCircles.circles[j];
          // If MeanUser hasn't loaded yet, request circles directly
          if (acl.allowed) {
            checkCircle(acl, requiredCircle);
          } else {
            $http.get('/api/circles/mine').then(function(response) {
              aclCallBack(response.data);
            }).catch(function(error) {
              $log.warn('error getting user circles via /api/circles/mine', error);
            });
          }
        }
      }

      function aclCallBack (response) {
        checkCircle(response, requiredCircle);
      }

      function checkCircle (acl, requiredCircle) {
        if (acl.allowed.indexOf(requiredCircle) === -1) {
          e.preventDefault();
          $state.go(toState.requiredCircles.denyState || 'home');
        }
      }
    });
  }]
);
