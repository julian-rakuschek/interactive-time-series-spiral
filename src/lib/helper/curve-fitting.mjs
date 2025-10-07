// @ts-nocheck
/*
SOURCE: https://gitlab.com/Mytskine/curve-fitting/-/blob/master/src/LinearAlgebra.ts?ref_type=heads
Author: François Gannaz
Published: March 10, 2024
Copied on: October 07, 2025
License: GNU General Public License v3.0

*/
var Matrix = class {
  rows;
  columns;
  values;
  constructor(rows, columns, values) {
    this.rows = rows;
    this.columns = columns;
    if (values) {
      if (values instanceof Float64Array) {
        this.values = values;
      } else {
        this.values = new Float64Array(values);
      }
    } else {
      this.values = new Float64Array(rows * columns);
      this.values.fill(0);
    }
  }
};
function norm2(m) {
  let sum = 0;
  for (const x of m.values) {
    sum += Math.pow(x, 2);
  }
  return Math.sqrt(sum);
}
var almostZero = 1e-20;
function solve(m, y) {
  if (m.rows !== y.rows) {
    throw new Error("Cannot solve because of wrong dimensions.");
  }
  const a = new Float64Array(m.rows * (y.columns + m.columns));
  let p = 0;
  let py = 0;
  for (let im = 0; im < m.rows * m.columns; im++) {
    a[p] = m.values[im];
    p++;
    if (im % m.columns === m.columns - 1) {
      for (let j = 0; j < y.columns; j++) {
        a[p] = y.values[py];
        p++;
        py++;
      }
    }
  }
  const numRows = m.rows;
  const numColumns = m.columns + y.columns;
  const size = m.rows * m.columns;
  for (let i = 0; i < numRows; i++) {
    const pivot = i * (numColumns + 1);
    if (Math.abs(a[pivot]) < almostZero) {
      let swapped = false;
      for (let j = pivot + numColumns; j < size; j += numColumns) {
        if (Math.abs(a[j]) > almostZero) {
          const row = a.slice(j, j + numColumns - i);
          for (let k = 0; k < numColumns - i; k++) {
            a[j + k] = a[pivot + k];
            a[pivot + k] = row[k];
          }
          swapped = true;
          break;
        }
      }
      if (!swapped) {
        console.error(a);
        throw new Error("No solution.");
      }
    }
    const c = a[pivot];
    a[pivot] = 1;
    for (let k = 1; k < numColumns - i; k++) {
      a[pivot + k] /= c;
    }
    for (let r = 0; r < numRows; r++) {
      if (r === i || Math.abs(a[r * numColumns + i]) < almostZero) {
        continue;
      }
      const sub = a[r * numColumns + i];
      a[r * numColumns + i] = 0;
      for (let k = 1; k < numColumns - i; k++) {
        a[r * numColumns + i + k] -= sub * a[pivot + k];
      }
    }
  }
  const x = new Matrix(m.columns, y.columns);
  for (let i = 0; i < x.rows; i++) {
    for (let j = 0; j < x.columns; j++) {
      x.values[i * x.columns + j] = a[i * numColumns + m.columns + j];
    }
  }
  return x;
}

