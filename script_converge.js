const container = document.getElementById('main');
const btnPlay = document.getElementById('btn-play');
const btnSave = document.getElementById('btn-save');
const txtCond = document.getElementById('condition');
const FS = 250;
const NPLAY = 2;
const NBALL = 1;
const DIM = [1024, 682];
const AREA = 600;
const PRAD = 250;
const PRANGE = 50;
const DEGRAT = 40; // pxl/deg
const ANGLES = [16 * Math.PI / 16]
const VIEWCOND = ['FIX', 'OVERT', 'COVERT'];
const VIEWTIME = [150]; // milliseconds
const PREPTIME = 3500; // milliseconds
const SPEED = 5; // deg/s
const SPEEDRANGE = 2;
const SPEEDRATIO = [0.9];
const NTRIAL = 5;
var TRIALCOMBOS = VIEWTIME.flatMap(f => ANGLES.flatMap(d => VIEWCOND.map(v => [f, d, v]))).sort(() => Math.random() - 0.5);
var blockNo = 0;
var trialNo = 0;
var ballNo = 0;
var tPrep = 0; // milliseconds
var tAnim = 0; // milliseconds
var play_dist = [0, 0];
var play_speed = [0, 0];
var play_ttc = [0, 0];
var standard;
var alternative;
var view_time;
var view_cond;
var speed_ratio;
var obj_angle;
var Interval;
var test_phase = false;
var scores = [0,0,0];

var struct_scores = {
    'timestamp': [],
    'trial': [],
    'view_time': [],
    'view_cond': [],
    'obj_angle': [],
    'speed_ratio': [],
    'standard': [],
    'distances': [],
    'speeds': [],
    'ttc': [],
    'select': [],
    'accuracy': [],
    'response': []
}

//#region MAIN
window.onload = function () {
    createDots();
};
window.addEventListener('keydown', function (e) { 
    if (e.key==" ") {
        startTrial()
    } else {
        testConverge(e)
    }}, false);
//#endregion

//#region DRAW FUNCTIONS
// Create/Remove Dots
function createDots() {
    // Balls
    var div = document.createElement("div");
    div.id = 'b';
    div.classList.add('object');
    document.getElementById("main").appendChild(div);
    // Players
    for (i = 0; i < NPLAY; i++) {
        var div = document.createElement("div");
        div.id = 'p' + i;
        div.classList.add('object');
        div.classList.add('player');
        div.classList.add('player-' + (i + 1));
        div.innerHTML = i;
        document.getElementById("main").appendChild(div);
    }
}
function initDotPositions() {
    // Balls
    el = document.getElementById('b');
    el.style.left = DIM[0] / 2 + "px";
    el.style.top = DIM[1] / 2 + "px";
    // Players
    for (i = 0; i < NPLAY; i++) {
        el = document.getElementById('p' + i);
        el.style.left = DIM[0] / 2 + play_dist[i] * Math.cos(i * obj_angle) + "px";
        el.style.top = DIM[1] / 2 + play_dist[i] * Math.sin(i * obj_angle) + "px";
    }
}
function initDotConfig() {
    if (view_cond == "FIX") {
        document.getElementById('b').classList.add('track');
    } else if (view_cond == "OVERT") {
        if (play_ttc[0] < play_ttc[1]) {
            document.getElementById('p0').classList.add('track');
        } else {
            document.getElementById('p1').classList.add('track');
        }
    } else if (view_cond == "COVERT") {
        if (play_ttc[0] > play_ttc[1]) {
            document.getElementById('p0').classList.add('track');
        } else {
            document.getElementById('p1').classList.add('track');
        }
    }
    document.getElementById('b').classList.add('prep');
    document.getElementById('p0').classList.add('prep');
    document.getElementById('p1').classList.add('prep');
}
function removeDots() {
    // Ball
    document.getElementById('b').remove();
    // Players
    for (i = 0; i < NPLAY; i++) {
        document.getElementById('p' + i).remove();
    }
}
function drawFrame(tAnim) {
    for (i = 0; i < NPLAY; i++) {
        el = document.getElementById('p' + i);
        el.style.left = DIM[0] / 2 + (play_dist[i] - ((DEGRAT * play_speed[i]) / 1000) * tAnim) * Math.cos(i * obj_angle) + 'px';
        el.style.top = DIM[1] / 2 + (play_dist[i] - ((DEGRAT * play_speed[i]) / 1000) * tAnim) * Math.sin(i * obj_angle) + "px";
    }
}
function initStim() {
    if (tPrep < PREPTIME) {
        tPrep += 1000 / FS;
    } else {
        document.getElementById('b').classList.remove('prep');
        document.getElementById('p0').classList.remove('prep');
        document.getElementById('p1').classList.remove('prep');
        document.getElementById('b').classList.remove('track');
        document.getElementById('p0').classList.remove('track');
        document.getElementById('p1').classList.remove('track');
        if (tAnim < view_time) {
            drawFrame(tAnim);
            tAnim += 1000 / FS;
        } else {
            test_phase = true;
            document.getElementById('p0').classList.add('hide')
            document.getElementById('p1').classList.add('hide')

            clearInterval(Interval);
        }
    }
}

