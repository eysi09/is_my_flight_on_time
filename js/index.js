$(document).ready(function() {

  // Full screen first section and position second.
  var height = $(window).height();
  $('#search-section').css('height', height);

  $('.btn-view-all').click(function() {
    $('#all-flights-section')[0].scrollIntoView(true);
  });

  var url = 'http://apis.is/flight';

  var arrivalParams = {
    'language': 'en',
    'type':     'arrivals',
  };

  var departureParams = {
    'language': 'en',
    'type':     'departures',
  };

  var response_data = {};

  $.when(

    $.get(url, departureParams, function(response) {
      console.log('departures');
      response_data.departures = _.sortBy(response.results, function(r) {return r.to});
    }, 'json'),

    $.get(url, arrivalParams, function(response) {
      console.log('arrivals')
      response_data.arrivals = _.sortBy(response.results, function(r) {return r.to});
    }, 'json')

  ).then(function() {

    var buttonView = new ButtonView({
      el: $('#buttons-wrap')
    });

    var searchBarView = new SearchBarView({
      el: $('#search-bar-wrap')
    });

    var dropdownView = new DropdownView({
      el: $('#flights-list-wrap'),
    });

    var responseMessageView = new ResponseMessageView({
      el: $('#response-msg-wrap')
    });

    buttonView.searchBarView          = searchBarView;
    buttonView.dropdownView           = dropdownView;
    buttonView.responseMessageView    = responseMessageView;
    searchBarView.buttonView          = buttonView;
    searchBarView.dropdownView        = dropdownView;
    searchBarView.responseMessageView = responseMessageView;
    dropdownView.buttonView           = buttonView;
    dropdownView.searchBarView        = searchBarView;
    dropdownView.responseMessageView  = responseMessageView;
    responseMessageView.buttonView    = buttonView;

    if (_.isEmpty(response_data.departures) || _.isEmpty(response_data.arrivals)) {
       responseMessageView.mode = 'alert_type_1';
       responseMessageView.render();
    } else {
      searchBarView.load(response_data);
    }
  });

});