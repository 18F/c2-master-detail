(function(angular) {

'use strict';

angular.module('appModule')
  .filter('hello', function() {
    return function(input) {
      return 'hello ' + input;
    }
  });

})(window.angular);
