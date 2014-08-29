var SearchBarView = Backbone.View.extend({

  events: {
    'input input'   : 'activateDropdown',
    'paste input'   : 'activateDropdown',
    'keydown input' : 'handleKeydown'
  },

  strings: {
    placeholder: {
      arrivals:   'Enter flight number, airline, airport of origin or time',
      departures: 'Enter flight number, airline, destination airport or time'
    }
  },

  initialize: function() {
    _.bindAll(this,
      'load',
      'render',
      'activateDropdown',
      'getSearchMatches',
      'handleKeydown',
      'navigateDownList',
      'navigateUpList',
      'manageOptions',
      'triggerQuery',
      'handleQuery',
      'renderResponseMessage')
    this.$input  = this.$el.find('input');
    this.searchString = '';
    this.lastSelectedFlight = '';
    this.dataSet = [];
  },

  load: function(response) {
    this.arrivals = response.arrivals;
    this.departures = response.departures;
    // Default to arrivals
    this.dataSet = this.arrivals;
    this.render();
  },

  render: function() {
    // Activate buttons
    _.each(this.$el.find('button'), function(button) {
      $(button).prop('disabled', false);
    });
    // Activate input
    this.$input.prop('disabled', false);
    this.$input.attr('placeholder', this.strings.placeholder[this.buttonView.searchMode]);
    this.$input.focus();
  },

  activateDropdown: function() {
    if (this.$input.val().length > 1) {
      this.dropdownView.matches = this.getSearchMatches();
      this.dropdownView.render(); 
    } else {
      this.dropdownView.reset();
    }
  },

  getSearchMatches: function() {
    this.searchString = this.$input.val();
    //var val = this.cleanSearchString(this.searchString);
    var val = this.searchString;
    return _.filter(this.dataSet, function(d) {
      return (
        d.to.toLowerCase().indexOf(val)           > -1 ||
        d.from.toLowerCase().indexOf(val)         > -1 ||
        d.flightNumber.toLowerCase().indexOf(val) > -1 ||
        d.airline.toLowerCase().indexOf(val)      > -1 ||
        d.date.toLowerCase().indexOf(val)         > -1)
    });
  },

  handleKeydown: function(event) {
    switch (event.which) {
      case 13: //enter
        this.triggerQuery();
        break;
      case 40: // down
        this.navigateDownList();
        break;
      case 38: // up
        this.navigateUpList();
        break;
    }
  },

  navigateDownList: function() {
    if ( $('.flights-list-table').is(':visible') ) {
      if ($('.active').length === 0) { // First option
        var nextOpt = $('.option:first');
        this.manageOptions(nextOpt);
      } else {
        var nextOpt = $('.active').next();
        this.manageOptions(nextOpt);
      }
    }
  },

  navigateUpList: function() {
    var nextOpt = $('.active').prev();
    this.manageOptions(nextOpt);
    var input_length = this.$input.val().length;
  },

  // If there's no next option the user
  // re-enters the input with the inital value
  manageOptions: function (opt) {
    $('.option').removeClass('active');
    if (opt.length > 0) {
      opt.addClass('active');
      // TODO: Re-think.
      opt[0].scrollIntoView(false);
    }
    var val = opt.find('td').text() || this.searchString;
    this.$input.val(val);
    this.$input.focus();
  },

  cleanSearchString: function(str) {
    var remove = ['departure at', 'arrival at', '-', ' '];
    var regex = new RegExp(remove.join('|'), 'g');
    return str.toLowerCase().replace(regex, '');
  },

  // NB: The search functionality is a little gimmick-y
  // to conform to the user's expectations. 
  // First click renders the value in the input.
  // Second click get's the data. The data is found from the data id
  // of the active class, not the search string itself.
  // That's why the search returns an error if the search string is changed.
  // Otherwise a wrong a string would return a response since the class
  // stays the same.
  triggerQuery: function() {
    if (this.$input.val()) {
      // First enter click
      if ( $('.flights-list-table').is(':visible') ) {
        this.lastSelectedFlight = this.$input.val();
        this.dropdownView.reset();
        // Second enter click
      } else {
        if (this.$input.val() === this.lastSelectedFlight) this.handleQuery();
        else this.renderResponseMessage('alert_type_2');
      }
    }
  },

  handleQuery: function() {
    var id = $('.active').data('id');
    if (id) {
      this.responseMessageView.flight = _.findWhere(this.dataSet, {flightNumber: id});
      this.renderResponseMessage('success');
      $('.option').removeClass('active');
    } else {
      renderResponseMessage('alert_type_2');
    }
  },

  renderResponseMessage: function(mode) {
    this.responseMessageView.mode = mode;
    this.responseMessageView.render();
  },

  toggleDataSet: function() {
    this.dataSet = this.buttonView.searchMode === 'arrivals' ? this.arrivals : this.departures;
  },

  reset: function() {
    this.$input.val('');
    this.render();
  }

})