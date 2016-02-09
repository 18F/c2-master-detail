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
        setup_list();
        setup_selectize();
        activate_list_item();
      });
    })
    .controller('CompletedMessageCtrl', function($scope, $state, $http){
      $scope.$on('$viewContentLoaded', function(event) {
        setup_completed_list();
        setup_selectize();
        activate_list_item();
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
    if (loaded == false){
      loaded = true;
      google.charts.load('current', {'packages':['bar']});
    }
  }

  function remove_active_list_item(){
    $('.inbox-item.active').removeClass('active');
  }

  function activate_list_item(){
      // alert('working');
      $('.inbox-list .inbox-item').first().addClass('active');
      $('.inbox-item').on('click', function(d){
        set_list_item_active(this);
      });
  }

  function set_list_item_active(el){
    remove_active_list_item();
    $(el).addClass('active');
  }

  function setup_list(){
    var options = {
      valueNames: search_params,
      item: item_template
    };

    var userList = new List('messages', options, data);
    userList.filter(function(item) {
       if (item.values().inbox_status != "Approved") {
           return true;
       } else {
           return false;
       }
    });
  }

  function setup_completed_list(){
    var options = {
      valueNames: search_params,
      item: item_template
    };

    var userList = new List('messages', options, data);
    
    userList.filter(function(item) {
       if (item.values().inbox_status != "Needs Attention" &&
                              item.values().inbox_status != "Pending" &&
                              item.values().inbox_status != "New") {
           return true;
       } else {
           return false;
       }
    });
  }

  function setup_selectize(){
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
        console.log('Deleted: ', values)
      }
    });
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

var mock_data = data;
var loaded = false;
var loaded_active = false;
var search_params = [ 
                      'id',
                      'product_company',
                      'product_name',
                      'person_name',
                      'date',
                      'message_status',
                      'description',
                      'comment_1',
                      'comment_2',
                      'comment_3',
                      'approver',
                      'purchaser',
                      'reconciler',
                      'subscriber_1',
                      'subscriber_2',
                      'subscriber_3',
                      'vendor',
                      'amount',
                      'amount_type',
                      'org_code',
                      'comment_1_date',
                      'comment_1_time',
                      'comment_2_date',
                      'comment_2_time',
                      'comment_3_date',
                      'comment_3_time',
                      'building_number',
                      'inbox_status'
                    ];
var item_template = '<li class="inbox-item success">' + 
                      '<a ui-sref="message">' + 
                        '<p>Requester: <b class="person_name"></b><br>' + 
                          '<span class="date"></span>'+
                        '</p>'+
                        '<h5 class="product_name"></h5>' +
                        '<div class="fr">'+
                          '<span class="inbox_status">'+
                          '</span>'+
                          '<span class="label" style="float: right;">'+
                            '<img zf-iconic="" icon="document" size="small" class="iconic-color-primary"> File Attached'+
                          '</span>'+
                        '</div>'+
                      '</a>'+
                    '</li>';