//#region INTERFACE
function startTrial() {
    if (TRIALCOMBOS.length == 0) {
        blockNo++;
        TRIALCOMBOS = VIEWTIME.flatMap(f => ANGLES.flatMap(d => VIEWCOND.map(v => [f, d, v]))).sort(() => Math.random() - 0.5);
    }
    if (blockNo < NTRIAL) {
        trialNo++;
        btnPlay.innerHTML = 'Play : ' + trialNo;
        // REMOVE VISUALS
        removeDots();
        // CREATE VISUALS
        createDots();
        // SET TRIAL PARAMETERS
        txtCond.innerHTML = TRIALCOMBOS[TRIALCOMBOS.length - 1];
        // Set View Time
        view_time = TRIALCOMBOS[TRIALCOMBOS.length - 1][0];//VIEWTIME[Math.floor(Math.random() * VIEWTIME.length)];
        // Set Speed Ratio
        speed_ratio = SPEEDRATIO[Math.floor(Math.random() * SPEEDRATIO.length)];
        // Set Standard
        standard = Math.round(Math.random());
        alternative = -1 * standard + 1;
        // Set Distances
        play_dist = [Math.random() * PRANGE + PRAD, Math.random() * PRANGE + PRAD];
        // Set Speeds
        play_speed[standard] = Math.random() * SPEEDRANGE + SPEED;
        play_speed[alternative] = play_speed[standard] * speed_ratio;
        // Set TTC
        play_ttc = [play_dist[0] / play_speed[0], play_dist[1] / play_speed[1]];
        // Set View Condition
        view_cond = TRIALCOMBOS[TRIALCOMBOS.length - 1][2];//VIEWCOND[Math.floor(Math.random() * VIEWCOND.length)];
        // Set Approach Angle
        let orient = Math.round(Math.random()) * 2 - 1;
        obj_angle = orient * TRIALCOMBOS[TRIALCOMBOS.length - 1][1];//ANGLES[Math.floor(Math.random() * ANGLES.length)];
        // UPDATE TRIAL LIST
        TRIALCOMBOS.pop();
        // SET TRIAL SCENE
        initDotPositions();
        initDotConfig();
        // RESET TIME
        tPrep = 0;
        tAnim = 0;
        // CAPTURE SYSTEM TIME
        var timestamp = new Date();
        var time = timestamp.getHours() + ":" +
            timestamp.getMinutes() + ":" +
            timestamp.getSeconds() + "." +
            timestamp.getMilliseconds();
        // INITIATE SCORE STRUCT
        struct_scores.timestamp.push(time);
        struct_scores.trial.push(struct_scores.trial.length);
        struct_scores.view_time.push(view_time);
        struct_scores.view_cond.push(view_cond);
        struct_scores.obj_angle.push(obj_angle);
        struct_scores.speed_ratio.push(speed_ratio);
        struct_scores.standard.push(standard);
        struct_scores.distances.push(play_dist);
        struct_scores.speeds.push(play_speed);
        struct_scores.ttc.push(play_ttc);

        // START ANIMATION
        clearInterval(Interval);
        Interval = setInterval(initStim, 1000 / FS);
    }
}
//#endregion

//#region TEST
function testConverge(e) {
    if (test_phase) {
        let accurate = 0;
        if (e.key == standard) {
            if (speed_ratio < 1) {
                document.getElementById('b').classList.add('test-cor');
                accurate = 1;
            } else {
                document.getElementById('b').classList.add('test-inc');
            }
        } else {
            if (speed_ratio > 1) {
                document.getElementById('b').classList.add('test-cor');
                accurate = 1;
            } else {
                document.getElementById('b').classList.add('test-inc');
            }
        }

        // ACCUMULATE SCORES
        struct_scores.select.push(parseInt(e.key));
        struct_scores.accuracy.push(accurate);

        test_phase = false;

        // LOG SCORES
        if (view_cond=="FIX") {
            scores[0]+=accurate;
        } else if (view_cond=="OVERT") {
            scores[1]+=accurate;
        } else if (view_cond=="COVERT") {
            scores[2]+=accurate;
        }
        console.log(scores)
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