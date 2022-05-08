//#region INITIALIZATIONS
const container = document.getElementById('main');
const btnPlay = document.getElementById('btn-play');
const btnSave = document.getElementById('btn-save');
const txtIndex = document.getElementById('txt-index');
const txtPlayer = document.getElementById('txt-players');
const txtSwitch = document.getElementById('txt-switches');
const txtTrial = document.getElementById('txt-trial');
const txtBall = document.getElementById('score-ball');
const DIM = [1024, 682];
const BUFFER = 200;
const DRAT = 40; // px/deg
const SPAN = DIM[0] / DRAT; // deg
const FS = 250;
const DT = 1/FS;
const PCOL = ['#0000ff', '#ff0000', '#00ff00', '#ff00ff', '#00ffff', '#ffff00']
const RPLAY = [4,6];
const RCROSS = [4,6];
const NBRAID = 10;
const COMPLEXITY = 16;
const TRIALLIST = [...Array(NBRAID).keys()];
const TRIALORDER = TRIALLIST.sort(() => Math.random() - 0.5);
var NPLAY = RPLAY[1];
var NCROSS = RCROSS[1];
var HVEL = 5; // deg/s
var TARVEL = HVEL; //2 * HVEL / NCROSS ; // deg/s
var DUR = SPAN / TARVEL; // sec
var DX = 0.75 * (DIM[0] - 2*BUFFER) / NPLAY;
var frameI = 0;
var frameP = 0;
var IntervalI;
var IntervalP;
var mousePosition = { 'x': 0, 'y': 0 };
var distArr = [];
var mouseArr = [];
var index = 0;
var trialNo = 0;

struct_stim = {
    'braid': [],
    'braidNo': []
}
struct_scores = {
    'index': [],
    'trial': [],
    'complexity': [],
    'nplay': [],
    'ncross': [],
    'ball': [],
    'score': [],
    'selectID': [],
    'testID': [],
    'stim': [],
    'mouse': []
}
arr_braid = []
//#endregion

//#region MAIN
$(document).bind('mousemove', function (e) {
    mousePosition = { 'x': e.pageX - container.offsetLeft, 'y': e.pageY - container.offsetTop };
});
window.onload = function () {
    initArrBraid();
    loadData();
    createDots();
    createTestDots();

    console.log(arr_braid)
};
//#endregion

