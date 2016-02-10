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
    .controller('MessageCtrl', 
      ["$scope", "$state", "$http", function($scope, $state, $http){
        $scope.$on('$viewContentLoaded', function(event) {
          setup_list();
          blast_off_messages($scope);
        });
    }])
    .controller('CompletedMessageCtrl', 
      ["$scope", "$state", "$http", function($scope, $state, $http){
        $scope.$on('$viewContentLoaded', function(event) {
          setup_completed_list();
          blast_off_messages($scope);
        });
    }])
    .config(config)
    .run(run)

  ;

  config.$inject = ['$urlRouterProvider', '$locationProvider'];

  function blast_off_messages($scope){
    activate_list_item();
    $scope.add_new_vendor = function(){
      $('.new-vendor').before(new_vendor);
    }
    $scope.add_new_subscriber = function(){
      $('.new-subscriber').before(new_subcribe);
    }
    $scope.view_all_activity = function(){
      $('.activity-item').removeClass('single').addClass('visible');
      $('.activity-visible-button').remove();
    }
  }

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

  function load_active_message(el){

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

var circleX = '<svg xmlns="http://www.w3.org/2000/svg" class="iconic iconic-circle-x injected-svg iconic-color-secondary ng-isolate-scope iconic-sm ng-scope" width="128" height="128" viewBox="0 0 128 128" data-src="assets/img/iconic/circle-x.svg" size="small"><g class="iconic-metadata"><title>Circle X</title></g><defs><clipPath id="iconic-size-lg-circle-x-clip-0-17"><path d="M0 0v128h128v-128h-128zm90.657 85l-5.657 5.657-21-21-21 21-5.657-5.657 21-21-21-21 5.657-5.657 21 21 21-21 5.657 5.657-21 21 21 21z"></path></clipPath><clipPath id="iconic-size-md-circle-x-clip-0-17"><path d="M0 0v32h32v-32h-32zm23.121 21l-2.121 2.121-5-5-5 5-2.121-2.121 5-5-5-5 2.121-2.121 5 5 5-5 2.121 2.121-5 5 5 5z"></path></clipPath><clipPath id="iconic-size-sm-circle-x-clip-0-17"><path d="M0 0v16h16v-16h-16zm11.414 10l-1.414 1.414-2-2-2 2-1.414-1.414 2-2-2-2 1.414-1.414 2 2 2-2 1.414 1.414-2 2 2 2z"></path></clipPath></defs><g class="iconic-circle-x-lg iconic-container iconic-lg" data-width="128" data-height="128" display="inline"><circle cx="64" cy="64" r="64" clip-path="url(#iconic-size-lg-circle-x-clip-0-17)" class="iconic-circle-x-body iconic-property-fill"></circle></g><g class="iconic-circle-x-md iconic-container iconic-md" data-width="32" data-height="32" display="none" transform="scale(4)"><circle cx="16" cy="16" r="16" clip-path="url(#iconic-size-md-circle-x-clip-0-17)" class="iconic-circle-x-body iconic-property-fill"></circle></g><g class="iconic-circle-x-sm iconic-container iconic-sm" data-width="16" data-height="16" display="none" transform="scale(8)"><circle cx="8" cy="8" r="8" clip-path="url(#iconic-size-sm-circle-x-clip-0-17)" class="iconic-circle-x-body iconic-property-fill"></circle></g></svg>';
var new_vendor = '<div class="small-12 grid-block vertical"><div class="grid-block"><div class="grid-content small-5 vendor-field"><label>Vendor<input type="text"></label></div><div class="grid-content small-6 vendor-field"><label>Link<input type="text"></label></div><div class="grid-content small-1 vendor-field vendor-delete"><a href="" class="align-right">'+circleX+'</a></div></div>';
var new_subcribe = '<div class="grid-block" style="padding-bottom:0px;"><div class="grid-content small-10 subscribe-field"><label><input type="email" placeholder="name@domain.com"></label></div><div class="grid-content small-2 subscribe-field subscribe-delete"><a href="" class="align-right">'+ circleX +'</a></div></div>';
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
var item_template = '<li class="inbox-item">' + 
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
