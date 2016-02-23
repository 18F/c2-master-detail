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
        if ($state.params.request_index !== "") {
          $scope.update_detail(parseInt($state.params.request_index));
        }
      });
  }])
  .filter('capitalize', function() {
    return function(token) {
        if(token != undefined){
          return token.charAt(0).toUpperCase() + token.slice(1);
        }
     }
  })
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
    setup_single_page($scope, $state, debounce);
    setup_keyboard_navigation($scope);
    setup_utility_functions($scope);
    setup_excel($scope, $state);
    setup_filter_utilities($scope, debounce, $filter);

    setup_view($scope, $state);
    window.current_scope = $scope;
  }

  function setup_excel($scope, $state){
    $scope.resettohome = function(){

    }
    $scope.getRecentActivityDateTime = function(item) {
      var date = $scope.items[i].comments.slice(-1)[0].date;
      var time = $scope.items[i].comments.slice(-1)[0].time;
      return date + " " + time;
    }
    $scope.processRecentActivityFilter = function(){
    }
    $scope.close_detail = function() {
      $scope.view_type = "master";
      $state.go($state.current, {request_index: ""},{notify:false,reload:$state.current});
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
      if ($scope.has_comments(item.comments))
        return 'comment';
      if ($scope.has_attachment(item.comments))
        return 'attachment';
      return false;
    }
    $scope.enableRecentActivityFilter = function() {
      if($scope.active_filter != "recent"){
        $scope.resetLink();
        $scope.recentActivityFilter = "";
        $scope.query.inbox_status = '';
        $scope.setQuery = $scope.query;
        $scope.active_filter = 'recent';
        $scope.dateFilter = '01/16/2016 - 02/16/2016';
      }
    }
  }

  function setup_filter_utilities($scope, debounce, $filter){
    $scope.process_filter_update = function () {
      $scope.processFilter();
      console.log('$scope.processFilter();');

      $scope.processDateFilter();
      console.log('$scope.processDateFilter();');

      $scope.processAmountFilter();
      console.log('$scope.processAmountFilter();');

      window.setTimeout(function(){ 
        $('#view-master .submitted-filter').stupidsort('desc');
      }, 30);
    };
    $scope.filter_by = function(param){
      $scope.resetLink();
      $scope.recentActivityFilter = "";
      $scope.query.inbox_status = param;
      $scope.active_filter = param;
    }
    $scope.processFilter = function(){
      console.log("$scope.query: ", $scope.query);
      var new_list = $filter('filter')($scope.itemsDisplayed, $scope.query);
      $scope.setIndex(new_list);
      console.log('In feed: ', $scope.items.length);
    }
    $scope.reset_filter = function(){
      console.log('$scope.reset_filter = function(){');
      $scope.resetAmountSlider();
      $scope.dateFilter = "";
      $scope.recentActivityFilter = "";
      $scope.query = {
        $: "",
        id: "",
        product_company: "",
        product_type: "",
        product_name: "",
        person_name: "",
        date: "",
        description: "",
        "function_code": "",
        "object_field": "",
        "cl_number": "",
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

    $scope.has_attachment = function(comments){
      var has_attachment = false;
      for (var i = comments.length - 1; i >= 0; i--) {
        if(comments[i].action == "File Uploaded"){
          has_attachment = true;
        }
      }
      return has_attachment;
    }

    $scope.has_comments = function(comments){
      var has_comment = false;
      for (var i = comments.length - 1; i >= 0; i--) {
        if(comments[i].action == "Comment Added"){
          has_comment = true;
        }
      }
      return has_comment;
    }

    $scope.findOne = function (haystack, arr) {
        return arr.some(function (v) {
            return haystack.indexOf(v) >= 0;
        });
    }

    $scope.check_object_differences = function(obj1, obj2){
      // console.log('obj1: ', obj1);
      // console.log('obj2: ', obj2);
      var log = [];
      angular.forEach(obj1, function(value1, key1) {
        // console.log(value1 + ' ' + key1);
        angular.forEach(obj2, function(value2, key2) {
          // console.log(value2 + ' ' + key2);
          if(key1 == key2){
            if(value1 != value2){
              console.log('different: ', key2);
              log.push(key2);
            }
          }
        }, log);
      }, log);
      return log;
    }

    $scope.setup_new_item_list = function(newItems){
      console.log("setup_new_item_list");
      $scope.setIndex(newItems);
      $scope.focusIndex = 0;
      $scope.update_single_item($scope.focusIndex);
    }

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

  function setup_single_page($scope, $state, debounce){

    $scope.remove_subscriber = function(subscriber_email){
      var index = $scope.single.subscribers.indexOf(subscriber_email);
      $scope.single.subscribers.splice(index, 1);
      $scope.save_changes();
    }

    $scope.delete_single = function(){
      $scope.items.splice($scope.focusIndex, 1);
      $scope.setIndex($scope.items);
      $scope.setup_single_clone();
      $scope.$apply();
    }

    $scope.approve_single = function(){
      $scope.single.inbox_status = "Approved";
      $scope.items[$scope.focusIndex] = $scope.single;
      $scope.setIndex($scope.items);
      $scope.trigger_single_change();
      $scope.setup_single_clone();
    }

    $scope.unreconcile_request = function(){
      $scope.single.inbox_status = "Approved";
      $scope.items[$scope.focusIndex] = $scope.single;
      $scope.setIndex($scope.items);
      $scope.trigger_single_change();
      $scope.setup_single_clone();
    }

    $scope.reconcile_single = function(){
      $scope.single.inbox_status = "Completed";
      $scope.items[$scope.focusIndex] = $scope.single;
      $scope.setIndex($scope.items);
      $scope.trigger_single_change();
      $scope.setup_single_clone();
    }

    $scope.send_comment = function(){
      $scope.single.comments.push({
        "name": "You",
        "date": moment().format("MM//DD/YYYY"),
        "time": moment().format('h:mm a'),
        "message": $scope.single.comment,
        "action": "Comment Added"
      });
      $scope.single.comment = "";
    }

    $scope.save_changes = function(){
      $scope.items[$scope.focusIndex] = $scope.single;
      $scope.setIndex($scope.items);
      $scope.trigger_single_change();
      $scope.setup_single_clone();
    }

    $scope.view_all_activity = function(){
      if($scope.single.activity == false){
        $scope.single.activity = true;
        for (var i = $scope.single.comments.length - 1; i >= 0; i--) {
          $scope.single.comments[i]['visible'] = true;
        }
      } else {
        $scope.single.activity = false;
        for (var i = $scope.single.comments.length - 1; i >= 0; i--) {
          $scope.single.comments[i]['visible'] = false;
        }
      }
    }

    $scope.setup_single_clone = function(){
      console.log('Clone wars in progress');
      console.log('Target identified: ', $scope.items[$scope.focusIndex]);
      console.log('Before copy Single: ', $scope.single);
      $scope.single = angular.copy($scope.items[$scope.focusIndex]);
      console.log('Copy complete.');
      console.log('New single: ', $scope.single);
      $scope.single.activity = false;
      for (var i = $scope.single.comments.length - 1; i >= 0; i--) {
        if(i == 0 ){
          $scope.single.comments[i]['visible'] = true;
          $scope.single.comments[i]['first']   = true;
        } else {
          $scope.single.comments[i]['visible'] = false;
          $scope.single.comments[i]['first']   = false;
        }
      }
      $(".large-correct").animate({
        scrollTop:0
      }, 150);
    }

    $scope.submit_comment = function(){
      console.log('fire comment submit');
    }

    $scope.setIndex = function(new_list){
      console.log('$scope.setIndex = function(new_list){');
      for (var i = new_list.length - 1; i >= 0; i--) {
        new_list[i]["navIndex"] = i;
      }
      $scope.items = new_list;

      $scope.setup_single_clone();
      window.setTimeout(function(){ $scope.$apply(); }, 1);
    }

    $scope.trigger_response_to_changed_fields = function(){
      console.log('trigger_response_to_changed_fields');
    }

    $scope.check_has_changed = function(param){
      var diff = $scope.singleChanges.diff;
      var detail = $scope.singleChanges.detail;
      if( $scope.singleChanges.diff.length > 0){
        for (var i = diff.length - 1; i >= 0; i--) {
          console.log(diff[i] + ': ' + detail[diff[i]]);
        }
      }
      return true;
    }

    $scope.trigger_single_change = function () {
      // console.log('$scope.single: ', $scope.single);
      // console.log('$scope.items[$scope.focusIndex]: ', $scope.items[$scope.focusIndex]);
      var obj1 = $scope.items[$scope.focusIndex];
      var obj2 = $scope.single;
      $scope.singleChanges.diff = $scope.check_object_differences(obj1, obj2);
      $scope.singleChanges.detail = objectDiff.diff(obj1, obj2);
      console.log('$scope.singleChanges: ', $scope.singleChanges);
    };

    $scope.update_single_item = function(newValue){
      $scope.singleChanges = {
        diff: [],
        detail: {}
      };
    }

    $scope.view_request_index = function(request_index) {
      $scope.update_detail(request_index);
      $state.go($state.current, {request_index: request_index},{notify:false,reload:$state.current});
    }
    $scope.view_previous_request = function() {
      if($scope.items.length >= $scope.focusIndex && $scope.focusIndex > 0){
        $scope.view_request_index($scope.focusIndex - 1);
        $scope.correctScroll();
      }
    };
    $scope.view_next_request = function() {
      if($scope.items.length > $scope.focusIndex+1 && $scope.focusIndex >= 0){
        $scope.view_request_index($scope.focusIndex + 1);
        $scope.correctScroll();
      }
    };

    $scope.update_detail = function(selectedIndex){
      $scope.view_type = "detail";
      console.log('$scope.update_detail = function(selectedIndex){');
      $scope.focusIndex = selectedIndex;
    }
    $scope.add_new_vendor = function(){
      console.log('$scope.add_new_vendor = function(){');
      $('.new-vendor').before(new_vendor);
    }
    $scope.add_new_subscriber = function(){
      $scope.single.subscribers.push();
      console.log('$scope.add_new_subscriber = function(){');
      $('.new-subscriber').before(new_subcribe);
    }
  }

  function setup_advanced_search($scope){
    $scope.resetLink = function(){
      console.log('$scope.resetLink = function(){');
      $scope.reset_filter();
      $scope.setQuery = $scope.query;
    }
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
      $scope.process_filter_update();
    }
    $scope.remove_filter_key = function(key){
      console.log('$scope.remove_filter_key = function(key){');
      $scope.query[key] = "";
      $scope.process_filter_update();
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
      }, 10);
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
        $scope.process_filter_update();
        console.log('New date range selected: ' + $scope.dateFilter + ' (predefined range: ' + label + ')');
      });
    }
  }

  function setup_scope_variables($scope){
    $scope.singleChanges = {
      diff: [],
      detail: {}
    };
    $scope.keys = [];
    $scope.filter = "";
    $scope.active_filter = "";
    $scope.setQuery = {};
    $scope.dateFilter = "";
    $scope.recentActivityFilter = "";
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
      "function_code": "",
      "object_field": "",
      "cl_number": "",
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
    $scope.$watch('query.has_attachment', function(newValue, oldValue) {
      console.log('---------------------');
      console.log('---query.has_attachment-----');
      console.log('Single view has changed');
      if($scope.query.has_attachment == false){
        $scope.query.has_attachment = "";
      }
    }, true);
    $scope.$watch('singleChanges', function(newValue, oldValue) {
      console.log('---------------------');
      console.log('---singleChanges-----');
      console.log('Single view has changed');
      $scope.trigger_response_to_changed_fields();
    }, true);
    $scope.$watch('single', function(newValue, oldValue) {
      console.log('---------------------');
      console.log('---single-----');
      console.log('Single has changed');
      $scope.trigger_single_change();
    }, true);
    $scope.$watch('amountFilter', function(newValue, oldValue) {
      console.log('---------------------');
      console.log('---amountFilter-----');
      console.log(newValue);
      $scope.process_filter_update();
    }, true);
    $scope.$watch('slider', function(newValue, oldValue) {
      console.log('---------------------');
      console.log('---slider-----');
      // console.log('$scope.slider.min: ', $scope.slider.min);
      // console.log('$scope.slider.max: ', $scope.slider.max);
      $scope.process_filter_update();
      $scope.format_amount_range();
    }, true);
    $scope.$watch('view_type', function(newValue, oldValue) {
      console.log('---------------------');
      console.log('---view_type-----');
      console.log('$scope.view_type: ', $scope.view_type);
    });
    $scope.$watch('query', function(newValue, oldValue) {
      console.log('---------------------');
      console.log('---query-----');
      console.log('Running');
      $scope.process_filter_update();
    }, true);
    $scope.$watch('focusIndex', function(newValue, oldValue) {
      console.log('---------------------');
      console.log('---focusIndex-----');
      console.log('focusIndex: ', newValue);
      $scope.update_single_item(newValue);
      $scope.setup_single_clone();
      console.log('$scope.single:', $scope.single);
      console.log("$scope.items[$scope.focusIndex]: ", $scope.items[$scope.focusIndex]);
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
                      "function_code",
                      "object_field",
                      "cl_number",
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
