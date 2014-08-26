$(document).ready(function() {
  
  var url = 'http://apis.is/flight';

  var departure_params = {
    'language': 'en',
    'type':     'departures',
  };

  var arrival_params = {
    'language': 'en',
    'type':     'arrivals',
  };

  var on_time_msgs = ['Aww yess.'];
  var late_msgs = ['Dagnabbit!'];
  var early_msgs = ['Watch out!'];
  var cancelled_msgs = ['Ahh hell nahh!'];

  var strings = {
    placeholder: {
      arrivals:   'Enter flight number, airline, airport of origin or time',
      departures: 'Enter flight number, airline, destination airport or time'
    },
    action: {
      arrivals: 'Arrival',
      departures: 'Departure'
    },
    btn_name: {
      arrivals:   'Arrivals',
      departures: 'Departures'
    },
    flightslist: {
      arrivals:   ' - Planned arrival at ',
      departures: ' - Planned departure at '
    },
    response_msgs: {
      on_time:    on_time_msgs,
      late:       late_msgs,
      early:      early_msgs,
      cancelled:  cancelled_msgs
    },
    direction: {
      arrivals:   'from',
      departures: 'to'
    },
    status1: {
      on_time:  '',
      early:    'actually',
      late:     ''
    },
    status2: {
      on_time:  'on time.',
      early:    'minutes early.',
      late:     'minutes late.'
    }
  };

  var departures            = [];
  var arrvials              = [];
  var search_mode           = 'arrivals';
  var last_search           = '';
  var search_string         = '';
  var $input                = $('input');
  var last_selected_flight  = '';
  var flightslist_template    = _.template($('#flightslist_template').html());
  var response_msg_template   = _.template($('#response_msg_template').html());
  var flight_detail_template  = _.template($('#flight_detail_template').html());

  $(function() {
    load();
  });

  $input.focus();

  $('button').click(function(e) {
    toggle_search_mode(e);
  });

  $input.on('input', function(e) {
    activate_dropdown()
  })

  // Keyboard navigation
  $input.keydown(function(e) {
    var next_opt;
    var is_first_opt = false;
    switch(e.which) {
      case 13: // enter
        trigger_query();
        break;
      case 40: // down
        if ( $('.flights').is(':visible') ) {
          if ($('.active').length === 0) { // First option
            next_opt = $('.option:first'); 
            setTimeout(function(){
            manage_options(next_opt);
            },100);
          } else {
            next_opt = $('.active').parent().next().find('.option');
            manage_options(next_opt);
          }
        }
        break;
      case 38: // up
        next_opt = $('.active').parent().prev().find('.option');
        manage_options(next_opt);
        break;
    }
  });

  function load() {
    $.when(

      $.get(url, departure_params, function(response) {
        departures = _.sortBy(response.results, function(r) {return r.to});
      }, 'json'),

      $.get(url, arrival_params, function(response) {
        console.log(response.results)
        arrivals = _.sortBy(response.results, function(r) {return r.to});
      }, 'json')

    ).then(function() {
      if (_.isEmpty(departures) || _.isEmpty(arrivals)) {
        toggle_alert_modes('alert_type_1');
      } else {
        activate_input();
      }
    });
  }

  // NB: The search functionality is a little gimmick-y
  // to conform to the user's expectations. 
  // First click renders the value in the input.
  // Second click get's the data. The data is found from the data id
  // of the active class, not the search string itself.
  // That's why the search returns an error if the search string is changed
  // since the class will stay the same.
  function trigger_query() {
    if ($input.val()) {
      // First enter click
      if ( $('.flights').is(':visible') ) {
        last_selected_flight = $input.val();
        $('.flights').hide();
        // Second enter click
      } else {
        if ($input.val() === last_selected_flight) handle_query();
        else toggle_alert_modes('alert_type_2');
      }
    }
  }

  function activate_dropdown() {
    search_string = $input.val().trim().toLowerCase();
    if (search_string.length > 1) {
      //var val = clean_search_string(search_string);
      var val = search_string;
      var data_set = search_mode === 'arrivals' ? arrivals : departures;
      // TODO: regexp
      var matches = _.filter(data_set, function(d) {
        return (
          d.to.toLowerCase().indexOf(val)           > -1 ||
          d.from.toLowerCase().indexOf(val)         > -1 ||
          d.flightNumber.toLowerCase().indexOf(val) > -1 ||
          d.airline.toLowerCase().indexOf(val)      > -1 ||
          d.date.toLowerCase().indexOf(val)         > -1)
      });
      render_flightslist(matches);
    } else {
      $('.flights').hide();
    }
  }

  function render_flightslist(matches) {
    if (!_.isEmpty(matches)) {
      remove_alert_modes();
      var context = {
        list: matches,
        key:  strings.flightslist[search_mode]
      }
      $('.flightslist').html(flightslist_template(context));
      $('.flights').show();
      bind_option_events()
    } else {
      $('.flights').hide();
    }
  }

  function bind_option_events() {
    $('.option').mouseenter(function(e) {
      $('.option').removeClass('active');
      $(this).addClass('active');
    });
    $('.option').mouseleave(function(e) {
      $(this).removeClass('active');
    });
    $('.option').click(function(e) {
      handle_query();
    })
  }

  function activate_input() {
    $input.prop('disabled', false);
    $input.attr('placeholder', strings.placeholder[search_mode]);
    $input.focus();
  }

  function toggle_search_mode(e) {
    search_mode = $(e.target).data('id');
    $input.attr('placeholder', strings.placeholder[search_mode]);
    $('button').removeClass('btn-primary').addClass('btn-default');
    $(e.target).addClass('btn-primary');
    reset_search();
  }

  function manage_options(opt) {
    $('.option').removeClass('active');
    if (opt.length > 0) {
      opt.focus();
      opt.addClass('active');
    }
    val = opt.text() || search_string;
    $input.val(val);
    $input.focus();
  }

  function reset_search() {
    remove_alert_modes();
    $input.val('');
    $('.flights').hide();
  }

  //TODO: Change to regular expression
  function clean_search_string(str) {
    var f = str.indexOf(' - ');
    var s = str.indexOf(' - ', f+1);
    var t = str.indexOf('at', s) + 2;
    return str.substring(0, f) + str.substring(f + 3, s) + str.substring(t, str.length);
  }

  function handle_query() {
    var id = $('.active').data('id');
    if (id) {
      var data_set = search_mode === 'arrivals' ? arrivals : departures
      var flight = _.findWhere(data_set, {flightNumber: id});
      render_success_msg(get_context(flight));
    } else {
      toggle_alert_modes('alert_type_2');
    }
  }

  function render_success_msg(context) {
    $('.option').removeClass('active');
    $('.form-group').removeClass('has-error');
    $('.flights').hide();
    $('.response-msg').html(response_msg_template(context)).show();
    $('.flight-detail').html(flight_detail_template(context)).show();
  }

  function toggle_alert_modes(alert_type) {
    $('.response-msg').hide();
    $('.flight-detail').hide();
    if (alert_type === 'alert_type_1') {
      $('.alert-type-1').show();
      $input.prop('disabled', true);
    } else {
      $('.form-group').addClass('has-error');
      $('.alert-type-2').show();
    }
  }

  function remove_alert_modes() {
    $('.alert-type-2').hide();
    $('.form-group').removeClass('has-error');
  }

  function get_context(flight) {
    var m_planned = moment(flight.plannedArrival, 'HH:mm');
    if (flight.realArrival) {
      var m_real = moment(parse_arrival_string(flight.realArrival), 'HH:mm');
      var diff = m_real.diff(m_planned);
      var status = diff > 0 ? 'late' : 'early';
      status = diff === 0 ? 'on_time' : status;
      var delay  = moment.utc(Math.abs(diff)).format('HH:mm');
      delay = diff === 0 ? '' : delay;
    } else {
      var status = 'on_time';
      var delay = '';
    }
    return {
      reaction:       strings.response_msgs[status][0],
      direction:      strings.direction[search_mode],
      airport:        flight.to,
      delay:          delay,
      status1:        strings.status1[status],
      status2:        strings.status2[status],
      airline:        flight.airline,
      planned:        flight.plannedArrival,
      real_full:      flight.realArrival || 'N/A',
      flight_number:  flight.flightNumber,
      action:         strings.action[search_mode]
    };
  }

  function parse_arrival_string(str) {
    return str.substring(str.indexOf(' ') + 1, str.length);
  }

});