/*
 * this function returns array with two elems.
 *
 * f(x) = a[0] * x + a[1]
 *
 * is the line that fits the points
 *
 * taken from
 * http://dracoblue.net/dev/linear-least-squares-in-javascript/
 */
function findLineByLeastSquares(pts, inlierRatio) {
  var values_x = pts.x, values_y = pts.y;
  var sum_x = 0;
  var sum_y = 0;
  var sum_xy = 0;
  var sum_xx = 0;
  var count = 0;

  /*
   * We'll use those variables for faster read/write access.
   */
  var x = 0;
  var y = 0;
  var values_length = values_x.length;

  if (values_length != values_y.length) {
    throw new Error('The parameters values_x and values_y need to have same size!');
  }

  /*
   * Nothing to do.
   */
  if (values_length === 0) {
    return [ [], [] ];
  }

  /*
   * Calculate the sum for each of the parts necessary.
   */
  for (var v = 0; v < values_length; v++) {
    x = values_x[v];
    y = values_y[v];
    sum_x += x;
    sum_y += y;
    sum_xx += x*x;
    sum_xy += x*y;
    count++;
  }

  /*
   * Calculate m and b for the formular:
   * y = x * m + b
   */
  var m = (count*sum_xy - sum_x*sum_y) / (count*sum_xx - sum_x*sum_x);
  var b = (sum_y/count) - (m*sum_x)/count;
  var cumError = 0, byError = [];

  for (var v = 0; v < values_length; ++v) {
    var error = Math.pow(values_y[v] - (m * values_x[v] + b), 2);
    byError.push({ index: v, error: error });
    cumError += error;
  }

  if (!inlierRatio || inlierRatio >= 1) {
    return {
      a1 : m,
      a0 : b,
      error : cumError / values_length
    };
  }

  // doit another time without outliers
  byError.sort(function (x, y) {
    return x.error - y.error;
  });
  var newPts = {x: [], y: []};
  for (var it = 0; it < values_length * inlierRatio; ++it) {
    newPts.x.push(values_x[byError[it].index]);
    newPts.y.push(values_y[byError[it].index]);
  }
  return findLineByLeastSquares(newPts, 1);
}

/*
console.log(findLineByLeastSquares( {
  x: [0,1,2,3,4,5,6],
  y: [0,1,2,3,4,5,7],
}, 0.5));
*/


