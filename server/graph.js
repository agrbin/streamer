var config = require('./config.js').sonic,
  distribution = require('./distribution.js'),
  Distribution = distribution.Distribution,
  DotBuilder = require('./dot.js').DotBuilder,
  util = require('./graphutils.js'),
  dotOutput = "digraph {}";

function Graph () {
  var
    // number of nodes in graph
    N,

    // ids of nodes (they are converted to 0-indexed nums in this class)    
    ids = {},

    // ids[names[x]] == x, x < N
    names = [],

    // this is a N x N field of distributions, variable that represents latency
    // difference between two nodes.
    deltas = [],

    // canHear is a relation between nodes. element is added only if
    // there were 1 / config.reportsInliersRatio reports pointing to that fact.
    canHear = [],

    // connected components ready for playing
    components = [];

  function resetGraph() {
    N = 0;
    ids = {};
    names = [];
    deltas = [];
    canHear = [];
    components = [];
  }

  // convert name to index. add if not existing.
  function nodeId(node) {
    if (!ids.hasOwnProperty(node)) {
      names.push(node);
      ids[node] = N++;
      deltas.push([]);
      canHear.push([]);
      deltas[ids[node]][ids[node]] = new Distribution(
        null, {mean:0 ,dev:0}
      );
    }
    return ids[node];
  }

  // these are reports regarding one listener and one
  // beeper. convert them to random variable.
  // strips outliers.
  function convertReportsToDist(reports) {
    var it, delays, mx;
    delays = reports.map(function (x) {
      return x.delay;
    });
    if (delays.length > config.recordsQueue) {
      delays = delays.slice(-config.recordsQueue);
    }
    delays = distribution.stripOutliers(delays, config.recordsInliersRatio);
    return delays.length >= config.minReports ?
      new Distribution(delays) : undefined;
  }

  // beeper : distribution
  function processRecordsFromListener(oneListener) {
    var node1, node2;
    for (node1 in oneListener) {
      for (node2 in oneListener) {
        if (node1 === node2) continue;
        if (!(oneListener[node1] instanceof Distribution)) continue;
        if (!(oneListener[node2] instanceof Distribution)) continue;
        // delta[n1][n2] = delay(n2) - delay(n1)
        deltas[ nodeId(node1) ][ nodeId(node2) ] = 
          oneListener[node2].sum(oneListener[node1].scale(-1));
      }
    }
  }

  /**
   * for each listener take records from different beepers and assume beeper
   * delays. add that deley as an edge between two beepers.
   */
  function buildGraph(beepReports) {
    var listener,
      beeper,
      listenerId,
      beeperId,
      oneListener;

    for (listener in beepReports) {
      if (beepReports.hasOwnProperty(listener)) {
        var oneListener = {};
        for (beeper in beepReports[listener]) {
          if (beepReports[listener].hasOwnProperty(beeper)) {
            // add those nodes to our graph
            listenerId = nodeId(listener);
            beeperId = nodeId(beeper);
            // collect delays for beepers for this listener to random var
            oneListener[beeper] = convertReportsToDist(
              beepReports[listener][beeper]);
            // add canHear if there are enough records
            if (oneListener[beeper]) {
              canHear[listenerId][beeperId] = true;
            }
          }
        }
        processRecordsFromListener(oneListener);
      }
    }
  }

  function assignAbsDelays(component) {
    var it,
      first,
      node,
      mnAbs = 0,
      abs = new Array(N),
      result = {};
    first = component[0];
    abs[component[0]] = 0;
    for (it = 1; it < component.length; ++it) {
      node = component[it];
      abs[node] = abs[first] + deltas[first][node].getMean();
      mnAbs = Math.min(mnAbs, abs[node]);
    }
    for (it = 0; it < component.length; ++it) {
      result[ names[component[it]] ] = abs[component[it]] - mnAbs;
    }
    return result;
  }

  function analyzeComponent(component) {
    var it, jt, abs = {}, mnAbs = 1e12, result = {};
    if (component.length < 2) {
      return;
    }
    for (it = 0; it < component.length; ++it) {
      for (jt = it + 1; jt < component.length; ++jt) {
        if (deltas[component[it]][component[jt]].getDev()
            >= config.maxDevInComponent) {
          return;
        }
      }
    }
    return assignAbsDelays(component);
  }

  function buildComponents() {
    var it,
      jt,
      bio = new Array(N),
      component;
    for (it = 0; it < N; ++it) {
      component = [];
      for (jt = 0; jt < N; ++jt) {
        if (deltas[it][jt].getDev() !== util.kInf && !bio[jt]) {
          bio[jt] = 1;
          component.push(jt);
        }
      }
      components.push(analyzeComponent(component));
    }
    components = components.filter(function (x) {return !!x;});
  }

  /**
   * for each client that heard beeps, array of objects:
   * { source: , delay: }
   */
  this.importBeepReports = function (beepReports) {
    var dot = new DotBuilder();

    // build graph
    resetGraph();
    buildGraph(beepReports);

    // fill empties
    util.coalesceMatrix(N, deltas, function (x) {
      return !(x instanceof Distribution);
    }, function () {
      return new Distribution(null, {mean: 0, dev: util.kInf});
    });

    // add for debug
    dot.addMatrix(N, canHear, names,
                  util.formatCanHearEdge, 0, 'X can hear Y');
    dot.addMatrix(N, deltas, names,
                  util.formatDistribution, 1, 'X plays after Y (mean ~stddev)');

    // connect
    util.floyd(N, deltas, function (x, y) {
      return x.sum(y);
    }, function (x, y) {
      return x.getDev() < y.getDev();
    });

    dot.addMatrix(N, deltas, names,
                  util.formatDistribution, 1, 'shortest paths');

    // build and analyze components
    buildComponents();

    dotOutput = dot.get();
  };

  this.getComponents = function () {
    return components;
  };
}

module.exports.Graph = Graph;

module.exports.getGraph = function () {
  return dotOutput;
};

module.exports.getGraphHTML = function () {
  return '<head>' +
    '<script src="//github.com/mdaines/viz.js/releases/download/v1.8.0/viz-lite.js" type="text/javascript"></script>' +
    '<script id="a" type="text/vnd.graphviz">' + dotOutput + '</script>' +
    '<script>' +
    ' function render() {' +
    '  document.getElementById("b").innerHTML = Viz(document.getElementById("a").innerHTML, "svg", "dot");\n' +
    ' }' +
    '</script>' +
    '</head>' +
    '<body onload="render()"><div id="b"></div></body>';
};

(function () {
  config.minReports = 1;
  config.recordsInliersRatio = 1;
  config.maxDevInComponent = 100;

  var x = {
    p1 : {
      p1 : [ { delay: 10 }, {delay : 12}, {delay:13} ],
      p2 : [ { delay: 10 }, {delay : 12}, {delay:13} ],
      p3 : [ { delay: 20 }, {delay : 18}, {delay:30} ],
    },
    p2 : {
      p2 : [ { delay: 100 }, {delay : 102}, {delay:103} ],
      p4 : [ { delay: 10 }, {delay : 12}, {delay:13} ],
      p5 : [ { delay: -6 }, {delay : -8}, {delay:-6} ],
    },
    p5 : {
      p6 : [ {delay: 1} ],
    }
  };

  var g = new Graph();
  g.importBeepReports(x);
  console.log(g.getComponents());
});

