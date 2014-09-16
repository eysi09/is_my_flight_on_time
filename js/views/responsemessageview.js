
var ResponseMessageView = Backbone.View.extend({

  events: {

  },

  on_time_msgs:   ['Aww yess.'],
  late_msgs:      ['Dagnabbit!'],
  early_msgs:     ['Watch out!'],
  cancelled_msgs: ['Ahh hell nahh!'],

  strings: {
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
    response_msgs: {
      on_time:    ['Aww yess.'],
      late:       ['Dagnabbit!'],
      early:      ['Watch out!'],
      cancelled:  ['Ahh hell nahh!']
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
      on_time:  '',
      early:    'early.',
      late:     'late.'
    }
  },

  initialize: function() {
    _.bindAll(this,
      'render',
      'getContext',
      'reset')
    this.success_msg_template   = _.template($('#sucess_msg_template').html());
    this.alert_type_1_template  = _.template($('#alert_type_1').html());
    this.alert_type_2_template  = _.template($('#alert_type_2').html());
    this.flight;
    this.mode = 'default';
  },

  render: function() {
    switch (this.mode) {
      case 'default':
        this.$el.html('');
        break;
      case 'success':
        var context = this.getContext();
        this.$el.html(this.success_msg_template(context));
        break;
      case 'alert_type_1':
        this.$el.html(this.alert_type_1_template());
        break;
      case 'alert_type_2':
        this.$el.html(this.alert_type_2_template());
        break;
    }
  },

  getContext: function(flight) {
    var flight = this.flight;
    var searchMode = this.buttonView.searchMode;
    var scheduled = moment(flight.from + flight.date, ('HH:mmDD. MMM'));
    var estimate = moment(flight.plannedArrival + flight.date, ('HH:mmDD. MMM'));

    // Messy time calculations and string manipulations
    var diff = estimate.diff(scheduled);
    var d = moment.duration(Math.abs(diff));
    var nHours = Math.floor(d.asHours());
    nHours = parseInt(nHours) > 0 ? nHours : '';
    var strHours = nHours ? 'hours' : '';
    var nMin = moment.utc(Math.abs(diff)).format("m");
    nMin = parseInt(nMin) > 0 ? nMin : '';
    var strMin = nMin ? 'minutes' : '';
    var status = diff > 0 ? 'late' : 'early';
    status = diff === 0 ? 'on_time' : status;
    nMin = diff === 0 ? 'on time.' : nMin;

    // This is what counts:
    return {
      reaction:       this.strings.response_msgs[status][0],
      direction:      this.strings.direction[searchMode],
      airport:        flight.to,
      nHours:         nHours,
      strHours:       strHours,
      nMin:           nMin,
      strMin:         strMin,
      status1:        this.strings.status1[status],
      status2:        this.strings.status2[status],
      flightNumber:   flight.flightNumber,
      airline:        flight.airline,
      scheduled:      flight.from,
      estimate:       flight.plannedArrival,
      flightStatus:   flight.realArrival,
      date:           flight.date,
      action:         this.strings.action[searchMode]
    };
  },

  reset: function() {
    this.mode = 'default';
    this.render();
  }

})