$(document).ready(function() {

  // Full screen first section
  $('#search-section').css('height', $(window).height());
  $(window).on('resize', function() {
    $('#search-section').css('height', $(window).height());
  });

  /* Parallax stuff */
  // cache the window object
   $window = $(window);

   $('section[data-type="background"]').each(function(){
     // declare the variable to affect the defined data-type
     var $scroll = $(this);

      $(window).scroll(function() {
        // HTML5 proves useful for helping with creating JS functions!
        // also, negative value because we're scrolling upwards
        var yPos = -($window.scrollTop() / $scroll.data('speed'));

        // background position
        var coords = '50% '+ yPos + 'px';

        // move the background
        $scroll.css({ backgroundPosition: coords });
      }); // end window scroll
   });  // end section function

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
    responseMessageView.buttonView    = buttonView;

    if (_.isEmpty(response_data.departures) || _.isEmpty(response_data.arrivals)) {
       responseMessageView.mode = 'alert_type_1';
       responseMessageView.render();
    } else {
      searchBarView.load(response_data);
    }
  });

});