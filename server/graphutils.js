var kInf = 1e12;

/**
 * assumes that matrix is a square matrix of edges.
 * fills the matrix using floyd.
 *
 * addEdge(edge, edge) -> edge
 * edgeLessThan(edge, edge) -> true/false
 */
function floyd(n, m, addEdge, edgeLessThan) {
  var k, i, j, tmpEdge;
  for (k = 0; k < n; ++k) {
    for (i = 0; i < n; ++i) {
      for (j = 0; j < n; ++j) {
        tmpEdge = addEdge(m[i][k], m[k][j]);
        if (edgeLessThan(tmpEdge, m[i][j])) {
          m[i][j] = tmpEdge;
        }
      }
    }
  }
}

/**
 * fill the matrix with default values on elements where
 * isEmpty returns false.
 */
function coalesceMatrix(n, m, isEmpty, getNewValue) {
  var i, j;
  for (i = 0; i < n; ++i) {
    for (j = 0; j < n; ++j) {
      if (isEmpty(m[i][j])) {
        m[i][j] = getNewValue();
      }
    }
  }
}

/**
 * display distribution or hide if kInf
 */
function formatDistribution(dist) {
  function round(x) {
    return Math.round(x);
  }
  if (dist.getDev() !== kInf) {
    return round(dist.getMean()) + " (~"
      + round(dist.getDev()) + ")";
  }
}

function formatCanHearEdge(edge) {
  return edge ? ' ' : '';
}

module.exports.floyd = floyd;
module.exports.coalesceMatrix = coalesceMatrix;
module.exports.formatDistribution = formatDistribution;
module.exports.formatCanHearEdge = formatCanHearEdge;
module.exports.kInf = kInf;

