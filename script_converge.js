const container = document.getElementById('main');
const btnPlay = document.getElementById('btn-play');
const FS = 250;
const NPLAY = 3;
const NBALL = 8;
const BRAD = 60;
const PRAD = 250;
const PRANGE = 0;
const DIM = [1024, 682];
const AREA = 600;
const DEGRAT = 40; // pxl/deg
const VEL = 10; // deg/s
const DXY = (DEGRAT * VEL) / 1000; // pxl/ms
var ballNo = 0;
var tView = 0; // milliseconds
var tAnim = 0; // milliseconds
var Interval;
var playXY = [[[], []], [[], []], [[], []]];
var playTheta = [[], [], []];

//#region MAIN
window.onload = function () {
    createDots();
};
//#endregion

//#region DRAW FUNCTIONS
// Create/Remove Dots
function createDots() {
    // Balls
    for (i = 0; i < NBALL; i++) {
        var div = document.createElement("div");
        div.id = 'b' + i;
        div.classList.add('ball');
        div.classList.add('hidden');
        document.getElementById("main").appendChild(div);
    }
    // Players
    for (i = 0; i < NPLAY; i++) {
        var div = document.createElement("div");
        div.id = 'p' + i;
        div.classList.add('player');
        div.innerHTML = i + 1;
        document.getElementById("main").appendChild(div);
    }
}
function initDots() {
    // Balls
    for (i = 0; i < NBALL; i++) {
        let theta = i * 2 * Math.PI / NBALL;
        el = document.getElementById('b' + i);
        el.style.left = DIM[0] / 2 + Math.cos(theta) * BRAD + "px";
        el.style.top = DIM[1] / 2 + Math.sin(theta) * BRAD + "px";
    }
    // Players
    ballNo = Math.floor(Math.random() * NBALL); // Select a Ball
    console.log(ballNo)
    let thetaBall = ballNo * 2 * Math.PI / NBALL;
    let thetaP0 = Math.random() * 2 * Math.PI;
    let thetaDiff = Math.PI / 6 + Math.random() * Math.PI / 6;
    console.log(thetaDiff)
    let thetaArr = [thetaP0,
        thetaP0 + thetaDiff,
        thetaP0 - thetaDiff];
    let ballX = DIM[0] / 2 + Math.cos(thetaBall) * BRAD;
    let ballY = DIM[1] / 2 + Math.sin(thetaBall) * BRAD;
    for (i = 0; i < NPLAY; i++) {
        playXY[i][0] = DIM[0] / 2 + Math.cos(thetaArr[i]) * (PRAD + Math.random() * PRANGE);
        playXY[i][1] = DIM[1] / 2 + Math.sin(thetaArr[i]) * (PRAD + Math.random() * PRANGE);
        playTheta[i] = Math.atan2(ballY - playXY[i][1], ballX - playXY[i][0]);

        el = document.getElementById('p' + i);
        el.style.left = playXY[i][0] + "px";
        el.style.top = playXY[i][1] + "px";
    }
}
function removeDots() {
    // Ball
    for (i = 0; i < NBALL; i++) {
        document.getElementById('b' + i).remove();
    }
    // Players
    for (i = 0; i < NPLAY; i++) {
        document.getElementById('p' + i).remove();
    }
}
function drawFrame(tAnim) {
    for (i = 0; i < NPLAY; i++) {
        el = document.getElementById('p' + i);
        el.style.left = playXY[i][0] + Math.cos(playTheta[i]) * DXY * tAnim + "px";
        el.style.top = playXY[i][1] + Math.sin(playTheta[i]) * DXY * tAnim + "px";
    }
}
function initStim() {
    if (tAnim < tView) {
        drawFrame(tAnim);
        tAnim += 1000 / FS;
    } else {
        for (i = 0; i < NBALL; i++) {
            let el = document.getElementById('b' + i);
            el.classList.remove('hidden');
            // SET TEST CLICK
            el.onclick = function () {testConverge(this)};
        }
        clearInterval(Interval);
    }
}

//#region INTERFACE
btnPlay.onclick = function () {
    // REMOVE VISUALS
    removeDots();
    // CREATE VISUALS
    createDots();
    initDots();
    tAnim = 0;
    tView = 100;
    // START ANIMATION
    clearInterval(Interval);
    Interval = setInterval(initStim, 10000 / FS);
}
//#endregion

//#region TEST
function testConverge(el) {
    testNo = el.id[1];
    console.log(testNo)
    //el.classList.add('test-sel');
}
//#endregion