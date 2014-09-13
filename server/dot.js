var fs = require('fs');

module.exports.DotBuilder = function () {
  var buf = "digraph {\n",
    cnt = 0;
    cluster = 0,
    that = this;

  this.startSubgraph = function (label) {
    buf += "subgraph cluster_" + (cluster++) + " {\n";
    buf += "label = \"" + label + "\";\n";
  };

  this.endSubgraph = function () {
    buf += "}\n";
  };

  this.addMatrix = function (n, m, names, formatEdge, half, label) {
    var i, j, edge, prefix;

    if (label) {
      that.startSubgraph(label);
    }

    prefix = "__" + (cnt++) + "__";

    for (i = 0; i < n; ++i) {
      buf += prefix + names[i] + " [label=\"" + names[i] + "\"];\n";
    }

    for (i = 0; i < n; ++i) {
      for (j = 0; j < n; ++j) {
        if (half && i >= j) continue;
        edge = formatEdge ? formatEdge(m[i][j]) : m[i][j];
        if (edge) {
          buf += prefix + names[i] + " -> " + prefix + names[j];
          buf += " [label=\"" + edge + "\"];\n";
        }
      }
    }
    if (label) {
      that.endSubgraph();
    }
  }

  this.debug = function () {
    console.log(buf + "}\n");
  };

  this.get = function () {
    return (buf + "}\n");
  };

  this.saveSynced = function (filename) {
    fs.writeFileSync(filename, buf + "}\n");
  }
};

(function () {
  var x = new module.exports.DotBuilder();
  x.addMatrix(2, [ [0,1], [1,0] ], ['a', 'b'], '',1);
  x.addMatrix(2, [ [0,1], [1,0] ], ['a', 'b'], '',1);
  x.debug();
});

