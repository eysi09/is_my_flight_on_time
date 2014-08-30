var DropdownView = Backbone.View.extend({

  events: {
    'click .option' : 'selectOption'
  },

  strings: {
    flightslist: {
      arrivals:   'Arriving at ',
      departures: 'Departing at '
    }
  },

  initialize: function() {
    _.bindAll(this,
      'render',
      'selectOption',
      'reset')
    this.flights_list_template = _.template($('#flights_list_template').html());
    this.matches;
  },

  render: function() {
    if (!_.isEmpty(this.matches)) {
      var searchMode = this.buttonView.searchMode;
      var context = {
        list: this.matches,
        key:  this.strings.flightslist[searchMode]
      }
      this.$el.html(this.flights_list_template(context));
      this.responseMessageView.reset();
      this.$el.show();
    } else {
      this.$el.hide();
    }
  },

  selectOption: function(event) {
    this.searchBarView.manageOptions($(event.target).parent());
    this.searchBarView.selectFlight();
  },

  reset: function() {
    this.matches = [];
    this.render();
  }

});