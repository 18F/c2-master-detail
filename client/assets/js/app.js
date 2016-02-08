(function() {
  'use strict';

  angular.module('application', [
    'ui.router',
    'ngAnimate',

    //foundation
    'foundation',
    'foundation.dynamicRouting',
    'foundation.dynamicRouting.animations'
  ])
    .controller('DashCtrl', function($scope, $state, $http){
      $scope.$on('$viewContentLoaded', function(event) {
        setup_charts();
        overview_requests();
        request_tracking();
      });
    })
    .controller('MessageCtrl', function($scope, $state, $http){
      $scope.$on('$viewContentLoaded', function(event) {
        $('[selectize]').selectize({
          plugins: ['remove_button'],
          persist: false,
          create: true,
          render: {
            item: function(data, escape) {
              return '<div>"' + escape(data.text) + '"</div>';
            }
          },
          onDelete: function(values) {
            return confirm(values.length > 1 ? 'Are you sure you want to remove these ' + values.length + ' items?' : 'Are you sure you want to remove "' + values[0] + '"?');
          }
        });
      });
    })
    .config(config)
    .run(run)

  ;

  config.$inject = ['$urlRouterProvider', '$locationProvider'];

  function config($urlProvider, $locationProvider) {
    $urlProvider.otherwise('/');

    $locationProvider.html5Mode({
      enabled:false,
      requireBase: false
    });

    $locationProvider.hashPrefix('!');
  }

  function run() {
    FastClick.attach(document.body);
  }

  function setup_charts(){
    google.charts.load('current', {'packages':['bar']});
  }

  function overview_requests(){
    google.charts.setOnLoadCallback(drawChart_overview_requests);
    function drawChart_overview_requests() {
      var data = google.visualization.arrayToDataTable([
        ['Month', 'Requests'],
        ['Aug', 1000],
        ['Sep', 1170],
        ['Nov', 660],
        ['Dec', 1030]
      ]);

      var options = {
        chart: {
          title: 'Department Overview',
          subtitle: 'Requests Processed 2015',
        },
        bars: 'horizontal', // Required for Material Bar Charts.
        hAxis: {format: 'decimal'},
        height: 400,
        colors: ['#1b9e77']
      };

      var chart_overview_requests = new google.charts.Bar(document.getElementById('chart_div'));
      chart_overview_requests.draw(data, google.charts.Bar.convertOptions(options));
    }
  }

  function request_tracking(){
    google.charts.setOnLoadCallback(drawChart_request_tracking);
    function drawChart_request_tracking() {
      var data = google.visualization.arrayToDataTable([
        ['Week', 'Requested', 'Incomplete', 'Processed'],
        ['1/11', 1000, 400, 200],
        ['1/18', 1170, 460, 250],
        ['1/25', 660, 1120, 300],
        ['2/1', 1030, 540, 350]
      ]);

      var options = {
        chart: {
          title: 'Department Status',
          subtitle: 'Weekly Processed Summary',
        }
      };

      var chart_request_tracking = new google.charts.Bar(document.getElementById('columnchart_material'));
      chart_request_tracking.draw(data, options);
    }
  }

 



})();