//#region DRAW FUNCTIONS
// Create/Remove Dots
function createDots() {
    // Players
    for (i = 0; i < NPLAY; i++) {
        var div = document.createElement("div");
        div.id = 'p' + i;
        div.classList.add('player');
        div.style.backgroundColor = PCOL[i];
        document.getElementById("main").appendChild(div);
    }
    // Ball
    var div = document.createElement("div");
    div.id = 'ball';
    div.classList.add('ball');
    document.getElementById("main").appendChild(div);
}
function createTestDots() {
    // Players
    for (i = 0; i < NPLAY; i++) {
        var div = document.createElement("div");
        div.id = 't' + i;
        div.classList.add('player');
        div.style.backgroundColor = PCOL[i];
        document.getElementById("main").appendChild(div);
    }
    // Ball
    var div = document.createElement("div");
    div.id = 'tball';
    div.classList.add('tball');
    document.getElementById("main").appendChild(div);
}
function removeDots() {
    // Ball
    document.getElementById('ball').remove();
    // Players
    for (i = 0; i < NPLAY; i++) {
        document.getElementById('p' + i).remove();
    }
}
function removeTestDots() {
    // Ball
    document.getElementById('tball').remove();
    // Players
    for (i = 0; i < NPLAY; i++) {
        document.getElementById('t' + i).remove();
    }
}
function drawFrame(t) {
    eB = document.getElementById('ball');
    eB.style.left = struct_stim['ball'][0][t] + "px";
    eB.style.bottom = struct_stim['ball'][1][t] + "px";
    for (i = 0; i < NPLAY; i++) {
        // UPDATE DOTS
        e1 = document.getElementById('p' + i);
        e1.style.left = struct_stim['p'+i][0][t] + "px";
        e1.style.bottom = struct_stim['p'+i][1][t] + "px";
    }
}
function drawTestFrame() {
    eB = document.getElementById('tball');
    eB.style.left = struct_stim['ball'][0][0] + "px";
    eB.style.bottom = struct_stim['ball'][1][0] + "px";
    for (i = 0; i < NPLAY; i++) {
        // UPDATE DOTS
        e1 = document.getElementById('t' + i);
        e1.style.left = struct_stim['p'+i][0][0] + "px";
        e1.style.bottom = struct_stim['p'+i][1][0] + "px";
    }
}
function initStim() {
    if (frameI == 3 * FS) {
        clearInterval(IntervalI);
        clearInterval(IntervalP);
        for (i = 0; i < NPLAY; i++) {
            // UPDATE DOTS
            e1 = document.getElementById('p' + i);
            e1.style.backgroundColor = 'black';
        }
        IntervalP = setInterval(playStim, Math.round(1000 / FS));
    } else {
        drawFrame(0)
        frameI++;
    }
}
function playStim() {
    if (frameP < struct_stim.time.length) {
        drawFrame(frameP)
        frameP++;
        // Check ball position
        bX = struct_stim['ball'][0][frameP];
        bY = DIM[1] - (struct_stim['ball'][1][frameP] + DRAT);
        // Check mouse position
        mX = mousePosition.x;
        mY = mousePosition.y;
        // Store mouse position;
        mouseArr.push([mX,mY]);
        // Get Distance
        dist = Math.sqrt((bX - mX) * (bX - mX) + (bY - mY) * (bY - mY));
        distArr.push(dist);
    } else {
        clearInterval(IntervalP);
        // SET TEST
        createTestDots();
        drawTestFrame();
        // SET TEST CLICK
        /*container.onclick = function (e) {
            testClick();
        };*/
        for (i = 0; i < NPLAY; i++) {
            el = document.getElementById('t' + i);
            el.onclick = function () {
                testClick(this);
            }
        };
    }
}
//#endregion DRAW

//#region INTERFACE
btnPlay.onclick = function () {
    index++;
    trialNo++;
    if (trialNo>NBRAID) {
        console.log(trialNo)
        trialNo = 1;
        // increase # of crosses
        NCROSS++;
        if (NCROSS>RCROSS[1]) {
            NCROSS = RCROSS[0];
            NPLAY++;
        }
    }
    if (NPLAY<=RPLAY[1]) {
        // UPDATE LABELS
        txtIndex.innerHTML = 'INDEX: ' + index;
        txtPlayer.innerHTML = 'PLAYERS: ' + NPLAY;
        txtSwitch.innerHTML = 'SWITCHES: ' + NCROSS;
        txtTrial.innerHTML = 'TRIAL: ' + trialNo;
        // RESET SCORES
        frameP = 0;
        frameI = 0;
        distArr = [];
        mouseArr = [];
        // REMOVE VISUALS
        removeDots();
        removeTestDots();
        // CREATE VISUALS
        createDots();
        // GENERATE TRIAL
        var braid = generateBraid(NPLAY, NCROSS);
        var XY = generateXY(DIM, BUFFER, NCROSS, NPLAY);
        var traj = generateTraj(braid, XY[0], XY[1], NCROSS, NPLAY);
        var time = generateTime(DT, DUR, NCROSS);
        interPlayers(traj[0], traj[1], time[1], time[0], NPLAY);
        var ballTXY = generateBall(time[1], traj[0], traj[1], DUR, braid, NPLAY);
        interBall(ballTXY[0], ballTXY[1], ballTXY[2], time[0]);
        console.log(braid);

        // START ANIMATION
        clearInterval(IntervalI);
        IntervalI = setInterval(initStim, 1000 / FS);
    } else {
        alert('DONE')
    }
}
function testClick(el) {
    for (i = 0; i < NPLAY; i++) {
        // UPDATE DOTS
        tEl = document.getElementById('t' + i);
        tEl.onclick = null;;

        pEl = document.getElementById('p' + i);
        pEl.style.backgroundColor = PCOL[i];
    }
    // UPDATE CLICKED DOT
    playNo = el.id[1];
    el.classList.add('test-sel');

    // Get closest player to ball
    let dBall = [];
    bY = struct_stim['ball'][1][frameP-1];
    for (i = 0; i < NPLAY; i++) {
        pY = struct_stim['p'+i][1][frameP-1];
        dBall.push((pY-bY)*(pY-bY));
    }
    testID = dBall.indexOf(Math.min(...dBall));

    // TEST BALL
    scoreB = 0
    for (i = 0; i < distArr.length; i++) {
        //scoreB += distArr[i]
        if (distArr[i] < 1 * DRAT) {
            scoreB++;
        }
    }

    // UPDATE SCORES
    struct_scores.index.push(index);
    struct_scores.trial.push(trialNo);
    struct_scores.complexity.push(COMPLEXITY);
    struct_scores.nplay.push(JSON.parse(JSON.stringify(NPLAY)));
    struct_scores.ncross.push(JSON.parse(JSON.stringify(NCROSS)));
    struct_scores.ball.push(Math.round(100 * scoreB / distArr.length));
    struct_scores.score.push(playNo==testID);
    struct_scores.selectID.push(playNo);
    struct_scores.testID.push(testID);
    struct_scores.stim.push(JSON.parse(JSON.stringify(struct_stim)));

    // UPDATE INTERFACE
    txtBall.innerHTML = 'BALL: ' + struct_scores.ball[struct_scores.ball.length - 1] + '%';
}
//#endregion INTERFACE

