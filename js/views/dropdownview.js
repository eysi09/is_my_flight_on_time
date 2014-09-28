var DropdownView = Backbone.View.extend({

  events: {
    'mouseover .option'  : 'manageOptions',
    'click .option'     : 'selectOption'
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
      'manageOptions',
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

  manageOptions: function(event) {
    this.searchBarView.manageOptions($(event.target).parent(), false);
  },

  selectOption: function(event) {
    this.searchBarView.manageOptions($(event.target).parent()), false;
    this.reset();
    this.searchBarView.handleQuery();
  },

  reset: function() {
    this.matches = [];
    this.render();
  }

});