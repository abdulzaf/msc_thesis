//#region INITIALIZATIONS
const container = document.getElementById('main');
const btnPlay = document.getElementById('btn-play');
const btnSave = document.getElementById('btn-save');
const txtTrial = document.getElementById('txt-trial');
const txtScore = document.getElementById('score-play');
const DIM = [1400, 932];
const BUFFER = [200, 200];
const DRAT = 40; // px/deg
const SPAN = DIM[0] / DRAT; // deg
const FS = 250;
const DT = 1/FS;
const NPLAY = 3;
const NCROSS = 8;
const NBRAID = 10;
const LVLGROUP = ['Lo', 'Hi'];
const TRIALLIST = [...Array(NBRAID*LVLGROUP.length).keys()];
const TRIALORDER = TRIALLIST.sort(() => Math.random() - 0.5);

struct_data = {
    'level': [],
    'xy_play': [],
    'xy_ball': []
}
//#endregion

//#region MAIN
window.onload = function () {
    initStruct();
    loadData();
    console.log(struct_data)
};
//#endregion

//#region LOAD DATA
function initStruct() {
    for (i=0; i<TRIALLIST.length; i++) {
        struct_data.level.push(0)
        struct_data.xy_ball.push([[],[]])
        struct_data.xy_play.push([[[],[]],[[],[]],[[],[]]])
    }
}

function loadData() {
    const urlPlay = "https://raw.githubusercontent.com/abdulzaf/msc_thesis/main/data_play.csv"
    const urlBall = "https://raw.githubusercontent.com/abdulzaf/msc_thesis/main/data_ball.csv"
    fetch(urlPlay)
        .then(r => r.text())
        .then(t => loadPlayFile(t))
    fetch(urlBall)
        .then(r => r.text())
        .then(t => loadBallFile(t))
}
function loadPlayFile(file) {
    let obj = arrStr2Num(parseCSV(file));
    parsePlayData(obj)
}
function loadBallFile(file) {
    let obj = arrStr2Num(parseCSV(file));
    parseBallData(obj)
}
function parseCSV(str) {
    var arr = [];
    var quote = false;  // 'true' means we're inside a quoted field

    // Iterate over each character, keep track of current row and column (of the returned array)
    for (var row = 0, col = 0, c = 0; c < str.length; c++) {
        var cc = str[c], nc = str[c + 1];        // Current character, next character
        arr[row] = arr[row] || [];             // Create a new row if necessary
        arr[row][col] = arr[row][col] || '';   // Create a new column (start with empty string) if necessary

        // If it's a comma and we're not in a quoted field, move on to the next column
        if (cc == ',') { ++col; continue; }

        // If it's a newline (CRLF) and we're not in a quoted field, skip the next character
        // and move on to the next row and move to column 0 of that new row
        if (cc == '\r' && nc == '\n' && !quote) { ++row; col = 0; ++c; continue; }

        // If it's a newline (LF or CR) and we're not in a quoted field,
        // move on to the next row and move to column 0 of that new row
        if (cc == '\n' && !quote) { ++row; col = 0; continue; }
        if (cc == '\r' && !quote) { ++row; col = 0; continue; }

        // Otherwise, append the current character to the current column
        arr[row][col] += cc;
    }
    return arr;
}
function arrStr2Num(arr) {
    for (i = 0; i < arr.length; i++) {
        arr[i] = arr[i].map(Number)
    }
    return arr
}
function parsePlayData(arr) {
    for (r=0; r<arr.length; r++) {
        let tNo = arr[r][1];
        let lvl = arr[r][2];
        let pNo = arr[r][3];
        let dim = arr[r][4];
        let coord = arr[r].slice(5);
        struct_data.level[tNo-1] = lvl;
        struct_data.xy_play[tNo-1][pNo][dim] = coord;
    }
}
function parseBallData(arr) {
    for (r=0; r<arr.length; r++) {
        let tNo = arr[r][1];
        let dim = arr[r][4];
        let coord = arr[r].slice(5);
        struct_data.xy_ball[tNo-1][dim] = coord;
    }
}
//#endregion

//#region SAVE DATA
btnSave.onclick = function () {
    var blob = new Blob([JSON.stringify(struct_scores)], { type: "text/plain;charset=utf-8" });
    var timeElapsed = Date.now();
    var today = new Date(timeElapsed);
    var fileName = today.toUTCString().replace(',', '').replace(':', '_').replace(':', '_') + '_SCORES.txt';
    saveAs(blob, fileName);
}
//#endregion

//#region GENERAL FUNCTIONS
function makeArr(startValue, stopValue, cardinality) {
    var arr = [];
    var step = (stopValue - startValue) / (cardinality - 1);
    for (var i = 0; i < cardinality; i++) {
      arr.push(startValue + (step * i));
    }
    return arr;
}
function makeRange(from, to, step) {
    return [...Array(Math.floor((to - from) / step) + 1)].map((_, i) => from + i * step);
}
// Shannon entropy in bits per symbol.
function calcEntropy(str) {
    const len = str.length
   
    // Build a frequency map from the string.
    const frequencies = Array.from(str)
      .reduce((freq, c) => (freq[c] = (freq[c] || 0) + 1) && freq, {})
   
    // Sum the frequency of each character.
    return Object.values(frequencies)
      .reduce((sum, f) => sum - f/len * Math.log2(f/len), 0)
  }
//#endregion 

//    var mySpline = new MonotonicCubicSpline([0,5,10,15,20,25], [0,6,2,6,7,10]);
//console.log(mySpline.interpolate(3));