//#region STIMULUS FUNCTIONS
// Create a braid on nPlay strands with nCross crossings
function generateBraid(nPlay, nCross) {
    bNo = TRIALORDER[trialNo];//Math.floor(Math.random() * NBRAID);
    braid = arr_braid[nPlay-1][nCross-1][0][bNo];
    struct_stim.braid = braid;
    struct_stim.braidNo = bNo;
    return braid
}
// Create XY trajectory points based on field dimensions and buffer space
function generateXY(dim, buffer, nCross, nPlay) {
    let PX = makeArr(0, dim[0]-2*buffer, nCross+1);
    let PY = makeArr(0, dim[1]-2*buffer, nPlay);
    PX = PX.map(function(x) { return x + buffer;})
    PY = PY.map(function(y) { return y + buffer;})
    return [PX, PY]
}
// Create individual player trajectories
function generateTraj(braid, X, Y, nCross, nPlay) {
    // X Positions
    let trajX = [];
    for (p=0; p<nPlay; p++) {
        trajX.push([X[0]]);
        // Randomize X Positions
        XC = JSON.parse(JSON.stringify(X));
        for (c=1; c<XC.length-1; c++) {
            let xADJ = (0.5 - Math.random())*DX;
            XC[c] += xADJ;
            trajX[p].push(XC[c]);
        }
        trajX[p].push(X[X.length-1])
    }
    // Y Positions
    let players = [...Array(nPlay).keys()];
    let playBraid = [];
    let trajY = [];
    playBraid.push(JSON.parse(JSON.stringify(players)))
    for (c=0; c<nCross; c++) {
        let p1 = braid[c]-1;
        let p2 = braid[c];
        console.log(p1)
        console.log(p2)
        let temp1 = JSON.parse(JSON.stringify(players[p1]));
        let temp2 = JSON.parse(JSON.stringify(players[p2]));
        players[p1] = temp2;
        players[p2] = temp1;
        console.log([p1, p2, JSON.stringify(players)])
        playBraid.push(JSON.parse(JSON.stringify(players)));
    }
    
    for (p=0; p<nPlay; p++) {
        trajY.push([])
        for (c=0; c<X.length; c++) {
            yID = playBraid[c].indexOf(p);
            trajY[p].push(JSON.parse(JSON.stringify(Y[yID])));
        }
    }
    console.log(trajY)
    console.log(trajY.reverse())
    
    return [trajX, trajY]
}
// Create time arrays
function generateTime(dt, duration, nCross) {
    let time = makeRange(0, duration, dt);
    let timeO = makeArr(0, duration, nCross+1);
    Object.assign(struct_stim, {time: JSON.parse(JSON.stringify(time))});

    return [time, timeO]
}
// Interpolate Players
function interPlayers(PX, PY, timeO, time, nPlay) {
    for (p=0; p<nPlay; p++) {
        let trajX = [];
        let trajY = [];
        var splineX = new MonotonicCubicSpline(timeO, PX[p]);
        var splineY = new MonotonicCubicSpline(timeO, PY[p]);
        for (t=0; t<time.length; t++) {
            trajX.push(splineX.interpolate(time[t]));
            trajY.push(splineY.interpolate(time[t]));
        }
        let keyName = 'p'+p;
        Object.assign(struct_stim, {[keyName]: [JSON.parse(JSON.stringify(trajX)), JSON.parse(JSON.stringify(trajY))]});
    }
}
// Generate Ball
function generateBall(timeO, trajX, trajY, duration, braid, nPlay) {
    let timeB = makeArr(0, duration, braid.length);
    let ballSeq = [];
    for (t=0; t<braid.length; t++) {
        ballSeq.push(nPlay-braid.reverse()[t]);
    }
    
    let ballX = [];
    let ballY = [];
    for (t=0; t<timeB.length; t++) {
        var splineX = new MonotonicCubicSpline(timeO, trajX[ballSeq[t]]);
        var splineY = new MonotonicCubicSpline(timeO, trajY[ballSeq[t]]);
        ballX.push(splineX.interpolate(timeB[t]));
        ballY.push(splineY.interpolate(timeB[t]));
    }
    console.log([ballX, ballY])
    return [timeB, ballX, ballY]
}
// Interpolate Ball
function interBall(timeB, ballX, ballY, time) {
    let trajX = [];
    let trajY = [];
    var splineX = new MonotonicCubicSpline(timeB, ballX);
    var splineY = new MonotonicCubicSpline(timeB, ballY);
    for (t=0; t<time.length; t++) {
        trajX.push(splineX.interpolate(time[t]) + DRAT);
        trajY.push(splineY.interpolate(time[t]));
    }
    Object.assign(struct_stim, {ball: [JSON.parse(JSON.stringify(trajX)), JSON.parse(JSON.stringify(trajY))]});
}