// src/levenberg-marquardt.ts
var epsilonStep = 0.1;
var epsilonGradient = 1e-4;
var epsilonParameters = 1e-8;
var epsilonChi2red = 1e-12;
var dampingStepUp = 8;
var dampingStepDown = 9;
function levenbergMarquardt(input, fn, o) {
  const options = completeOptions(o, input);
  const numParameters = options.parameters.initial.length;
  const numPoints = input.x.length;
  if (input.x.length !== input.y.length) {
    throw new Error("The arrays input.x and input.y have different sizes.");
  }
  if (input.x.length <= numParameters) {
    throw new Error("Fitting requires more input points than parameters in the model function.");
  }
  let parameters = options.parameters.initial.slice(0);
  let parametersOld = parameters.slice(0);
  let yOld = new Float64Array(numPoints);
  let y = new Float64Array(input.x.map(fn(Array.from(parameters))));
  const computeNext = new ComputeNext(input, fn, options);
  const jacobian = new Matrix(numPoints, numParameters);
  const JtWJ = new Matrix(numParameters, numParameters);
  const JtWdy = new Float64Array(numParameters);
  computeNext.updateJacobian(jacobian, parameters, y);
  computeNext.updateJtWJ(JtWJ, jacobian);
  computeNext.updateJtWdy(JtWdy, jacobian, y);
  let chi2 = computeNext.computeChi2(y);
  let chi2Old = 0;
  let lambda = options.damping;
  let converged = false;
  let iteration = 0;
  while (!converged && iteration < options.maxIterations) {
    iteration++;
    const h = computeParametersDelta(lambda, JtWJ, JtWdy);
    parametersOld = parameters.slice(0);
    for (let i = 0; i < numParameters; i++) {
      parameters[i] += h[i];
      if (options.parameters.min && parameters[i] < options.parameters.min[i]) {
        parameters[i] = options.parameters.min[i];
      }
      if (options.parameters.max && parameters[i] > options.parameters.max[i]) {
        parameters[i] = options.parameters.max[i];
      }
    }
    yOld = y.slice(0);
    y = new Float64Array(input.x.map(fn(Array.from(parameters))));
    chi2Old = chi2;
    chi2 = computeNext.computeChi2(y);
    let hMax = 0;
    for (let i = 0; i < numParameters; i++) {
      hMax = Math.max(hMax, Math.abs(h[i]));
    }
    if (hMax < 1e10 && lambda > 1e15) {
      computeNext.centralDifferences = true;
    }
    const rho = (chi2Old - chi2) / computeNext.computeRhoDenominator(h, lambda, JtWdy);
    if (rho > epsilonStep) {
      computeNext.updateJacobian(jacobian, parameters, y);
      computeNext.updateJtWJ(JtWJ, jacobian);
      computeNext.updateJtWdy(JtWdy, jacobian, y);
      lambda = Math.max(lambda / dampingStepDown, 1e-20);
    } else {
      parameters = parametersOld.slice(0);
      y = yOld.slice(0);
      chi2 = chi2Old;
      if (lambda >= 1e25) {
        break;
      }
      lambda = Math.min(lambda * dampingStepUp);
      continue;
    }
    if (iteration <= 2) {
      continue;
    }
    if (norm2(JtWJ) < epsilonGradient) {
      converged = true;
    } else if (chi2 / (input.x.length - numParameters) < epsilonChi2red) {
      converged = true;
    } else {
      if (hMax < epsilonParameters) {
        converged = true;
      }
    }
  }
  return {
    error: chi2,
    iterations: iteration,
    parameters: Array.from(parameters)
  };
}
var computeParametersDelta = (lambda, JtWJ, JtWdy) => {
  for (let i = 0; i < JtWJ.rows; i++) {
    JtWJ.values[i * JtWJ.columns + i] += lambda;
  }
  const Y = new Matrix(JtWdy.length, 1, JtWdy);
  return solve(JtWJ, Y).values;
};
var ComputeNext = class {
  centralDifferences = false;
  #input;
  #modelFunction;
  #options;
  constructor(input, modelFunction, o) {
    this.#input = input;
    this.#modelFunction = modelFunction;
    this.#options = o;
  }
  computeChi2(y) {
    let sum = 0;
    for (let i = 0; i < this.#input.y.length; i++) {
      let sq = Math.pow(this.#input.y[i] - y[i], 2);
      if (this.#options.weights.length > 0) {
        sq *= this.#options.weights[i];
      }
      sum += sq;
    }
    return sum;
  }
  computeRhoDenominator(h, lambda, JtWdy) {
    let sum = 0;
    for (let i = 0; i < h.length; i++) {
      sum += h[i] * (lambda * h[i] + JtWdy[i]);
    }
    return Math.abs(sum);
  }
  updateJacobian(J, params, y) {
    const x = Array.from(this.#input.x);
    for (let j = 0; j < J.columns; j++) {
      const pRight = Array.from(params);
      const pLeft = Array.from(params);
      pRight[j] = pRight[j] + this.#options.parametersDelta[j];
      pLeft[j] = pRight[j] - this.#options.parametersDelta[j];
      for (let i = 0; i < J.rows; i++) {
        const yRight = this.#modelFunction(pRight).call(this, x[i]);
        if (this.centralDifferences) {
          const yLeft = this.#modelFunction(pLeft).call(this, x[i]);
          J.values[i * J.columns + j] = 0.5 * (yRight - yLeft) / this.#options.parametersDelta[j];
        } else {
          J.values[i * J.columns + j] = (yRight - y[i]) / this.#options.parametersDelta[j];
        }
      }
    }
  }
  updateJtWJ(JtWJ, jacobian) {
    for (let i = 0; i < JtWJ.rows; i++) {
      for (let j = 0; j < JtWJ.columns; j++) {
        let sum = 0;
        for (let k = 0; k < jacobian.rows; k++) {
          sum += jacobian.values[k * jacobian.columns + i] * jacobian.values[k * jacobian.columns + j];
        }
        if (this.#options.weights.length > 0) {
          sum *= this.#options.weights[j];
        }
        JtWJ.values[i * JtWJ.columns + j] = sum;
      }
    }
  }
  updateJtWdy(JtWdy, jacobian, y) {
    for (let j = 0; j < JtWdy.length; j++) {
      let sum = 0;
      for (let k = 0; k < jacobian.rows; k++) {
        sum += jacobian.values[k * jacobian.columns + j] * (this.#input.y[k] - y[k]);
      }
      if (this.#options.weights.length > 0) {
        sum *= this.#options.weights[j];
      }
      JtWdy[j] = sum;
    }
  }
};
function completeOptions(o, input) {
  if (!Array.isArray(o?.parameters?.initial) || o?.parameters?.initial.length === 0) {
    throw new Error("You must pass an array of numbers into the option 'parameters.initial'.");
  }
  const numParameters = o.parameters.initial.length;
  let parametersDelta;
  if (Array.isArray(o?.parametersDelta) && o.parametersDelta.length > 0) {
    if (o.parametersDelta.length === numParameters) {
      parametersDelta = new Float64Array(o.parametersDelta);
    } else if (o.parametersDelta.length === 1 && typeof o.parametersDelta[0] === "number") {
      parametersDelta = new Float64Array(numParameters);
      parametersDelta.fill(o.parametersDelta[0]);
    } else {
      throw new Error("Incorrect value for parametersDelta");
    }
  } else if (!o?.parametersDelta) {
    const averageInterval = (input.x[input.x.length - 1] - input.x[0]) / input.x.length;
    if (averageInterval < 0) {
      throw new Error("Input data x must be sorted by ascending values.");
    }
    parametersDelta = new Float64Array(numParameters);
    parametersDelta.fill(averageInterval < 1e-6 ? averageInterval / 100 : 1e-8);
  } else {
    throw new Error("Incorrect value for parametersDelta");
  }
  let weights;
  if (o.weights) {
    weights = new Float64Array(o.weights);
  } else {
    weights = new Float64Array();
  }
  return {
    damping: typeof o?.damping === "number" && o.damping > 0 ? o.damping : 2,
    parametersDelta,
    maxIterations: typeof o?.maxIterations === "number" && o.maxIterations > 0 ? o.maxIterations : 40 * numParameters,
    parameters: {
      initial: new Float64Array(o.parameters.initial),
      max: o.parameters?.max ? new Float64Array(o.parameters.max) : null,
      min: o.parameters?.min ? new Float64Array(o.parameters.min) : null
    },
    timeout: o?.timeout || 0,
    weights
  };
}
var levenberg_marquardt_default = levenbergMarquardt;
export {
  levenberg_marquardt_default as levenbergMarquardt
};
