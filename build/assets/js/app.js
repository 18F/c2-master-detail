(function() {
  'use strict';

  angular.module('application', [
    'ui.router',
    'ngAnimate',
    'daterangepicker',
    'cfp.hotkeys',
    'foundation',
    'foundation.dynamicRouting',
    'foundation.dynamicRouting.animations'
  ])
  .controller('MessageCtrl',
    ["$scope", "$state", "$http", "$filter", "hotkeys", function($scope, $state, $http, $filter, hotkeys){
      $scope.$on('$viewContentLoaded', function(event) {
        $scope.filter = "";
        $scope.dateFilter = "";
        $scope.query = {
          $: "",
          id: "",
          product_company: "",
          product_type: "",
          product_name: "",
          person_name: "",
          date: "",
          description: "",
          vendor: "",
          amount: "",
          org_code: "",
          inbox_status: ""
        };
        $scope.show_advanced_search = false;
        $scope.focusIndex = 0;
        $scope.items = mock_data;
        $scope.itemsDisplayed = $scope.items;
        blast_off_messages($scope, $state, $http, $filter, hotkeys);
      });
  }])
  .config(config)
  .run(run)
;

  config.$inject = ['$urlRouterProvider', '$locationProvider'];

  function search(nameKey, arr){
    for (var i = 0; i < arr.length; i++) {
      if(arr[i]["id"] == nameKey){
        return arr[i];
      }
    }
  }

  function blast_off_messages($scope, $state, $http, $filter, hotkeys){
    $scope.setIndex = function(new_list){
      for (var i = new_list.length - 1; i >= 0; i--) {
        new_list[i]["navIndex"] = i;
      }
      $scope.items = new_list;
    }
    $scope.issetQuery = function(){
      if(true){
      }
    }
    $scope.add_new_vendor = function(){
      $('.new-vendor').before(new_vendor);
    }
    $scope.add_new_subscriber = function(){
      $('.new-subscriber').before(new_subcribe);
    }
      $scope.isEmptyObject = function(obj) {
        return angular.equals("", obj);
      }
      $scope.resetLink = function(){
        $scope.reset_filter();
        $scope.setQuery = $scope.query;
        $scope.processFilter();
        $scope.processDateFilter();
      }
      $scope.processFilterButton = function(){
        $scope.show_advanced_search = false;
        $scope.setQuery = $scope.query;
        $scope.processFilter();
        $scope.processDateFilter();
      }
      $scope.remove_filter_key = function(key){
        $scope.query[key] = "";
        $scope.processFilter();
      }
      $scope.remove_filter_query = function(){
        $scope.query.$ = "";
        $scope.processFilter();
      }
      $scope.remove_date_filter = function(){
        $scope.dateFilter = "";
      }
      $scope.processFilter = function(){
        console.log("$scope.query: ", $scope.query);
        var new_list = $filter('filter')($scope.itemsDisplayed, $scope.query);
        $scope.focusIndex = 0;
        $scope.setIndex(new_list);
        console.log('In feed: ', $scope.items.length);
      }
      $scope.processDateFilter = function(){
        console.log('$scope.dateFilter: ', $scope.dateFilter);
        console.log('$scope.itemsDisplayed: ', $scope.itemsDisplayed.length);
        console.log('$scope.items: ', $scope.items.length);
        console.log('$scope.items: ', $scope.items);
        if(!angular.equals("", $scope.dateFilter)){
          console.log("$scope.dateFilter: ", $scope.dateFilter);
          var startDate = moment($scope.dateFilter.split(' - ')[0], 'MM/DD/YYYY');
          var endDate = moment($scope.dateFilter.split(' - ')[1], 'MM/DD/YYYY');
          var range = moment.range(startDate, endDate);
          console.log('startDate: ', startDate);
          console.log('endDate: ', endDate);
          var newItems = []
          console.log('$scope.itemsDisplayed: ', $scope.itemsDisplayed.length);
          console.log('$scope.items: ', $scope.items.length);
          for (var i = $scope.items.length - 1; i >= 0; i--) {
            if( range.contains(moment($scope.items[i]["date"], 'MM/DD/YYYY')) ){
              console.log('$scope.items[i]: ', $scope.items[i]);
              newItems.push($scope.items[i]);
            }
          }
          console.log('newItems: ', newItems);
          $scope.items = newItems;
          $scope.focusIndex = 0;
          $scope.setIndex(newItems);
          console.log('In feed: ', $scope.items.length);
        } else {
          $scope.dateFilter = "";
        }
      }
      $scope.$watch('query', function(newValue, oldValue) {
        console.log('Running');
        $scope.processFilter();
        $scope.processDateFilter();
      }, true);
      $scope.$watch('dateFilter', function(newValue, oldValue) {
        console.log('dateFilter: ', newValue);
        $scope.processFilter();
        $scope.processDateFilter();
      }, true);
      $scope.filter_by = function(param){
        console.log(param);
        // $scope.reset_filter();
        $scope.query.inbox_status = param;
        $scope.setQuery = $scope.query;
        $scope.processFilter();
        $scope.processDateFilter();
      }

    /* Onload */
    window.setTimeout(function(){
      $('.activity-item').first().addClass("visible single");
      
      $('input.date-picker').on('apply.daterangepicker', function(ev, picker) {
          $scope.dateFilter = picker.startDate.format('MM/DD/YYYY') + ' - ' + picker.endDate.format('MM/DD/YYYY')
          $(this).val($scope.dateFilter);
      });

      $('input.date-picker').on('cancel.daterangepicker', function(ev, picker) {
          $scope.dateFilter = "";
          $(this).val('');
      });

    }, 500);
    
    console.log('focusIndex: ', $scope.focusIndex);
    
    $scope.update_detail = function(selectedIndex){
      $scope.focusIndex = selectedIndex;
    }
    $scope.$watch('focusIndex', function(newValue, oldValue) {
      console.log(newValue);
      $scope.single = $scope.items[newValue];
      return newValue;
    });
    $scope.view_all_activity = function(){
      if(!$('.status-comment').hasClass('open')){
        $('.status-comment').addClass('open');
        $('.activity-item.single').addClass('first');
        $('.activity-item').removeClass('single').addClass('visible');
        $('.activity-visible-button span').text('Hide All');
      } else {
        $('.status-comment').removeClass('open');
        $('.activity-item').removeClass('visible');
        $('.activity-item.first').addClass('visible');
        $('.activity-visible-button span').text('View All');
      }
    }

    $scope.correctScroll = function () {
      $scope.items[$scope.focusIndex];
      console.log('focus: ', $scope.focusIndex);
    }

    $scope.open = function ( index ) {
      var items;
      for ( var i = 0; i < $scope.itemsDisplayed.length; i++ ) {
        if ( $scope.itemsDisplayed[ i ].navIndex !== index ) { continue; }
        items = $scope.itemsDisplayed[ i ];
      }
      console.log('opening : ', items );
    };

    if($state.params && $state.params.id != undefined){
      $scope['single'] = search($state.params.id, mock_data);
    }
    if($scope['single'] == undefined){
      $scope['single'] = mock_data[0];
    }
    console.log($scope['single']);

    $scope.reset_data = function(){
      $scope.items = mock_data;
      $scope.itemsDisplayed = mock_data;
    }
    
    $scope.reset_filter = function(){
      $scope.reset_data();
      $scope.dateFilter = "";
      $scope.query = {
        $: "",
        id: "",
        product_company: "",
        product_type: "",
        product_name: "",
        person_name: "",
        date: "",
        description: "",
        vendor: "",
        amount: "",
        org_code: "",
        inbox_status: ""
      };
    }
    $scope.keys = [];
    // $scope.focusIndexSelect = function() { $scope.open( $scope.focusIndex ); }});
    $scope.focusIndexDown = function() {
      if($scope.items.length >= $scope.focusIndex && $scope.focusIndex > 0){
        $scope.focusIndex--;
        $scope.correctScroll();
      }
    };
    $scope.focusIndexUp = function() {
      if($scope.items.length > $scope.focusIndex+1 && $scope.focusIndex >= 0){
        $scope.focusIndex++;
        $scope.correctScroll();
      }
    };
    $scope.advanced_search = function(){
      $('.date-picker').daterangepicker({
          "ranges": {
              "Today": [
                  "2016-02-17",
                  "2016-02-17"
              ],
              "Yesterday": [
                  "2016-02-16",
                  "2016-02-16"
              ],
              "Last 7 Days": [
                  "2016-02-11",
                  "2016-02-17"
              ],
              "Last 30 Days": [
                  "2016-01-19",
                  "2016-02-17"
              ],
              "This Month": [
                  "2016-02-01",
                  "2016-03-01"
              ],
              "Last Month": [
                  "2016-01-01",
                  "2016-02-01"
              ]
          },
          "linkedCalendars": true,
          "autoUpdateInput": false,
          "opens": "left",
          "drops": "up",
          "buttonClasses": "button small",
          "applyClass": "button success",
          "cancelClass": "button alert"
      }, function(start, end, label) {
        var dateRange = start.format('MM/DD/YYYY') + ' - ' + end.format('MM/DD/YYYY');
        $scope.dateFilter = dateRange;
        console.log('New date range selected: ' + dateRange + ' (predefined range: ' + label + ')');
      });
      $scope.show_advanced_search ? $scope.show_advanced_search = false : $scope.show_advanced_search = true;
    }
    hotkeys.add({
      combo: 's',
      description: 'Select the search field',
      callback: function() {
        $('.search-field-input').focus();
        return false;
      }
    });
    hotkeys.add({
      combo: 'up',
      description: 'Select the inbox item above',
      callback: function() {
        $scope.focusIndexDown();
      }
    });
    hotkeys.add({
      combo: 'down',
      description: 'Select the inbox item below',
      callback: function() {
        $scope.focusIndexUp();
      }
    });

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

  function load_active_message(el){

  }

  function setup_list(){

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
    $('.title input').selectize({
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
