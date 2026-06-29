// State variables
let currentExpression = "";
let currentResult = "0";
let currentMode = "basic";
let currentAngleMode = "DEG"; // DEG or RAD
let history = [];

// DOM Elements
const tabs = document.querySelectorAll(".tab");
const historyPanel = document.getElementById("historyPanel");
const toggleHistory = document.getElementById("toggleHistory");
const historyList = document.getElementById("historyList");
const clearHistoryBtn = document.getElementById("clearHistory");

// History logic
toggleHistory.addEventListener("click", () => {
    historyPanel.classList.toggle("open");
});

clearHistoryBtn.addEventListener("click", () => {
    history = [];
    renderHistory();
});

function addToHistory(expr, res) {
    if (!expr) return;
    history.unshift({ expr, res });
    if (history.length > 20) history.pop();
    renderHistory();
}

function renderHistory() {
    if (history.length === 0) {
        historyList.innerHTML = '<div class="history-empty">No history yet</div>';
        return;
    }

    historyList.innerHTML = history.map((item, index) => `
        <div class="history-item" data-index="${index}">
            <div class="h-expr">${item.expr}</div>
            <div class="h-res">${item.res}</div>
        </div>
    `).join("");

    document.querySelectorAll(".history-item").forEach(item => {
        item.addEventListener("click", () => {
            const idx = item.dataset.index;
            const data = history[idx];
            currentExpression = data.expr;
            currentResult = data.res;
            updateDisplay();
        });
    });
}

// Tab switching logic
function setMode(mode) {
    currentMode = mode;
    
    // Update tabs UI
    tabs.forEach(tab => {
        if (tab.dataset.mode === mode) {
            tab.classList.add("active");
        } else {
            tab.classList.remove("active");
        }
    });
    
    // Update panels UI
    document.querySelectorAll(".panel").forEach(panel => {
        if (panel.id === `panel-${mode}`) {
            panel.classList.add("active");
        } else {
            panel.classList.remove("active");
        }
    });
    
    // Show/hide shared display
    const display = document.getElementById("display");
    if (mode === "matrix") {
        display.classList.add("hidden");
    } else {
        display.classList.remove("hidden");
    }
}

tabs.forEach(tab => {
    tab.addEventListener("click", () => {
        setMode(tab.dataset.mode);
    });
});

// Main basic/scientific keys handling
document.querySelectorAll(".keys-basic, .keys-sci").forEach(container => {
    container.addEventListener("click", (e) => {
        const btn = e.target.closest("button");
        if (!btn) return;
        
        const act = btn.dataset.act;
        const val = btn.dataset.val;
        
        handleMainKey(act, val);
    });
});

function handleMainKey(act, val) {
    if (act === "num" || act === "op" || act === "func" || act === "const") {
        currentExpression += val;
        updateDisplay();
    } else if (act === "clear") {
        currentExpression = "";
        currentResult = "0";
        updateDisplay();
    } else if (act === "back") {
        if (currentExpression.length > 0) {
            const funcs = ["sin(", "cos(", "tan(", "sinh(", "cosh(", "tanh(", "sqrt(", "log(", "ln("];
            let deleted = false;
            for (const f of funcs) {
                if (currentExpression.endsWith(f)) {
                    currentExpression = currentExpression.substring(0, currentExpression.length - f.length);
                    deleted = true;
                    break;
                }
            }
            if (!deleted) {
                currentExpression = currentExpression.substring(0, currentExpression.length - 1);
            }
        }
        updateDisplay();
    } else if (act === "equals") {
        try {
            currentResult = evaluateExpression(currentExpression);
            const resDiv = document.getElementById("result");
            resDiv.classList.remove("error");
            addToHistory(currentExpression, currentResult);
        } catch (err) {
            currentResult = err.message || "Error";
            const resDiv = document.getElementById("result");
            resDiv.classList.add("error");
        }
        updateDisplay();
    } else if (act === "angle") {
        currentAngleMode = currentAngleMode === "DEG" ? "RAD" : "DEG";
        updateAngleButton();
    } else if (act === "sq") {
        currentExpression += "^2";
        updateDisplay();
    } else if (act === "percent") {
        currentExpression += "/100";
        updateDisplay();
    } else if (act === "negate") {
        handleNegate();
    }
}

