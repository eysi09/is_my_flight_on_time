var AllFlightsView = Backbone.View.extend({

  initialize: function(options) {
    _.bindAll(this,
      'load',
      'initialize_tree',
      'render',
      'y_transform',
      'toggle',
      'prepare_data')
    this.tooltip_template = _.template($('#tooltip_template').html());
    this.kind = options.kind;
  },

  load: function(response) {
    this.root = this.prepare_data(response[this.kind]);
    this.initialize_tree();
  },

  initialize_tree: function() {
    var this_view = this;
    var m = [20, 120, 20, 120], h = 800 - m[0] - m[2];
    this.w = 600 - m[1] - m[3];
    this.i = 0;

    this.orientation = this.kind === 'arrivals' ? 'left' : 'right';

    this.tree = d3.layout.tree()
        .size([h, this_view.w]);

    this.diagonal = d3.svg.diagonal()
        .projection(function(d) { return [this_view.y_transform(d.y), d.x]; });

    this.vis = d3.select("." + this_view.kind + "-diagram").append("svg:svg")
        .attr("width", this_view.w + m[1] + m[3])
        .attr("height", h + m[0] + m[2])
      .append("svg:g")
        .attr("transform", "translate(" + m[3] + "," + m[0] + ")");
    this.tip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      .html(function(d) {
        return this_view.tooltip_template(d.data);
    });

    this.vis.call(this_view.tip);

    this.root.x0 = h / 2;
    this.root.y0 = 0;

    function toggleAll(d) {
      if (d.children) {
        d.children.forEach(toggleAll);
        this_view.toggle(d);
      }
    }

    // Collapse all nodes
    this.root.children.forEach(toggleAll);
    this.render(this.root);

  },

  render: function(source) {
    var this_view = this;
    var duration = d3.event && d3.event.altKey ? 5000 : 500;

    // Compute the new tree layout.
    var nodes = this.tree.nodes(this_view.root).reverse();

    // Normalize for fixed-depth.
    nodes.forEach(function(d) { d.y = d.depth * 180; });

    // Update the nodes…
    var node = this_view.vis.selectAll("g.node")
        .data(nodes, function(d) { return d.id || (d.id = ++this_view.i); });

    // Enter any new nodes at the parent's previous position.
    var nodeEnter = node.enter().append("svg:g")
        .attr("class", "node")
        .attr("transform", function(d) { return "translate(" + (this_view.y_transform(d.y)) + "," + source.x0 + ")"; })
        .on("click", function(d) { this_view.toggle(d); this_view.render(d); });

    nodeEnter.append("svg:circle")
        .attr("r", 1e-6)
        .attr("class", function(d) { return d._children ? 'pointer' : ''; })
        .style("fill", function(d) { return d._children ? "#93b1c6" : "#fff"; })
        .on('mouseover', function(d) { if (d.data) this_view.tip.show(d); })
        .on('mouseout', function(d) { if (d.data) this_view.tip.hide(d); });

    var x_val             = this.orientation === 'left' ? 10 : -10;
    var last_x_val        = this.orientation === 'left' ? -10 : 10;
    var text_anchor       = this.orientation === 'left' ? 'start' : 'end';
    var last_text_anchor  = this.orientation === 'left' ? 'end' : 'start';

    nodeEnter.append("svg:text")
        .attr("x", function(d) { return d.children || d._children ? x_val : last_x_val; })
        .attr("dy", ".35em")
        .attr("text-anchor", function(d) { return d.children || d._children ? text_anchor : last_text_anchor; })
        .text(function(d) { return d.name; })
        .style("fill-opacity", 1e-6);

    // Transition nodes to their new position.
    var nodeUpdate = node.transition()
        .duration(duration)
        .attr("transform", function(d) { return "translate(" + (this_view.y_transform(d.y)) + "," + d.x + ")"; });

    nodeUpdate.select("circle")
        .attr("r", 4.5)
        .style("fill", function(d) { return d._children ? "#93b1c6" : "#fff"; });

    nodeUpdate.select("text")
        .style("fill-opacity", 1);

    // Transition exiting nodes to the parent's new position.
    var nodeExit = node.exit().transition()
        .duration(duration)
        .attr("transform", function(d) { return "translate(" + (this_view.y_transform(d.y)) + "," + source.x + ")"; })
        .remove();

    nodeExit.select("circle")
        .attr("r", 1e-6);

    nodeExit.select("text")
        .style("fill-opacity", 1e-6);

    // Update the links…
    var link = this_view.vis.selectAll("path.link")
        .data(this_view.tree.links(nodes), function(d) { return d.target.id; });

    // Enter any new links at the parent's previous position.
    link.enter().insert("svg:path", "g")
        .attr("class", "link")
        .attr("d", function(d) {
          var o = {x: source.x0, y: source.y0};
          return this_view.diagonal({source: o, target: o});
        })
      .transition()
        .duration(duration)
        .attr("d", this_view.diagonal);

    // Transition links to their new position.
    link.transition()
        .duration(duration)
        .attr("d", this_view.diagonal);

    // Transition exiting nodes to the parent's new position.
    link.exit().transition()
        .duration(duration)
        .attr("d", function(d) {
          var o = {x: source.x, y: source.y};
          return this_view.diagonal({source: o, target: o});
        })
        .remove();

    // Stash the old positions for transition.
    nodes.forEach(function(d) {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  },

  y_transform: function(y) {
    if (this.orientation === 'left') return this.w - y;
    else return y;
  },

  toggle: function(d) {
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
  },

  prepare_data: function(data) {
    var key = this.kind === 'arrivals' ? 'Arrivals' : 'Departures';
    var return_hash = {'name': key, 'children': []};
    var airlines = _.keys(_.indexBy(data, 'airline'));
    var airline_data_arr = [];
    _.each(airlines, function(airline) {
      var airports = [];
      _.each(data, function(d) {
        if (d.airline === airline) airports.push({'name': d.to, 'data': d});
      });
      airline_data_arr.push({'name': airline, 'children': airports});
    });
    airline_data_arr = _.sortBy(airline_data_arr, function(d) {
      return d.name.toLowerCase();
    });
    return {'name': key, 'children': airline_data_arr};
  }

});