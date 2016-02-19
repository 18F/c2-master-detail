(function() {
  console.log('(function() {');
  'use strict';

  angular.module('application', [
    'ui.router',
    'ngAnimate',
    'daterangepicker',
    'cfp.hotkeys',
    'rzModule',
    'rt.debounce',
    'foundation',
    'foundation.dynamicRouting',
    'foundation.dynamicRouting.animations'
  ])
  .controller('MessageCtrl',
    ["$scope", "$state", "$http", "$filter", "hotkeys", "debounce", function($scope, $state, $http, $filter, hotkeys, debounce){
      $scope.$on('$viewContentLoaded', function(event) {
        blast_off_messages($scope, $state, $http, $filter, hotkeys, debounce);
      });
  }])
  .controller('ExcelCtrl',
    ["$scope", "$state", "$http", "$filter", "hotkeys", "debounce", function($scope, $state, $http, $filter, hotkeys, debounce){
      $scope.$on('$viewContentLoaded', function(event) {
        $scope.view_type = "master";
        blast_off_messages($scope, $state, $http, $filter, hotkeys, debounce);
      });
  }])
  .config(config)
  .run(run)
;

  config.$inject = ['$urlRouterProvider', '$locationProvider'];


  function blast_off_messages($scope, $state, $http, $filter, hotkeys, debounce){
    setup_scope_variables($scope);
    setup_watches($scope);
    setup_hotkeys($scope, hotkeys);
    setup_date_range_picker($scope);
    setup_advanced_search($scope);
    setup_single_page($scope, debounce);
    setup_keyboard_navigation($scope);
    setup_utility_functions($scope);
    setup_excel($scope);
    setup_filter_utilities($scope, debounce, $filter);

    setup_view($scope, $state);
    
    $scope.setIndex = function(new_list){
      console.log('$scope.setIndex = function(new_list){');
      for (var i = new_list.length - 1; i >= 0; i--) {
        new_list[i]["navIndex"] = i;
      }
      $scope.items = new_list;
    }
    
    $scope.resetLink = function(){
      console.log('$scope.resetLink = function(){');
      $scope.reset_filter();
      $scope.setQuery = $scope.query;
    }

    $scope.setup_new_item_list = function(newItems){
      $scope.setIndex(newItems);
      $scope.focusIndex = 0;
      $scope.update_single_item($scope.focusIndex);
    }

    
   

    $scope.view_all_activity = function(){
      console.log('$scope.view_all_activity = function(){');
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



    
    
  }

  function setup_excel($scope){
    $scope.processColumnDateFilter = function(){
      if($scope.columnDateFilter !== ""){
        console.log("Running columnDateFilter: ", $scope.columnDateFilter);
        var startDate = $scope.columnDateFilter[0];
        var endDate = $scope.columnDateFilter[1];
        var dateField = $scope.columnDateFilter[2];
        var range = moment.range(startDate, endDate);
        var newItems = []
        for (var i = $scope.items.length - 1; i >= 0; i--) {
          if( range.contains(moment($scope.items[i][dateField], 'MM/DD/YYYY')) ){
            newItems.push($scope.items[i]);
          }
        }
        $scope.setup_new_item_list(newItems);
      } else {
        $scope.columnDateFilter = "";
      }
    }
    $scope.close_detail = function() {
      $scope.view_type = "master";
    }
    
    $scope.unixdate = function(date_string) {
      if (date_string.match(/:/)) {
        return moment(date_string,'MM/DD/YYYY hh:mm AA').unix()
      } else {
        return moment(date_string,'MM/DD/YYYY').unix()
      }
    }
    $scope.relativeTime = function(date_string) {
      if (date_string.match(/:/)) {
        return moment(date_string,'MM/DD/YYYY hh:mm AA').fromNow()
      } else {
        return moment(date_string,'MM/DD/YYYY').fromNow()
      }
    }
    $scope.activityIcon = function(item) {
      if (item.message_status == 'Request approved' || item.message_status == 'Comment added')
        return 'comment';
      if (item.has_attachment == 'true')
        return 'attachment';
      return false;
    }
    $scope.recentActivityFilter = function() {
      $scope.reset_filter();
      $scope.columnDateFilter = [
        moment('2016-01-16'),
        moment('2016-02-16'),
        'comment_3_date'
      ];
      $scope.active_filter = 'recent';
      //$("#thActivity").stupidsort("desc");
      $scope.processColumnDateFilter();
    }
  }

  function setup_filter_utilities($scope, debounce, $filter){
    $scope.process_filter_update = debounce(300, function () {
      $scope.processFilter();
      $scope.processDateFilter();
      $scope.processAmountFilter();
      $scope.processColumnDateFilter();
    });
    $scope.filter_by = function(param){
      $scope.columnDateFilter = "";
      $scope.query.inbox_status = param;
      $scope.active_filter = param;
      $scope.setQuery = $scope.query;
    }
    $scope.processFilter = function(){
      console.log("$scope.query: ", $scope.query);
      var new_list = $filter('filter')($scope.itemsDisplayed, $scope.query);
      $scope.focusIndex = 0;
      $scope.setIndex(new_list);
      console.log('In feed: ', $scope.items.length);
    }
    $scope.reset_filter = function(){
      console.log('$scope.reset_filter = function(){');
      $scope.resetAmountSlider();
      $scope.dateFilter = "";
      $scope.columnDateFilter = "";
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
        has_attachment: "",
        amount: "",
        org_code: "",
        inbox_status: ""
      };
      $scope.process_filter_update();
    }
  }

  function setup_view($scope, $state){
    if($state.params && $state.params.id != undefined){
       $scope.update_single_item(search($state.params.id, mock_data));
    }
    if($scope['single'] == undefined){
       $scope.update_single_item(mock_data[0]);
    }
        /* Onload */
    window.setTimeout(function(){
      console.log('window.setTimeout(function(){');
      $scope.advanced_search();

      $scope.refreshSlider();

      $('.activity-item').first().addClass("visible single");
      excel_table_tweaks();

      $('input.date-picker').on('apply.daterangepicker', function(ev, picker) {
        console.log('$(\'input.date-picker\').on(\'apply.daterangepicker\', function(ev, picker) {');
          $scope.format_date_range(picker.startDate, picker.endDate);
          $(this).val($scope.dateFilter);
          $scope.$apply();
      });

      $('input.date-picker').on('cancel.daterangepicker', function(ev, picker) {
        console.log('$(\'input.date-picker\').on(\'cancel.daterangepicker\', function(ev, picker) {');
          $scope.dateFilter = "";
          $(this).val('');
          $scope.$apply();
      });
    }, 300);
  }

  function setup_utility_functions($scope){
    $scope.issetQuery = function(){
      console.log('$scope.issetQuery = function(){');
      if(true){
      }
    }
    
    $scope.isEmptyObject = function(obj) {
      // console.log('$scope.isEmptyObject = function(obj) {');
      return angular.equals("", obj);
    }
  }

  function setup_keyboard_navigation($scope){
    $scope.open = function ( index ) {
      var items;
      for ( var i = 0; i < $scope.itemsDisplayed.length; i++ ) {
        if ( $scope.itemsDisplayed[ i ].navIndex !== index ) { continue; }
        items = $scope.itemsDisplayed[ i ];
      }
      console.log('opening : ', items );
    };
    $scope.correctScroll = function () {
      $scope.items[$scope.focusIndex];
      console.log('focus: ', $scope.focusIndex);
    }
    console.log('// $scope.focusIndexSelect = function() { $scope.open( $scope.focusIndex ); }});');
    $scope.focusIndexDown = function() {
      console.log('$scope.focusIndexDown = function() {');
      if($scope.items.length >= $scope.focusIndex && $scope.focusIndex > 0){
        $scope.focusIndex--;
        $scope.correctScroll();
      }
    };
    $scope.focusIndexUp = function() {
      console.log('$scope.focusIndexUp = function() {');
      if($scope.items.length > $scope.focusIndex+1 && $scope.focusIndex >= 0){
        $scope.focusIndex++;
        $scope.correctScroll();
      }
    };
  }

  function setup_single_page($scope, debounce){
    $scope.trigger_single_change = debounce(300, function () {
      console.log('$scope.single: ', $scope.single);
    });
    $scope.update_single_item = function(newValue){
      $scope.singleHasChanged = false;
      $scope.single = $scope.items[newValue];
    }
    $scope.update_detail = function(selectedIndex){
      console.log('$scope.update_detail = function(selectedIndex){');
      $scope.view_type = "detail";
      $scope.focusIndex = selectedIndex;
    }
    $scope.add_new_vendor = function(){
      console.log('$scope.add_new_vendor = function(){');
      $('.new-vendor').before(new_vendor);
    }
    $scope.add_new_subscriber = function(){
      console.log('$scope.add_new_subscriber = function(){');
      $('.new-subscriber').before(new_subcribe);
    }
  }

  function setup_advanced_search($scope){

    $scope.processAmountFilter = function(){
      if($scope.slider.min != min_purchase_amount || $scope.slider.max != max_purchase_amount){
        console.log('Running: $scope.processAmountFilter');
        var min = $scope.slider.min;
        var max = $scope.slider.max;
        // console.log(' -', min);
        // console.log(' -', max);
        var newItems = []
        // console.log('$scope.items: ', $scope.items.length);
        for (var i = $scope.items.length - 1; i >= 0; i--) {
          var amount = $scope.items[i]["amount"];
          // console.log('amount: ', amount);
          // console.log('$scope.items[i]: ', $scope.items[i]);
          if( amount >= min && amount <= max ){
            newItems.push($scope.items[i]);
          }
        }
        console.log('newItems: ', newItems.length);
        $scope.setup_new_item_list(newItems);
      }
    }
    $scope.processFilterButton = function(){
      console.log('$scope.processFilterButton = function(){');
      $scope.show_advanced_search = false;
      $scope.setQuery = $scope.query;
      $scope.process_filter_update();
    }
    $scope.remove_filter_key = function(key){
      console.log('$scope.remove_filter_key = function(key){');
      $scope.query[key] = "";
    }
    $scope.remove_filter_query = function(){
      console.log('$scope.remove_filter_query = function(){');
      $scope.query.$ = "";
    }
    $scope.remove_date_filter = function(){
      console.log('$scope.remove_date_filter = function(){');
      $scope.dateFilter = "";
    }
    $scope.remove_amount_filter = function(){
      console.log('$scope.remove_amount_filter = function(){');
      $scope.resetAmountSlider();
      $scope.amountFilter = "";
    }
    $scope.toggle_advanced_search = function(){
      console.log('$scope.toggle_advanced_search = function(){');
      $scope.setQuery = $scope.query;
      $scope.refreshSlider();
      $scope.show_advanced_search ? $scope.show_advanced_search = false : $scope.show_advanced_search = true;
      if($scope.show_advanced_search == true){
        window.setTimeout(function(){
          console.log('window.setTimeout(function(){');
          $('.advanced-search input').first().focus();
        }, 100);
      }
    }
  }

  function setup_date_range_picker($scope){
    $scope.processDateFilter = function(){
      if(!angular.equals("", $scope.dateFilter)){
        var startDate = moment($scope.dateFilter.split(' - ')[0], 'MM/DD/YYYY');
        var endDate = moment($scope.dateFilter.split(' - ')[1], 'MM/DD/YYYY');
        var range = moment.range(startDate, endDate);
        var newItems = []
        for (var i = $scope.items.length - 1; i >= 0; i--) {
          if( range.contains(moment($scope.items[i]["date"], 'MM/DD/YYYY')) ){
            newItems.push($scope.items[i]);
          }
        }
        $scope.setup_new_item_list(newItems);
      } else {
        $scope.dateFilter = "";
      }
    }
    $scope.format_amount_range = function(start, end){
      console.log('$scope.slider: ', $scope.slider.max);
      console.log('$scope.slider: ', $scope.slider.min);
      if($scope.slider.min == min_purchase_amount && $scope.slider.max == max_purchase_amount){
        var amount_range = "";
      } else {
        var amount_range = '$' + $scope.slider.min + ' - $' + $scope.slider.max;
      }
      $scope.amountFilter = amount_range;
      console.log('$scope.amountFilter: ', $scope.amountFilter);
    }
    $scope.refreshSlider = function () {
      window.setTimeout(function(){
        console.log('window.setTimeout(function(){');
        $scope.$broadcast('rzSliderForceRender');
      });
    };
    $scope.format_date_range = function(start, end){
      console.log('$scope.format_date_range = function(' + start+ ', ' + end + '){');
      var date_range = start.format('MM/DD/YYYY') + ' - ' + end.format('MM/DD/YYYY');
      $scope.dateFilter = date_range;
      console.log('$scope.dateFilter from format_date_range: ', $scope.dateFilter);
      return date_range;
    }
    $scope.resetAmountSlider = function(){
      $scope.amountFilter = "";
      $scope.slider.min = 0;
      $scope.slider.max = 3500;
    }
    $scope.advanced_search = function(){
      console.log('$scope.advanced_search = function(){');
      $('.date-picker').daterangepicker({
          "ranges": {
              "Today": [
                  moment("2016-02-17"),
                  moment("2016-02-17")
              ],
              "Yesterday": [
                  moment("2016-02-16"),
                  moment("2016-02-16")
              ],
              "Last 7 Days": [
                  moment("2016-02-11"),
                  moment("2016-02-17")
              ],
              "Last 30 Days": [
                  moment("2016-01-19"),
                  moment("2016-02-17")
              ],
              "This Month": [
                  moment("2016-02-01"),
                  moment("2016-03-01")
              ],
              "Last Month": [
                  moment("2016-01-01"),
                  moment("2016-02-01")
              ]
          },
          "linkedCalendars": true,
          "autoUpdateInput": false,
          "opens": "left",
          "drops": "down",
          "buttonClasses": "button small",
          "applyClass": "button success",
          "cancelClass": "button alert"
      }, function(start, end, label) {
        console.log('}, function(start, end, label) {');
        $scope.format_date_range(start, end);
        $scope.processDateFilter();
        console.log('New date range selected: ' + $scope.dateFilter + ' (predefined range: ' + label + ')');
      });
    }
  }

  function setup_scope_variables($scope){
    $scope.keys = [];
    $scope.filter = "";
    $scope.active_filter = "";
    $scope.setQuery = {};
    $scope.dateFilter = "";
    $scope.columnDateFilter = "";
    $scope.amountFilter = "";
    $scope.slider = {
      min: 0,
      max: 3500,
      options: {
        floor: 0,
        ceil: 3500,
        translate: function(value) {
          // console.log('translate: function(value) {');
          return '$' + value;
        }
      }
    };
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
  }

  function setup_hotkeys($scope, hotkeys){
    hotkeys.add({
      combo: 'ctrl+e',
      description: 'Reset search parameters.',
      callback: function() {
        console.log('callback: function() {');
        $scope.resetLink();
      }
    });
    hotkeys.add({
      combo: 'ctrl+s',
      description: 'Select the search field',
      callback: function() {
        console.log('callback: function() {');
        $('.search-field-input').focus();
        return false;
      }
    });
    hotkeys.add({
      combo: 'ctrl+d',
      description: 'Toggle the advanced search box',
      allowIn: ['INPUT'],
      callback: function() {
        console.log('callback: function() {');
        $scope.toggle_advanced_search();
      }
    });
    hotkeys.add({
      combo: 'up',
      description: 'Select the inbox item above',
      callback: function() {
        console.log('callback: function() {');
        $scope.focusIndexDown();
      }
    });
    hotkeys.add({
      combo: 'down',
      description: 'Select the inbox item below',
      callback: function() {
        console.log('callback: function() {');
        $scope.focusIndexUp();
      }
    });
  }

  function setup_watches($scope){
    $scope.$watch('single', function(newValue, oldValue) {
      console.log('Single has changed');
      $scope.trigger_single_change();
    }, true);
    $scope.$watch('query', function(newValue, oldValue) {
      console.log('$scope.$watch(\'query\', function(newValue, oldValue) {');
      console.log('Running');
      $scope.process_filter_update();
    }, true);
    $scope.$watch('amountFilter', function(newValue, oldValue) {
      console.log(newValue);
      $scope.process_filter_update();
    }, true);
    $scope.$watch('slider', function(newValue, oldValue) {
      // console.log('$scope.slider.min: ', $scope.slider.min);
      // console.log('$scope.slider.max: ', $scope.slider.max);
      $scope.process_filter_update();
      $scope.format_amount_range();
    }, true);
    $scope.$watch('view_type', function(newValue, oldValue) {
      console.log('##################################################');
      console.log('$scope.view_type: ', $scope.view_type);
      console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%');
    });
    $scope.$watch('query', function(newValue, oldValue) {
      console.log('Running');
      $scope.processFilter();
    }, true);
    $scope.$watch('focusIndex', function(newValue, oldValue) {
      console.log('focusIndex: ', newValue);
      $scope.update_single_item(newValue);
      return newValue;
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

  function load_active_message(el){

  }

  function setup_list(){
    var userList = new List('messages', options, data);
    userList.filter(function(item) {
      console.log('userList.filter(function(item) {');
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
      console.log('userList.filter(function(item) {');
       if (item.values().inbox_status != "Needs Attention" &&
                              item.values().inbox_status != "Pending" &&
                              item.values().inbox_status != "New") {
           return true;
       } else {
           return false;
       }
    });
  }

  function search(nameKey, arr){
    for (var i = 0; i < arr.length; i++) {
      if(arr[i]["id"] == nameKey){
        return arr[i];
      }
    }
  }

  function excel_table_tweaks() {
    // Table tweaks for the excel view
    var table = $("#xc-inbox-table").stupidtable();
    table.on("aftertablesort", function (event, data) {
      var th = $(this).find("th");
      th.find(".arrow").remove();
      var dir = $.fn.stupidtable.dir;
      var arrow = data.direction === dir.ASC ? "&#x25b2;" : "&#x25bc;";
      th.eq(data.column)
        .append('<div class="arrow">' + arrow +'</span>');
    });
  }

})();

var vm = {};
var circleX = '<svg xmlns="http://www.w3.org/2000/svg" class="iconic iconic-circle-x injected-svg iconic-color-secondary ng-isolate-scope iconic-sm ng-scope" width="128" height="128" viewBox="0 0 128 128" data-src="assets/img/iconic/circle-x.svg" size="small"><g class="iconic-metadata"><title>Circle X</title></g><defs><clipPath id="iconic-size-lg-circle-x-clip-0-17"><path d="M0 0v128h128v-128h-128zm90.657 85l-5.657 5.657-21-21-21 21-5.657-5.657 21-21-21-21 5.657-5.657 21 21 21-21 5.657 5.657-21 21 21 21z"></path></clipPath><clipPath id="iconic-size-md-circle-x-clip-0-17"><path d="M0 0v32h32v-32h-32zm23.121 21l-2.121 2.121-5-5-5 5-2.121-2.121 5-5-5-5 2.121-2.121 5 5 5-5 2.121 2.121-5 5 5 5z"></path></clipPath><clipPath id="iconic-size-sm-circle-x-clip-0-17"><path d="M0 0v16h16v-16h-16zm11.414 10l-1.414 1.414-2-2-2 2-1.414-1.414 2-2-2-2 1.414-1.414 2 2 2-2 1.414 1.414-2 2 2 2z"></path></clipPath></defs><g class="iconic-circle-x-lg iconic-container iconic-lg" data-width="128" data-height="128" display="inline"><circle cx="64" cy="64" r="64" clip-path="url(#iconic-size-lg-circle-x-clip-0-17)" class="iconic-circle-x-body iconic-property-fill"></circle></g><g class="iconic-circle-x-md iconic-container iconic-md" data-width="32" data-height="32" display="none" transform="scale(4)"><circle cx="16" cy="16" r="16" clip-path="url(#iconic-size-md-circle-x-clip-0-17)" class="iconic-circle-x-body iconic-property-fill"></circle></g><g class="iconic-circle-x-sm iconic-container iconic-sm" data-width="16" data-height="16" display="none" transform="scale(8)"><circle cx="8" cy="8" r="8" clip-path="url(#iconic-size-sm-circle-x-clip-0-17)" class="iconic-circle-x-body iconic-property-fill"></circle></g></svg>';
var new_vendor = '<div class="small-12 grid-block vertical"><div class="grid-block"><div class="grid-content small-5 vendor-field"><label>Vendor<input type="text"></label></div><div class="grid-content small-6 vendor-field"><label>Link<input type="text"></label></div><div class="grid-content small-1 vendor-field vendor-delete"><a href="" class="align-right">'+circleX+'</a></div></div>';
var new_subcribe = '<div class="grid-block" style="padding-bottom:0px;"><div class="grid-content small-10 subscribe-field"><label><input type="email" placeholder="name@domain.com"></label></div><div class="grid-content small-2 subscribe-field subscribe-delete"><a href="" class="align-right">'+ circleX +'</a></div></div>';
var mock_data = data;
var loaded = false;
var loaded_active = false;
var max_purchase_amount = 3500;
var min_purchase_amount = 0;
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
                      'has_attachment',
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
