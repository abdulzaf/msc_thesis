//#region INITIALIZATIONS
const container = document.getElementById('main');
const btnPlay = document.getElementById('btn-play');
const btnSave = document.getElementById('btn-save');
const txtBall = document.getElementById('score-ball');
const txtTeam = document.getElementById('score-team');
const txtTeamAdj = document.getElementById('score-team-adj');
const txtLevel = document.getElementById('txt-level');
const txtTrial = document.getElementById('txt-trial');
const DIM = [1024, 682];
const TARVEL = 320;
const RAD = 10;
const BRAD = 10;
const FS = 250;
const DT = 1000 / FS;
const WIN = [20, 30];
const WINF = [1, 2];
const NPLAY = 11;
const TSET = 1;
const FBALL = '#ffffff';
const FBLANK = '#000000'
const FTEAM1 = 'blue';
const FTEAM2 = 'red';
const SCOL = '#000000';
const SWIDTH = 2;
var trialNo = 0;
var IntervalS;
var IntervalP;
var IntervalF;
var frame = 0;
var frameI = 0;
var score = 0;
var scoreA = 0;
var nclick = 0;
var distArr = [];
var mousePosition = { 'x': 0, 'y': 0 };

struct_scores = {
    'ball': [],
    'team': [],
    'ball-player': [],
    'ball-mouse': []
}
struct_play = {
    'id': [],
    'time': [],
    'ball': [],
    'team1': [],
    'team2': []
}
struct_stim = {
    'id': 0,
    'start': 0,
    'end': 0
}
struct_test = {
    'team': 0,
    'player': 0
}
// ADD DIVS
// Ball
function removeDots() {
    document.getElementById("ball").remove();
    // Players
    for (t = 0; t < 2; t++) {
        for (i = 0; i < NPLAY; i++) {
            document.getElementById('d_' + t + '_' + i).remove();
        }
    }
}
function createDots() {
    var div = document.createElement("div");
    div.id = 'ball';
    div.classList.add('player', 'ball')
    document.getElementById("main").appendChild(div);
    // Players
    for (t = 0; t < 2; t++) {
        for (i = 0; i < NPLAY; i++) {
            var div = document.createElement("div");
            div.id = 'd_' + t + '_' + i;
            div.classList.add('player', 'team' + (t + 1));
            document.getElementById("main").appendChild(div);
        }
    }
}

//#endregion

//#region DRAWING FUNCTIONS
function drawFrame(id, t) {
    el = document.getElementById('ball');
    el.style.left = (struct_play.ball[id][0][t] * DIM[0] - BRAD / 2) + "px";
    el.style.bottom = (struct_play.ball[id][1][t] * DIM[1] - BRAD / 2) + "px";
    for (i = 0; i < NPLAY; i++) {
        // UPDATE DOTS
        e1 = document.getElementById('d_0_' + i);
        e1.style.left = (struct_play.team1[id][i][0][t] * DIM[0] - RAD / 2) + "px";
        e1.style.bottom = (struct_play.team1[id][i][1][t] * DIM[1] - RAD / 2) + "px";

        e2 = document.getElementById('d_1_' + i);
        e2.style.left = (struct_play.team2[id][i][0][t] * DIM[0] - RAD / 2) + "px";
        e2.style.bottom = (struct_play.team2[id][i][1][t] * DIM[1] - RAD / 2) + "px";
    }
}
function initStim() {
    if (frameI == 1 * FS) {
        clearInterval(IntervalS);
        clearInterval(IntervalP);
        IntervalP = setInterval(playStim, Math.round(1000 / FS));
    } else {
        drawFrame(struct_stim.id,
            struct_stim.start)
        frameI++;
    }
}
function playStim() {
    //console.log(frame)
    if (frame < (struct_stim.end - struct_stim.start)) {
        drawFrame(struct_stim.id,
            struct_stim.start + frame)
        frame++;

        // Check ball position
        bX = struct_play.ball[struct_stim.id][0][struct_stim.start + frame] * DIM[0] + BRAD / 2
        bY = DIM[1] - (struct_play.ball[struct_stim.id][1][struct_stim.start + frame] * DIM[1] + BRAD / 2);
        // Check mouse position
        mX = mousePosition.x;
        mY = mousePosition.y;
        // Get Distance
        dist = Math.sqrt((bX - mX) * (bX - mX) + (bY - mY) * (bY - mY));
        distArr.push(dist);
    } else {
        for (tNo = 0; tNo < 2; tNo++) {
            for (i = 0; i < NPLAY; i++) {
                // UPDATE DOTS
                el = document.getElementById('d_' + tNo + '_' + i);
                //el.style.visibility = 'hidden';
                el.style.opacity = 0.5;
            }
        }
        // FLASH DOT
        el = document.getElementById('d_' + struct_test.team + '_' + struct_test.player);
        el.classList.add('test');
        clearInterval(IntervalP);

        // SET TEST CLICK
        container.onclick = function (e) {
            testClick(e);
        };
    }
}
//#endregion