//#endregion

//#region LOAD DATA
function initArrBraid() {
    for (p=0; p<RPLAY[1]; p++) {
        arr_braid.push([]);
        for (c=0; c<RCROSS[1]; c++) {
            arr_braid[p].push([]);
        }
    }
}
function loadData() {
    const url = "https://raw.githubusercontent.com/abdulzaf/msc_thesis/main/braid_data.csv"
    fetch(url)
        .then(r => r.text())
        .then(t => loadFile(t))
}
function loadFile(file) {
    let obj = arrStr2Num(parseCSV(file));
    parseData(obj)
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
function parseData(arr) {
    var pNo = RPLAY[0];
    var cNo = RCROSS[0];
    var bGroup = [];
    for (r=0; r<arr.length; r++) {
        if (isNaN(arr[r][0])) {
            bGroup = [];
            for (b=0; b<NBRAID; b++) {
                bGroup.push(JSON.parse(JSON.stringify(arr[r+b+1].slice(0, cNo))))
            }
            arr_braid[pNo-1][cNo-1].push(JSON.parse(JSON.stringify(bGroup)))

            cNo++;
            if (cNo>RCROSS[1]) {
                cNo = RCROSS[0];
                pNo++;
            }
        }
    }
    console.log(arr_braid)
}
//#endregion

//#region SAVE DATA
btnSave.onclick = function () {
    var blob = new Blob([JSON.stringify(struct_scores)], { type: "text/plain;charset=utf-8" });
    var timeElapsed = Date.now();
    var today = new Date(timeElapsed);
    var fileName = today.toUTCString().replace(',', '').replace(':', '_').replace(':', '_') + '_SCORES.txt';
    console.log(fileName)
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