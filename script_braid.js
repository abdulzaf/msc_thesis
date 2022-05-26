//#region INITIALIZATIONS
const container = document.getElementById('main');
const btnPlay = document.getElementById('btn-play');
const btnSave = document.getElementById('btn-save');
const txtTrial = document.getElementById('txt-trial');
const txtScore = document.getElementById('score-play');
const DIM = [1024, 682];
const BUFFER = 200;
const DRAT = 40; // px/deg
const SPAN = DIM[0] / DRAT; // deg
const FS = 250;
const DT = 1/FS;
const PCOL = ['#0000ff', '#ff0000', '#00ff00', '#ff00ff', '#00ffff', '#ffff00']
const NPLAY = 6;
const NCROSS = 12;
const NBRAID = 20;
const NTRACK = 2;
const LVLGROUP = ['Lo', 'Hi'];
const LVLPLAY = ['Lo', 'Mix', 'Hi'];
const TRIALLIST = [...Array(NBRAID*LVLGROUP.length*LVLPLAY.length).keys()].reverse();
const TRIALORDER = TRIALLIST;//TRIALLIST.sort(() => Math.random() - 0.5);
var CONDLIST = [];
var TARVEL = 4; // deg/s
var DUR = SPAN / TARVEL; // sec
var DX = 0.75 * (DIM[0] - 2*BUFFER) / NPLAY;
var frameI = 0;
var frameP = 0;
var IntervalI;
var IntervalP;
var index = 0;
var trialNo = 0;

struct_stim = {
    'lvl_group': [],
    'id_play': [],
    'braid': []
}
struct_scores = {
    'trial': [],
    'lvl_group': [],
    'lvl_play': [],
    'score': [],
    'trackID': [],
    'selectID': [],
    'testID': [],
    'braid': []
}
//#endregion

//#region MAIN
window.onload = function () {
    initConditions();
    loadData();
    createDots();
    createTestDots();
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
        div.innerHTML = i+1;
        //div.style.backgroundColor = PCOL[i];
        document.getElementById("main").appendChild(div);
    }
}
function createTestDots() {
    // Players
    for (i = 0; i < NPLAY; i++) {
        var div = document.createElement("div");
        div.id = 't' + i;
        div.classList.add('player');
        div.innerHTML = i+1;
        //div.style.backgroundColor = PCOL[i];
        document.getElementById("main").appendChild(div);
    }
}
function removeDots() {
    // Players
    for (i = 0; i < NPLAY; i++) {
        document.getElementById('p' + i).remove();
    }
}
function removeTestDots() {
    // Players
    for (i = 0; i < NPLAY; i++) {
        document.getElementById('t' + i).remove();
    }
}
function drawFrame(t) {
    for (i = 0; i < NPLAY; i++) {
        // UPDATE DOTS
        e1 = document.getElementById('p' + i);
        e1.style.left = struct_stim['p'+i][0][t] + "px";
        e1.style.bottom = struct_stim['p'+i][1][t] + "px";
    }
}
function drawTestFrame() {
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
            el = document.getElementById('p' + i);
            el.classList.remove('track');
            el.classList.add('move');
        }
        IntervalP = setInterval(playStim, Math.round(1000 / FS));
    } else {
        // GET PLAYERS TO TRACK
        pID = struct_scores.trackID[struct_scores.trackID.length-1];
        for (i = 0; i < NTRACK; i++) {
            // UPDATE DOTS
            el = document.getElementById('p' + (pID[i]-1));
            el.classList.add('track');
        }
        drawFrame(0)
        frameI++;
    }
}
function playStim() {
    if (frameP < struct_stim.time.length) {
        drawFrame(frameP)
        frameP++;
    } else {
        clearInterval(IntervalP);
        // SET TEST
        createTestDots();
        drawTestFrame();
        pID = struct_scores.trackID[struct_scores.trackID.length-1];
        for (i = 0; i < NTRACK; i++) {
            // UPDATE DOTS
            el = document.getElementById('t' + (pID[i]-1));
            el.classList.add('track');
        }
        // SET TEST CLICK
        for (i = 0; i < NTRACK; i++) {
            el = document.getElementById('t' + (pID[i]-1));
            el.onclick = function () {
                testClickTest(this);
            }
        };
    }
}
//#endregion DRAW

