const container = document.getElementById('main');
const btnPlay = document.getElementById('btn-play');
const btnSave = document.getElementById('btn-save');
const FS = 250;
const NPLAY = 2;
const NBALL = 1;
const DIM = [1024, 682];
const AREA = 600;
const PRAD = 300;
const DEGRAT = 40; // pxl/deg
const ANGLES = [1 * Math.PI / 4, 2 * Math.PI / 4, 3 * Math.PI / 4, 4 * Math.PI / 4]
const VIEWCOND = ['FREE', 'FIX', 'OVERT', 'COVERT'];
const VIEWTIME = [250, 500, 750]; // milliseconds
const PREPTIME = 2000; // milliseconds
const SPEED = 4; // deg/s 
const SPEEDRATIO = [0.5, 0.75, 1.25, 1.5];
const DXY = (DEGRAT * SPEED) / 1000; // pxl/ms
var ballNo = 0;
var tPrep = 0; // milliseconds
var tAnim = 0; // milliseconds
var standard;
var view_time;
var speed_ratio;
var obj_angle;
var Interval;

var struct_scores = {
    'timestamp': [],
    'trial': [],
    'view_time': [],
    'view_cond': [],
    'obj_angle': [],
    'speed_ratio': [],
    'standard': [],
    'select': [],
    'accuracy': []
}

//#region MAIN
window.onload = function () {
    createDots();
};
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
        div.innerHTML = i + 1;
        document.getElementById("main").appendChild(div);
    }
}
function initDotPositions(obj_angle) {
    // Balls
    el = document.getElementById('b');
    el.style.left = DIM[0] / 2 + "px";
    el.style.top = DIM[1] / 2 + "px";
    // Players
    for (i = 0; i < NPLAY; i++) {
        el = document.getElementById('p' + i);
        el.style.left = DIM[0] / 2 + PRAD * Math.cos(i * obj_angle) + "px";
        el.style.top = DIM[1] / 2 + PRAD * Math.sin(i * obj_angle) + "px";
    }
}
function initDotConfig(view_cond, speed_ratio, standard) {
    let alternative = -1 * standard + 1;
    if (view_cond == "FIX") {
        document.getElementById('b').classList.add('track');
    }
    else if (view_cond == "OVERT") {
        if (speed_ratio < 1) {
            document.getElementById('p' + standard).classList.add('track');
        } else {
            document.getElementById('p' + alternative).classList.add('track');
        }
    }
    else if (view_cond == "COVERT") {
        if (speed_ratio > 1) {
            document.getElementById('p' + standard).classList.add('track');
        } else {
            document.getElementById('p' + alternative).classList.add('track');
        }
    }
    document.getElementById('b').classList.add('prep');
    document.getElementById('p0').classList.add('prep');
    document.getElementById('p1').classList.add('prep');
    console.log([view_cond, speed_ratio, standard])
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
        if (i == standard) {
            el.style.left = DIM[0] / 2 + (PRAD - DXY * tAnim) * Math.cos(i * obj_angle) + 'px';
            el.style.top = DIM[1] / 2 + (PRAD - DXY * tAnim) * Math.sin(i * obj_angle) + "px";
        } else {
            el.style.left = DIM[0] / 2 + (PRAD - DXY * tAnim * speed_ratio) * Math.cos(i * obj_angle) + 'px';
            el.style.top = DIM[1] / 2 + (PRAD - DXY * tAnim * speed_ratio) * Math.sin(i * obj_angle) + "px";
        }
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
            for (i = 0; i < NPLAY; i++) {
                el = document.getElementById('p' + i);
                el.onclick = function () {
                    testConverge(this);
                }
            }
            clearInterval(Interval);
        }
    }
}

//#region INTERFACE
btnPlay.onclick = function () {
    // REMOVE VISUALS
    removeDots();
    // CREATE VISUALS
    createDots();
    // SET TRIAL PARAMETERS
    // Set View Time
    view_time = VIEWTIME[Math.floor(Math.random() * VIEWTIME.length)];
    // Set Speed Ratio
    speed_ratio = SPEEDRATIO[Math.floor(Math.random() * SPEEDRATIO.length)];
    // Set Standard Target
    standard = Math.round(Math.random());
    // Set View Condition
    var view_cond = VIEWCOND[Math.floor(Math.random() * VIEWCOND.length)];
    // Set Approach Angle
    let orient = Math.round(Math.random()) * 2 - 1;
    obj_angle = orient * ANGLES[Math.floor(Math.random() * ANGLES.length)];
    // SET TRIAL SCENE
    initDotPositions(obj_angle);
    initDotConfig(view_cond, speed_ratio, standard);
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

    // START ANIMATION
    clearInterval(Interval);
    Interval = setInterval(initStim, 1000 / FS);
}
//#endregion

//#region TEST
function testConverge(el) {
    testNo = el.id[1];
    let accurate = 0;
    if (testNo == standard) {
        if (speed_ratio < 1) {
            el.classList.add('test-cor');
            accurate = 1;
        } else {
            el.classList.add('test-inc');
        }
    } else {
        if (speed_ratio > 1) {
            el.classList.add('test-cor');
            accurate = 1;
        } else {
            el.classList.add('test-inc');
        }
    }

    // ACCUMULATE SCORES
    struct_scores.select.push(parseInt(testNo));
    struct_scores.accuracy.push(accurate);
    console.log(struct_scores);
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