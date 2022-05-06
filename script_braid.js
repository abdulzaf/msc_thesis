//#region INITIALIZATIONS
const container = document.getElementById('main');
const btnPlay = document.getElementById('btn-play');
const DIM = [1024, 682];
const BUFFER = 200;
const DRAT = 40; // px/deg
const SPAN = DIM[0] / DRAT; // deg
const FS = 250;
const DT = 1/FS;
const PCOL = ['#1f77b4', '#bcbd22', '#d62728', '#2ff7f0', '#9467bd']
var NPLAY = 3;
var NCROSS = 5;
var HVEL = 10; // deg/s
var TARVEL = 2 * HVEL / NCROSS ; // deg/s
var DUR = SPAN / TARVEL; // sec
var DX = 0.75 * (DIM[0] - 2*BUFFER) / NPLAY;
var frameI = 0;
var frameP = 0;
var IntervalI;
var IntervalP;

struct_stim = {
}
//#endregion

//#region MAIN
window.onload = function () {
    createDots();
};
//#endregion

//#region INTERFACE FUNCTIONS
// Create/Remove Dots
function createDots() {
    // Ball
    var div = document.createElement("div");
    div.id = 'ball';
    div.classList.add('ball');
    document.getElementById("main").appendChild(div);
    // Players
    for (i = 0; i < NPLAY; i++) {
        var div = document.createElement("div");
        div.id = 'p' + i;
        div.classList.add('player');
        div.style.backgroundColor = PCOL[i];
        document.getElementById("main").appendChild(div);
    }
}
function removeDots() {
    // Ball
    document.getElementById('ball').remove();
    // Players
    for (i = 0; i < NPLAY; i++) {
        document.getElementById('p' + i).remove();
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
function initStim() {
    if (frameI == 1 * FS) {
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
    } else {
        clearInterval(IntervalP);
        // SET TEST CLICK
        container.onclick = function (e) {
            testClick(e);
        };
    }
}
btnPlay.onclick = function () {
    // RESET CANVAS
    container.onclick = null;
    // RESET SCORES
    frameP = 0;
    frameI = 0;
    // REMOVE VISUALS
    removeDots();
    // CREATE VISUALS
    createDots();
    // GENERATE TRIAL
    var braid = generateBraid(NCROSS, NPLAY);
    var XY = generateXY(DIM, BUFFER, NCROSS, NPLAY);
    var traj = generateTraj(braid, XY[0], XY[1], NCROSS, NPLAY);
    var time = generateTime(DT, DUR, NCROSS);
    interPlayers(traj[0], traj[1], time[1], time[0], NPLAY);
    var ballTXY = generateBall(time[1], traj[0], traj[1], DUR, NCROSS, NPLAY);
    interBall(ballTXY[0], ballTXY[1], ballTXY[2], time[0]);
    console.log(braid);

    // START ANIMATION
    clearInterval(IntervalI);
    IntervalI = setInterval(initStim, 1000 / FS);
}
function testClick() {
    for (i = 0; i < NPLAY; i++) {
        // UPDATE DOTS
        e1 = document.getElementById('p' + i);
        e1.style.backgroundColor = PCOL[i];
    }
}
//#endregion

//#region STIMULUS FUNCTIONS
// Create a braid on nPlay strands with nCross crossings
function generateBraid(nCross, nPlay) {
    let braid = [];
    for (i=0; i<nCross; i++) {
        braid.push(Math.floor(Math.random() * (nPlay-1)));
    }
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
    playBraid.push(players)
    console.log(JSON.stringify(players))
    for (c=0; c<nCross; c++) {
        let p1 = braid[c];
        let p2 = braid[c]+1;
        let temp1 = JSON.parse(JSON.stringify(players[p1]));
        let temp2 = JSON.parse(JSON.stringify(players[p2]));
        players[p1] = temp2;
        players[p2] = temp1;
        console.log([p1, p2, JSON.stringify(players)])
        playBraid.push(JSON.parse(JSON.stringify(players)));
    }
    console.log(playBraid)
    for (p=0; p<nPlay; p++) {
        trajY.push([])
        for (c=0; c<X.length; c++) {
            trajY[p].push(Y[playBraid[c][p]])
        }
    }
    console.log(trajY)
    
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
function generateBall(timeO, trajX, trajY, duration, nCross, nPlay) {
    let timeB = makeArr(0, duration, 2*nCross+1);
    let ballSeq = [];
    for (t=0; t<timeB.length; t++) {
        ballSeq.push(Math.floor(nPlay * Math.random()));
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