//#region STIMULUS
btnPlay.onclick = function () {
    // RESET SCORES
    frame = 0;
    frameI = 0;
    distArr = [];
    // REMOVE VISUALS
    removeDots();
    // CREATE VISUALS
    createDots();
    // GET RANDOM PLAY
    id = Math.floor(Math.random() * struct_play.id.length);
    // GET RANDOM DURATION
    winL = (WIN[0] + Math.floor(Math.random() * (WIN[1] - WIN[0]))) * FS
    // GET RANDOM START
    playDur = struct_play.ball[id][0].length;
    tStart = playDur - winL;
    // GET RANDOM TEAM
    tNo = 0;//Math.floor(2 * Math.random());
    el = document.getElementById('ball');
    if (tNo == 0) {
        el.style.borderColor = FTEAM1;
    } else {
        el.style.borderColor = FTEAM2;
    }
    // Get random player
    pNo = Math.floor((NPLAY - 1) * Math.random());

    //getVel();
    struct_stim.id = id;
    struct_stim.start = tStart;
    struct_stim.end = tStart + winL;
    struct_test.team = tNo;
    struct_test.player = pNo;
    console.log(winL)
    console.log(playDur)
    console.log(tStart)

    clearInterval(IntervalS);
    IntervalS = setInterval(initStim, 1000 / FS);
}
function testResult(mX, mY) {
    // TEST BALL
    scoreB = 0
    for (i = 0; i < distArr.length; i++) {
        //scoreB += distArr[i]
        if (distArr[i] < 2 * BRAD) {
            scoreB++;
        }
    }
    struct_scores.ball.push(Math.round(100 * scoreB / distArr.length));
    //struct_scores.ball.push(Math.round(scoreB / distArr.length));
    txtBall.innerHTML = 'BALL: ' + struct_scores.ball[struct_scores.ball.length - 1] + '%';
    // TEST TEAM
    // Check player position
    pX = struct_play.team1[struct_stim.id][struct_test.player][0][struct_stim.end] * DIM[0] + RAD / 2;
    pY = DIM[1] - (struct_play.team1[struct_stim.id][struct_test.player][1][struct_stim.end] * DIM[1] + RAD / 2);
    if (struct_test.team == 1) {
        pX = struct_play.team2[struct_stim.id][struct_test.player][0][struct_stim.end] * DIM[0] + RAD / 2;
        pY = DIM[1] - (struct_play.team2[struct_stim.id][struct_test.player][1][struct_stim.end] * DIM[1] + RAD / 2);
    }
    clickErr = Math.sqrt((pX - mX) * (pX - mX) + (pY - mY) * (pY - mY));
    struct_scores.team.push(Math.round(clickErr));
    txtTeam.innerHTML = 'TEAM: ' + struct_scores.team[struct_scores.team.length - 1] + 'px';
    // Get Ball-Player Distance
    bX = struct_play.ball[struct_stim.id][0][struct_stim.start + frame] * DIM[0] + BRAD / 2
    bY = DIM[1] - (struct_play.ball[struct_stim.id][1][struct_stim.start + frame] * DIM[1] + BRAD / 2);
    playD = Math.sqrt((pX - bX) * (pX - bX) + (pY - bY) * (pY - bY));
    struct_scores['ball-player'].push(Math.round(playD));
    // Get Ball-Mouse Distance
    mouseD = Math.sqrt((mX - bX) * (mX - bX) + (mY - bY) * (mY - bY));
    struct_scores['ball-mouse'].push(Math.round(mouseD));
    // UPDATE SCORES
    //console.log(struct_scores)
    // DISABLE CLICK
    container.onclick = null;
}
function testClick(e) {
    testResult(e.pageX - container.offsetLeft, e.pageY - container.offsetTop);
    tNo = struct_test.team;
    pNo = struct_test.player;
    // FLASH DOT
    el = document.getElementById('d_' + tNo + '_' + pNo);
    el.classList.remove('test');
    el.classList.add('result');

    console.log('click')
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

//#region DATA LOAD
function loadFile(file) {
    let obj = arrStr2Num(parseCSV(file));
    parseData(obj)
    createDots();
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
    console.log(arr)
    return arr
}
function parseData(arr) {
    // Get Plays
    struct_play.id = arr[0].filter((v, i, a) => a.indexOf(v) === i);
    for (p = 0; p < struct_play.id.length; p++) {
        datID = getAllIndexes(arr[0], struct_play.id[p]);
        // Time
        struct_play.time.push(datID.map(i => arr[1][i]))
        // Ball
        struct_play.ball.push(
            [datID.map(i => 0.05 + 0.9 * arr[2][i]),
            datID.map(i => 0.05 + 0.9 * arr[3][i])])
        // Team1
        var team1 = []
        for (n = 0; n < NPLAY; n++) {
            team1.push(
                [datID.map(i => 0.05 + 0.9 * arr[4 + n][i]),
                datID.map(i => 0.05 + 0.9 * arr[15 + n][i])])
        }
        struct_play.team1.push(team1)
        // Team2
        var team2 = []
        for (n = 0; n < NPLAY; n++) {
            team2.push(
                [datID.map(i => 0.05 + 0.9 * arr[26 + n][i]),
                datID.map(i => 0.05 + 0.9 * arr[37 + n][i])])
        }
        struct_play.team2.push(team2)
    }
    console.log(struct_play)
}
//#endregion

$(document).bind('mousemove', function (e) {
    mousePosition = { 'x': e.pageX - container.offsetLeft, 'y': e.pageY - container.offsetTop };
});
window.onload = function () {
    const url = "https://raw.githubusercontent.com/abdulzaf/msc_thesis/main/S0_W5.csv"
    fetch(url)
        .then(r => r.text())
        .then(t => loadFile(t))
};
function windowResize() {
};
window.addEventListener('resize', windowResize);

// HELPER FUNCTIONS
function getAllIndexes(arr, val) {
    var indexes = [], i;
    for (i = 0; i < arr.length; i++)
        if (arr[i] === val)
            indexes.push(i);
    return indexes;
}