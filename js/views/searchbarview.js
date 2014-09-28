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
      'formatSearchString',
      'isNotSubString',
      'triggerQuery',
      'selectFlight',
      'handleQuery',
      'renderResponseMessage',
      'toggleDataSet',
      'reset')
    this.$input  = this.$el.find('input');
    this.searchString = '';
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
    var searchStrs = this.formatSearchString(this.searchString);
    return _.filter(this.dataSet, function(d) {
      // omits data object if there exists a string in the array
      // of whitespace seperated search strings such that that
      // string is not a substring of any string in the data object.
      return !_.some(searchStrs, function(s) {
        var v = this;
        return  v.isNotSubString(d.to, s)            &&
                v.isNotSubString(d.from, s)          &&
                v.isNotSubString(d.flightNumber, s)  &&
                v.isNotSubString(d.airline, s)       &&
                v.isNotSubString(d.date, s)
      }, this);
    }, this);
  },

  handleKeydown: function(event) {
    switch (event.which) {
      case 13: // enter
        this.triggerQuery();
        break;
      case 38: // up
        this.navigateUpList();
        break;
      case 40: // down
        this.navigateDownList();
        break;
    }
  },

  navigateDownList: function() {
    if ( $('.flights-list-table').is(':visible') ) {
      if ($('.active').length === 0) { // First option
        var nextOpt = $('.option:first');
        this.manageOptions(nextOpt, true);
      } else {
        var nextOpt = $('.active').next();
        this.manageOptions(nextOpt, true);
      }
    }
  },

  navigateUpList: function() {
    event.preventDefault(); // Prevent caret from moving
    var nextOpt = $('.active').prev();
    this.manageOptions(nextOpt, true);
    var input_length = this.$input.val().length;
  },

  // If there's no next option the user
  // re-enters the input with the inital value
  manageOptions: function (opt, scrollIntoView) {
    $('.option').removeClass('active');
    if (opt.length > 0) {
      opt.addClass('active');
      if (scrollIntoView) opt[0].scrollIntoView(false);
    }
    var val = opt.find('td').text() || this.searchString;
    this.$input.val(val);
    this.$input.focus();
  },

  formatSearchString: function(str) {
    return str.toLowerCase().split(' ');
  },

  isNotSubString: function(str, subStr) {
    return str.toLowerCase().indexOf(subStr) == -1;
  },

  triggerQuery: function() {
    if (this.$input.val() && $('.flights-list-table').is(':visible')) {
      this.dropdownView.reset();
      this.handleQuery();
    }
  },

  selectFlight: function() {
    this.lastSelectedFlight = this.$input.val();
    this.dropdownView.reset();
  },

  handleQuery: function() {
    var id = $('.active').data('id');
    if (id) {
      this.responseMessageView.flight = _.findWhere(this.dataSet, {flightNumber: id});
      this.renderResponseMessage('success');
      $('.option').removeClass('active');
    } else {
      this.renderResponseMessage('alert_type_2');
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