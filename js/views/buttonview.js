var ButtonView = Backbone.View.extend({

  events: {
    'click button' : 'toggleSearchMode'
  },

  initialize: function(options) {
    _.bindAll(this,
      'render',
      'toggleSearchMode',
      'resetAll');
    this.searchMode = 'arrivals';
    this.render();
  },

  render: function() {
    _.each(this.$el.find('button'), function(button) {
      $(button).prop('disabled', false);
    });
  },

  toggleSearchMode: function(event) {
    this.searchMode = $(event.target).data('id');
    this.searchBarView.toggleDataSet();
    $('button').removeClass('btn-toggle-active').addClass('btn-toggle-unactive');
    $(event.target).addClass('btn-toggle-active');
    this.resetAll();
  },

  // Kind of invasive, cleans up html in other views
  resetAll: function() {
    this.searchBarView.reset();
    this.dropdownView.reset();
    this.responseMessageView.reset();
  }


});