function handleNegate() {
    if (currentExpression === "") {
        currentExpression = "-";
    } else if (currentExpression.startsWith("-(") && currentExpression.endsWith(")")) {
        currentExpression = currentExpression.substring(2, currentExpression.length - 1);
    } else {
        currentExpression = "-(" + currentExpression + ")";
    }
    updateDisplay();
}

function updateDisplay() {
    const exprDiv = document.getElementById("expr");
    const resDiv = document.getElementById("result");
    
    // Map raw operators in currentExpression to pretty symbols for display
    let displayExpr = currentExpression
        .replace(/\//g, " ÷ ")
        .replace(/\*/g, " × ")
        .replace(/\-/g, " − ")
        .replace(/\+/g, " + ")
        .replace(/\^/g, " ^ ");
        
    exprDiv.innerHTML = displayExpr.trim() === "" ? "&nbsp;" : displayExpr;
    resDiv.textContent = currentResult;
}

function updateAngleButton() {
    const btn = document.getElementById("angleBtn");
    if (btn) {
        btn.textContent = currentAngleMode;
    }
}

// Math Custom Functions wrapper for DEG/RAD handling and others
function calcSin(x) {
    if (currentAngleMode === "DEG") {
        x = x * Math.PI / 180;
    }
    return Math.sin(x);
}

function calcCos(x) {
    if (currentAngleMode === "DEG") {
        let deg = x % 360;
        if (deg === 90 || deg === -270 || deg === 270 || deg === -90) return 0;
        x = x * Math.PI / 180;
    }
    return Math.cos(x);
}

function calcTan(x) {
    if (currentAngleMode === "DEG") {
        let deg = x % 180;
        if (deg === 90 || deg === -90) throw new Error("Undefined (tan of 90°)");
        x = x * Math.PI / 180;
    }
    return Math.tan(x);
}

function calcSinh(x) { return Math.sinh(x); }
function calcCosh(x) { return Math.cosh(x); }
function calcTanh(x) { return Math.tanh(x); }

function calcLog(x) {
    if (x <= 0) throw new Error("Domain Error");
    return Math.log10(x);
}

function calcLn(x) {
    if (x <= 0) throw new Error("Domain Error");
    return Math.log(x);
}

function calcSqrt(x) {
    if (x < 0) throw new Error("Domain Error");
    return Math.sqrt(x);
}

// Helper to format float output nicely
function formatNumber(num) {
    if (Math.abs(num) < 1e-12 && Math.abs(num) > 0) return "0";
    if (Number.isInteger(num)) return num.toString();
    let str = num.toFixed(10);
    if (str.indexOf('.') !== -1) {
        str = str.replace(/\.?0+$/, "");
    }
    return str;
}

// Safe Expression Evaluator
function evaluateExpression(expr) {
    if (!expr || expr.trim() === "") return "0";
    
    let processed = expr;
    
    // Replace custom power syntax
    processed = processed.replace(/\^/g, '**');

    // Handle constants: pi and e
    processed = processed.replace(/\bpi\b/g, 'Math.PI');
    processed = processed.replace(/\be\b/g, 'Math.E');

    // Map math function calls to custom wrappers
    processed = processed.replace(/\bsin\(/g, 'calcSin(');
    processed = processed.replace(/\bcos\(/g, 'calcCos(');
    processed = processed.replace(/\btan\(/g, 'calcTan(');
    processed = processed.replace(/\bsinh\(/g, 'calcSinh(');
    processed = processed.replace(/\bcosh\(/g, 'calcCosh(');
    processed = processed.replace(/\btanh\(/g, 'calcTanh(');
    processed = processed.replace(/\blog\(/g, 'calcLog(');
    processed = processed.replace(/\bln\(/g, 'calcLn(');
    processed = processed.replace(/\bsqrt\(/g, 'calcSqrt(');

    // Whitelist verification: only allow numbers, math ops, and mapped functions/constants
    let testString = processed
        .replace(/calcSin/g, '')
        .replace(/calcCos/g, '')
        .replace(/calcTan/g, '')
        .replace(/calcSinh/g, '')
        .replace(/calcCosh/g, '')
        .replace(/calcTanh/g, '')
        .replace(/calcLog/g, '')
        .replace(/calcLn/g, '')
        .replace(/calcSqrt/g, '')
        .replace(/Math\.PI/g, '')
        .replace(/Math\.E/g, '');
        
    if (!/^[0-9.+\-*/%()\s]*$/.test(testString)) {
        throw new Error("Invalid characters");
    }

    // Auto-balance parentheses if they are open
    let openCount = (processed.match(/\(/g) || []).length;
    let closeCount = (processed.match(/\)/g) || []).length;
    if (openCount > closeCount) {
        processed += ")".repeat(openCount - closeCount);
    }

    const evalResult = new Function(`return (${processed})`)();
    
    if (evalResult === null || evalResult === undefined || isNaN(evalResult)) {
        throw new Error("Not a number");
    }
    if (!isFinite(evalResult)) {
        throw new Error("Infinite result");
    }
    
    return formatNumber(evalResult);
}

// ===================== PERMUTATIONS & COMBINATIONS =====================
function calculateNPr(n, r) {
    if (isNaN(n) || isNaN(r)) return "Please enter valid integers.";
    if (n < 0 || r < 0) return "n and r must be non-negative.";
    if (r > n) return "r cannot be greater than n.";
    if (!Number.isInteger(n) || !Number.isInteger(r)) return "n and r must be integers.";
    
    let result = 1;
    for (let i = n - r + 1; i <= n; i++) {
        result *= i;
    }
    return result;
}

function calculateNCr(n, r) {
    if (isNaN(n) || isNaN(r)) return "Please enter valid integers.";
    if (n < 0 || r < 0) return "n and r must be non-negative.";
    if (r > n) return "r cannot be greater than n.";
    if (!Number.isInteger(n) || !Number.isInteger(r)) return "n and r must be integers.";

    let k = Math.min(r, n - r);
    let result = 1;
    for (let i = 1; i <= k; i++) {
        result *= (n - k + i);
        result /= i;
    }
    return Math.round(result);
}

document.querySelectorAll(".subcard button[data-act='npr'], .subcard button[data-act='ncr']").forEach(btn => {
    btn.addEventListener("click", () => {
        const nVal = parseFloat(document.getElementById("npr_n").value);
        const rVal = parseFloat(document.getElementById("npr_r").value);
        const act = btn.dataset.act;
        const container = document.getElementById("combResult");
        
        if (isNaN(nVal) || isNaN(rVal)) {
            container.textContent = "Please enter valid integers.";
            container.classList.add("error");
            return;
        }
        
        if (act === "npr") {
            const res = calculateNPr(nVal, rVal);
            if (typeof res === "string") {
                container.textContent = res;
                container.classList.add("error");
            } else {
                container.textContent = `P(${nVal}, ${rVal}) = ${formatNumber(res)}`;
                container.classList.remove("error");
            }
        } else {
            const res = calculateNCr(nVal, rVal);
            if (typeof res === "string") {
                container.textContent = res;
                container.classList.add("error");
            } else {
                container.textContent = `C(${nVal}, ${rVal}) = ${formatNumber(res)}`;
                container.classList.remove("error");
            }
        }
    });
});

// ===================== STATISTICS =====================
function parseStatsInput() {
    const inputVal = document.getElementById("statData").value;
    if (!inputVal || inputVal.trim() === "") {
        throw new Error("Please enter comma-separated numbers.");
    }
    const parts = inputVal.split(",");
    const nums = [];
    for (let p of parts) {
        p = p.trim();
        if (p === "") continue;
        const num = parseFloat(p);
        if (isNaN(num)) {
            throw new Error(`Invalid number: "${p}"`);
        }
        nums.push(num);
    }
    if (nums.length === 0) {
        throw new Error("No numbers found.");
    }
    return nums;
}

function computeMean(nums) {
    const sum = nums.reduce((a, b) => a + b, 0);
    return sum / nums.length;
}

function computeMedian(nums) {
    const sorted = [...nums].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    if (sorted.length % 2 !== 0) {
        return sorted[mid];
    } else {
        return (sorted[mid - 1] + sorted[mid]) / 2;
    }
}

function computeMode(nums) {
    const counts = {};
    let maxCount = 0;
    for (const n of nums) {
        counts[n] = (counts[n] || 0) + 1;
        if (counts[n] > maxCount) {
            maxCount = counts[n];
        }
    }
    const modes = [];
    for (const n in counts) {
        if (counts[n] === maxCount) {
            modes.push(Number(n));
        }
    }
    if (modes.length === nums.length && nums.length > 1) {
        return "No unique mode";
    }
    return modes.join(", ");
}

function computeSum(nums) {
    return nums.reduce((a, b) => a + b, 0);
}

function computeStdDev(nums) {
    const mean = computeMean(nums);
    const squareDiffs = nums.map(n => Math.pow(n - mean, 2));
    const avgSquareDiff = computeSum(squareDiffs) / nums.length;
    return Math.sqrt(avgSquareDiff);
}

document.querySelectorAll(".subcard button[data-act='stat']").forEach(btn => {
    btn.addEventListener("click", () => {
        const act = btn.dataset.val;
        const container = document.getElementById("statResult");
        
        try {
            const nums = parseStatsInput();
            let result;
            let label;
            
            if (act === "mean") {
                result = computeMean(nums);
                label = "Mean";
            } else if (act === "median") {
                result = computeMedian(nums);
                label = "Median";
            } else if (act === "mode") {
                result = computeMode(nums);
                label = "Mode";
            } else if (act === "stddev") {
                result = computeStdDev(nums);
                label = "Std Dev";
            } else if (act === "sum") {
                result = computeSum(nums);
                label = "Sum";
            }
            
            if (typeof result === "number") {
                container.textContent = `${label} = ${formatNumber(result)}`;
            } else {
                container.textContent = `${label} = ${result}`;
            }
            container.classList.remove("error");
        } catch (err) {
            container.textContent = err.message;
            container.classList.add("error");
        }
    });
});

// ===================== MATRIX OPERATIONS =====================
function renderMatrixInputs() {
    const dim = getSelectedDimension();
    
    const containerA = document.getElementById("matrixA");
    const containerB = document.getElementById("matrixB");
    
    containerA.style.gridTemplateColumns = `repeat(${dim}, 1fr)`;
    containerB.style.gridTemplateColumns = `repeat(${dim}, 1fr)`;
    
    containerA.innerHTML = generateMatrixInputsHTML("A", dim);
    containerB.innerHTML = generateMatrixInputsHTML("B", dim);
}

function getSelectedDimension() {
    const radios = document.getElementsByName("dim");
    for (let r of radios) {
        if (r.checked) return parseInt(r.value);
    }
    return 2;
}

function generateMatrixInputsHTML(name, dim) {
    let html = "";
    for (let r = 0; r < dim; r++) {
        for (let c = 0; c < dim; c++) {
            html += `<input type="number" id="cell_${name}_${r}_${c}" placeholder="0" step="any" inputmode="decimal">`;
        }
    }
    return html;
}

function readMatrix(name, dim) {
    const mat = [];
    for (let r = 0; r < dim; r++) {
        const row = [];
        for (let c = 0; c < dim; c++) {
            const valStr = document.getElementById(`cell_${name}_${r}_${c}`).value;
            const val = valStr === "" ? 0 : parseFloat(valStr);
            if (isNaN(val)) {
                throw new Error(`Invalid Matrix ${name} entry`);
            }
            row.push(val);
        }
        mat.push(row);
    }
    return mat;
}

function matrixAdd(A, B, dim) {
    const res = [];
    for (let r = 0; r < dim; r++) {
        const row = [];
        for (let c = 0; c < dim; c++) {
            row.push(A[r][c] + B[r][c]);
        }
        res.push(row);
    }
    return res;
}

function matrixSub(A, B, dim) {
    const res = [];
    for (let r = 0; r < dim; r++) {
        const row = [];
        for (let c = 0; c < dim; c++) {
            row.push(A[r][c] - B[r][c]);
        }
        res.push(row);
    }
    return res;
}

function matrixMultiply(A, B, dim) {
    const res = [];
    for (let r = 0; r < dim; r++) {
        const row = [];
        for (let c = 0; c < dim; c++) {
            let sum = 0;
            for (let k = 0; k < dim; k++) {
                sum += A[r][k] * B[k][c];
            }
            row.push(sum);
        }
        res.push(row);
    }
    return res;
}

function matrixTranspose(A, dim) {
    const res = [];
    for (let r = 0; r < dim; r++) {
        const row = [];
        for (let c = 0; c < dim; c++) {
            row.push(A[c][r]);
        }
        res.push(row);
    }
    return res;
}

function matrixDet(A, dim) {
    if (dim === 2) {
        return A[0][0] * A[1][1] - A[0][1] * A[1][0];
    } else {
        return A[0][0] * (A[1][1] * A[2][2] - A[1][2] * A[2][1]) -
               A[0][1] * (A[1][0] * A[2][2] - A[1][2] * A[2][0]) +
               A[0][2] * (A[1][0] * A[2][1] - A[1][1] * A[2][0]);
    }
}

function matrixInverse(A, dim) {
    const det = matrixDet(A, dim);
    if (Math.abs(det) < 1e-12) {
        throw new Error("Matrix is singular (det=0), no inverse.");
    }
    
    if (dim === 2) {
        return [
            [ A[1][1] / det, -A[0][1] / det ],
            [-A[1][0] / det,  A[0][0] / det ]
        ];
    } else {
        const adj = [];
        for (let r = 0; r < 3; r++) {
            const adjRow = [];
            for (let c = 0; c < 3; c++) {
                const minor = [];
                for (let i = 0; i < 3; i++) {
                    if (i === c) continue;
                    const minorRow = [];
                    for (let j = 0; j < 3; j++) {
                        if (j === r) continue;
                        minorRow.push(A[i][j]);
                    }
                    minor.push(minorRow);
                }
                const minorDet = minor[0][0] * minor[1][1] - minor[0][1] * minor[1][0];
                const sign = ((c + r) % 2 === 0) ? 1 : -1;
                adjRow.push((sign * minorDet) / det);
            }
            adj.push(adjRow);
        }
        return adj;
    }
}

function renderMatrixResult(res, isScalar, dim) {
    const container = document.getElementById("matResult");
    container.classList.remove("error");
    
    if (isScalar) {
        container.textContent = `det(A) = ${formatNumber(res)}`;
    } else {
        let html = `<div class="result-matrix" style="grid-template-columns: repeat(${dim}, 1fr)">`;
        for (let r = 0; r < dim; r++) {
            for (let c = 0; c < dim; c++) {
                html += `<span>${formatNumber(res[r][c])}</span>`;
            }
        }
        html += `</div>`;
        container.innerHTML = html;
    }
}

document.querySelectorAll("input[name='dim']").forEach(radio => {
    radio.addEventListener("change", () => {
        renderMatrixInputs();
        document.getElementById("matResult").textContent = "—";
        document.getElementById("matResult").classList.remove("error");
    });
});

document.querySelectorAll(".matrix-ops button[data-act='mat']").forEach(btn => {
    btn.addEventListener("click", () => {
        const act = btn.dataset.val;
        const dim = getSelectedDimension();
        const container = document.getElementById("matResult");
        
        try {
            const A = readMatrix("A", dim);
            
            if (act === "det") {
                const det = matrixDet(A, dim);
                renderMatrixResult(det, true, dim);
            } else if (act === "trans") {
                const trans = matrixTranspose(A, dim);
                renderMatrixResult(trans, false, dim);
            } else if (act === "inv") {
                const inv = matrixInverse(A, dim);
                renderMatrixResult(inv, false, dim);
            } else {
                const B = readMatrix("B", dim);
                let res;
                if (act === "add") {
                    res = matrixAdd(A, B, dim);
                } else if (act === "sub") {
                    res = matrixSub(A, B, dim);
                } else if (act === "mul") {
                    res = matrixMultiply(A, B, dim);
                }
                renderMatrixResult(res, false, dim);
            }
        } catch (err) {
            container.textContent = err.message;
            container.classList.add("error");
        }
    });
});

// ===================== LIFECYCLE STATE BRIDGE =====================
window.getState = function() {
    return JSON.stringify({
        expression: currentExpression,
        result: currentResult,
        mode: currentMode,
        angleMode: currentAngleMode
    });
};

window.restoreState = function(jsonStr) {
    try {
        const state = JSON.parse(jsonStr);
        if (state) {
            if (state.expression !== undefined) currentExpression = state.expression;
            if (state.result !== undefined) currentResult = state.result;
            if (state.mode !== undefined) setMode(state.mode);
            if (state.angleMode !== undefined) {
                currentAngleMode = state.angleMode;
                updateAngleButton();
            }
            updateDisplay();
        }
    } catch (e) {
        console.error("Failed to restore state", e);
    }
};

// ===================== INITIALIZATION =====================
renderMatrixInputs();
setMode("basic");
updateDisplay();
updateAngleButton();