//#region INTERFACE
btnPlay.onclick = function () {
    index++;
    trialNo++;
    if (trialNo<=TRIALLIST.length) {
        // UPDATE LABELS
        txtTrial.innerHTML = 'TRIAL: ' + trialNo;
        txtScore.innerHTML = 'SCORE: __';
        // RESET SCORES
        frameP = 0;
        frameI = 0;
        // REMOVE VISUALS
        removeDots();
        removeTestDots();
        // CREATE VISUALS
        createDots();
        // INIT SCORE STRUCT FOR TRIAL
        bNo = CONDLIST[TRIALORDER[trialNo]][0];
        pLvl = CONDLIST[TRIALORDER[trialNo]][1];
        pID = struct_stim.id_play[bNo][pLvl];
        struct_scores.trackID.push(pID);
        struct_scores.testID.push([])
        struct_scores.selectID.push([])
        // GENERATE TRIAL
        var braid = generateBraid(NPLAY, NCROSS);
        var XY = generateXY(DIM, BUFFER, NCROSS, NPLAY);
        var traj = generateTraj(braid, XY[0], XY[1], NCROSS, NPLAY);
        var time = generateTime(DT, DUR, NCROSS);
        interPlayers(traj[0], traj[1], time[1], time[0], NPLAY);

        // START ANIMATION
        clearInterval(IntervalI);
        IntervalI = setInterval(initStim, 1000 / FS);
    } else {
        alert('DONE')
    }
}
function testClickTest(el) {
    playNo = el.id[1];
    el.classList.add('test-sel');
    console.log(playNo)
    // STORE CLICK
    struct_scores.testID[struct_scores.testID.length-1].push(playNo);
    // REMOVE CLICK FOR TESTS + SET CLICK FOR PLAYERS
    for (i = 0; i < NPLAY; i++) {
        elT = document.getElementById('t' + i);
        elT.onclick = null;
        el = document.getElementById('p' + i);
        el.onclick = function () {
            testClickPlay(this);
        }
    };
}
function testClickPlay(el) {
    playNo = el.id[1];
    el.classList.add('test-sel');
    console.log(playNo)
    // STORE CLICK
    struct_scores.selectID[struct_scores.selectID.length-1].push(playNo);
    // REMOVE CLICK FOR PLAYERS
    for (i = 0; i < NPLAY; i++) {
        elP = document.getElementById('p' + i);
        elP.onclick = null;
    };
    // CHECK IF TEST PHASE IS COMPLETE
    if (struct_scores.selectID[struct_scores.selectID.length-1].length==NTRACK) {
        for (i = 0; i < NPLAY; i++) {
            // UPDATE DOTS
            el = document.getElementById('p' + i);
            el.classList.remove('track');
            el.classList.remove('move');
        }
        // UPDATE SCORES
        let score = getScore();
        let bNo = CONDLIST[TRIALORDER[trialNo]][0];
        struct_scores.trial.push(trialNo);
        struct_scores.lvl_group.push(struct_stim.lvl_group[bNo]);
        struct_scores.lvl_play.push(CONDLIST[TRIALORDER[trialNo]][1]);
        struct_scores.score.push(score);
        struct_scores.braid.push(struct_stim.braid[bNo]);
        // UPDATE UI
        txtScore.innerHTML = 'SCORE: ' + score;
    } else {
        // SET CLICK FOR TESTS
        pID = struct_scores.trackID[struct_scores.trackID.length-1];
        for (i = 0; i < NTRACK; i++) {
            el = document.getElementById('t' + (pID[i]-1));
            el.onclick = function () {
                testClickTest(this);
            }
        };
    }
}
function getScore() {
    idTest = struct_scores.testID[struct_scores.testID.length-1];
    idSel = struct_scores.selectID[struct_scores.selectID.length-1];
    let scoreI = 0;
    for (i=0; i<NTRACK; i++) {
        el = document.getElementById('p' + idSel[i]);
        if (idTest[i]==idSel[i]) {
            score++;
            el.classList.add('test-cor');
        } else {
            el.classList.add('test-inc');
        }
    }
    return score
}
//#endregion INTERFACE

//#region STIMULUS FUNCTIONS
// Create a braid on nPlay strands with nCross crossings
function generateBraid() {
    bNo = CONDLIST[TRIALORDER[trialNo]][0];
    pLvl = CONDLIST[TRIALORDER[trialNo]][1];
    braid = struct_stim.braid[bNo];
    pID = struct_stim.id_play[bNo][pLvl];
    gLvl = struct_stim.lvl_group[bNo];
    console.log([braid, gLvl, pID])
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
            let xADJ = (0.5 - Math.random())*DX/2;
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
        let temp1 = JSON.parse(JSON.stringify(players[p1]));
        let temp2 = JSON.parse(JSON.stringify(players[p2]));
        players[p1] = temp2;
        players[p2] = temp1;
        playBraid.push(JSON.parse(JSON.stringify(players)));
    }
    
    for (p=0; p<nPlay; p++) {
        trajY.push([])
        for (c=0; c<X.length; c++) {
            yID = playBraid[c].indexOf(p);
            trajY[p].push(JSON.parse(JSON.stringify(Y[yID])));
        }
    }
    
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

//#endregion

//#region LOAD DATA
function initConditions() {
    for (i=0; i<NBRAID*LVLGROUP.length; i++) {
        for (j=0; j<LVLPLAY.length; j++) {
            CONDLIST.push([i, j])
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
    for (r=0; r<arr.length; r++) {
        let lvl = arr[r][1];
        let braid = arr[r].slice(2, 2+NCROSS);
        let pID = [
            [arr[r][14], arr[r][15]],
            [arr[r][16], arr[r][17]],
            [arr[r][18], arr[r][19]],
        ];
        struct_stim.lvl_group.push(lvl);
        struct_stim.id_play.push(pID);
        struct_stim.braid.push(braid);
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