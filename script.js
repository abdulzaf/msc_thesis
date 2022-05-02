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
const BRAD = 20;
const FS = 100;
const WIN = [30, 45];
const NPLAY = 11;
const TSET = 1;
const FBALL = '#ffffff';
const FBLANK = '#000000'
const FTEAM1 = 'blue';
const FTEAM2 = 'red';
const SCOL = '#000000';
const SWIDTH = 2;
var NSET = 2;
var trialNo = 0;
var IntervalS;
var IntervalP;
var frame = 0;
var frameI = 0;
var score = 0;
var scoreA = 0;
var nclick = 0;
var distArr = [];
var mousePosition = {'x': 0, 'y': 0};

struct_scores = {
    'N': [],
    'trial': [],
    'time': [],
    'bVAvg': [],
    'ball': [],
    'team': [],
    'teamA': []
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
    'end': 0,
    'pid': [],
    'xy': [[], []],
    'fact': 1,
    'pScale': [],
    'team': 0
}
// ADD DIVS
// Ball
function removeDots() {
    document.getElementById("ball").remove();
    // Players
    for (t=0; t<2; t++) {
        for (i=0; i<NPLAY; i++) {
            document.getElementById('d_'+t+'_'+i).remove();
        }
    }
}
function createDots() {
    var div = document.createElement("div");
    div.id = 'ball';
    div.classList.add('player', 'ball')
    document.getElementById("main").appendChild(div);
    // Players
    for (t=0; t<2; t++) {
        for (i=0; i<NPLAY; i++) {
            var div = document.createElement("div");
            div.id = 'd_' + t + '_' + i;
            div.classList.add('player', 'team' + (t+1));
            document.getElementById("main").appendChild(div);
        }
    }
}

//#endregion

//#region DRAWING FUNCTIONS
function drawFrame(id, t, pID) {
    el = document.getElementById('ball');
    el.style.left = (struct_play.ball[id][0][t] * DIM[0] - BRAD/2) + "px";
    el.style.bottom = (struct_play.ball[id][1][t] * DIM[1] - BRAD/2) + "px";
    for (i=0; i<NPLAY; i++) {
        // UPDATE DOTS
        e1 = document.getElementById('d_0_'+pID[i]);
        e1.style.left = (struct_play.team1[id][pID[i]][0][t] * DIM[0] - RAD/2) + "px";
        e1.style.bottom = (struct_play.team1[id][pID[i]][1][t] * DIM[1] - RAD/2) + "px";

        e2 = document.getElementById('d_1_'+pID[i]);
        e2.style.left = (struct_play.team2[id][pID[i]][0][t] * DIM[0] - RAD/2) + "px";
        e2.style.bottom = (struct_play.team2[id][pID[i]][1][t] * DIM[1] - RAD/2) + "px";
    }
}
function initStim() {
    if (frameI==3*FS) {
        for (i=0; i<NSET; i++) {
            // UPDATE DOTS
            e1 = document.getElementById('d_0_'+struct_stim.pid[i]);
            e2 = document.getElementById('d_1_'+struct_stim.pid[i]);
            e1.classList.remove('init-frame')
            e2.classList.remove('init-frame')
        }
        clearInterval(IntervalS);
        clearInterval(IntervalP);
        IntervalP = setInterval(playStim, Math.round(1000/(struct_stim.fact * FS)));
    } else {
        drawFrame(struct_stim.id,
            struct_stim.start,
            struct_stim.pid)
        frameI++;
    }
}
function playStim() {
    if (frame<(struct_stim.end-struct_stim.start)) {
        drawFrame(struct_stim.id,
            struct_stim.start+frame,
            struct_stim.pid)
        frame++;

        // Check ball position
        bX = struct_play.ball[struct_stim.id][0][struct_stim.start+frame] * DIM[0] + BRAD/2
        bY = DIM[1] - (struct_play.ball[struct_stim.id][1][struct_stim.start+frame] * DIM[1] + BRAD/2);
        // Check mouse position
        mX = mousePosition.x;
        mY = mousePosition.y;
        // Get Distance
        dist = Math.sqrt((bX-mX)*(bX-mX) + (bY-mY)*(bY-mY));
        distArr.push(dist);
    } else {
        clearInterval(IntervalP);
        if (struct_stim.team==0) {
            eB = document.getElementById('ball');
            eB.style.backgroundColor = "blue"
        } else {
            eB = document.getElementById('ball');
            eB.style.backgroundColor = "red"
        }
        for (i=0; i<NSET; i++) {
            e1 = document.getElementById('d_0_'+struct_stim.pid[i]);
            e1.classList.remove('team1');
            e1.classList.add('test');
    
            e2 = document.getElementById('d_1_'+struct_stim.pid[i]);
            e2.classList.remove('team2');
            e2.classList.add('test');

            e1.onclick = function() {
                testTeam(this)
            }
            e2.onclick = function() {
                testTeam(this)
            }
        }
    }
}
//#endregion

//#region STIMULUS
btnPlay.onclick = function() {
    // REMOVE VISUALS
    removeDots();
    // UPDATE TRIAL + DIFFICULTY
    trialNo++
    if (trialNo>TSET) {
        NSET++;
        trialNo = 1;
    }
    if (NSET <= NPLAY) {
        txtLevel.innerHTML = "DIFFICULTY: " + NSET
        txtTrial.innerHTML = "TRIAL: " + trialNo
        // CREATE VISUALS
        createDots();
        // RESET SCORE
        score = 0;
        scoreA = 0;
        nclick = 0;
        distArr = [];
        // GET RANDOM PLAY
        id = Math.floor(Math.random()*struct_play.id.length);
        // GET RANDOM PLAYER IDs
        idArr = [...Array(NPLAY).keys()];
        pID = idArr.sort(() => Math.random() - 0.5);
        // UPDATE VISUALS
        for (i=0; i<NPLAY; i++) {
            e1 = document.getElementById('d_0_'+pID[i]);
            e2 = document.getElementById('d_1_'+pID[i]);
            if (i<NSET) {
                e1.classList.remove('playerS')
                e2.classList.remove('playerS')
                e1.classList.add('player')
                e2.classList.add('player')
            } else {
                e1.classList.remove('player')
                e2.classList.remove('player')
                e1.classList.add('playerS')
                e2.classList.add('playerS')
            }
        }
        // GET RANDOM DURATION
        winL = (WIN[0] + Math.floor(Math.random() * (WIN[1]-WIN[0]))) * FS
        // GET RANDOM START
        playDur = struct_play.ball[id][0].length;
        tStart = Math.floor(Math.random() * (playDur - winL))
        // GET RANDOM TEAM
        tNo = Math.floor(2*Math.random());

        struct_stim.id = id;
        struct_stim.start = tStart;
        struct_stim.end = tStart + winL;
        struct_stim.pid = pID;
        struct_stim.team = tNo;

        // GET VEL FACT
        getVel();
        getDistScore();

        frame = 0;
        frameI = 0;

        alert("1. Track the white ball with the crosshairs\r\n2. When the scene freezes, click on the players that had matched the ball color\r\n3. Click 'Play' to start the next trial")
        // INIT TRACKING DOTS
        for (i=0; i<NSET; i++) {
            // UPDATE DOTS
            e1 = document.getElementById('d_0_'+pID[i]);
            e2 = document.getElementById('d_1_'+pID[i]);
            e1.classList.add('init-frame')
            e2.classList.add('init-frame')
        }
        clearInterval(IntervalS);
        IntervalS = setInterval(initStim, 1000/FS);
        console.log(struct_stim.pid)
    }
}
function testTeam(el) {
    el.onclick = null;
    el.classList.remove('test');
    el.classList.add('test-click', 'sel-border');
    teamNo = el.id[2];
    playNo = Number(el.id.slice(4));
    playID = struct_stim.pid.indexOf(playNo)
    if (teamNo==struct_stim.team) {
        score++;
        scoreA += struct_stim.pScale[playID]
    }
    nclick++;
    if (nclick==NSET) {
        // TEST BALL
        scoreB = 0
        for (i=0; i<distArr.length; i++) {
            if (distArr[i] < BRAD) {
                scoreB++;
            }
        }
        struct_scores.ball.push(Math.round(100*scoreB/distArr.length));
        txtBall.innerHTML = 'BALL: ' + Math.round(100*scoreB/distArr.length) + '%';
        // TEST TEAM
        struct_scores.team.push(Math.round(100*score/nclick));
        txtTeam.innerHTML = 'TEAM: ' + Math.round(100*score/nclick) + '%';
        // TEST TEAM ADJ
        struct_scores.teamA.push(Math.round(100*scoreA));
        txtTeamAdj.innerHTML = 'TEAM (ADJUSTED): ' + Math.round(100*scoreA) + '%';
        // UPDATE SCORES
        struct_scores.N.push(NSET);
        struct_scores.trial.push(trialNo)
        struct_scores.time.push((struct_stim.end - struct_stim.start) / (FS * struct_stim.fact));
        console.log(struct_scores)
        // RESET VISUALS
        for (i=0; i<NSET; i++) {
            e1 = document.getElementById('d_0_'+struct_stim.pid[i]);
            e1.classList.remove('test', 'test-click');
            e1.classList.add('team1');

            e2 = document.getElementById('d_1_'+struct_stim.pid[i]);
            e2.classList.remove('test', 'test-click');
            e2.classList.add('team2');
        }
    }
}
function getDistScore() {
    distPlay = [];
    distNorm = [];
    distTot = 0;
    for (i=0; i<NSET; i++) {
        pX = struct_play.team1[struct_stim.id][struct_stim.pid[i]][0][struct_stim.end];
        pY = struct_play.team1[struct_stim.id][struct_stim.pid[i]][1][struct_stim.end];
        bX = struct_play.ball[struct_stim.id][0][struct_stim.end];
        bY = struct_play.ball[struct_stim.id][1][struct_stim.end];
        dX = bX - pX;
        dY = bY - pY;
        distPlay.push(Math.sqrt(dX*dX + dY*dY));
        distTot = distTot + Math.sqrt(dX*dX + dY*dY);
    }
    for (i=0; i<NSET; i++) {
        distNorm.push((1-(distPlay[i] / distTot)) / (NSET - 1));
    }
    struct_stim.pScale = distNorm;
}
function getVel() {
    bXY = [struct_play.ball[struct_stim.id][0].slice(struct_stim.start, struct_stim.end),
            struct_play.ball[struct_stim.id][1].slice(struct_stim.start, struct_stim.end)];
    bVel = [];
    for (i=1; i<bXY[0].length; i++) {
        dX = DIM[0] * (bXY[0][i] - bXY[0][i-1]);
        dY = DIM[1] * (bXY[1][i] - bXY[1][i-1]);
        bVel.push(FS * Math.sqrt(dX*dX + dY*dY))
    }
    // Get AVG Vel
    vSum = bVel.reduce((a, b) => a + b, 0);
    vAvg = struct_stim.fact * vSum / bVel.length;

    struct_stim.fact = TARVEL/vAvg;//Math.max(...bVel);
    //struct_scores.bVAvg.push(vAvg);
    struct_scores.bVAvg.push(Math.max(...bVel));
}
//#endregion

//#region SAVE DATA
btnSave.onclick = function() {
    var blob = new Blob([JSON.stringify(struct_scores)], {type: "text/plain;charset=utf-8"});
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
    txtLevel.innerHTML = "DIFFICULTY: " + NSET
    txtTrial.innerHTML = "TRIAL: " + trialNo
  }
function parseCSV(str) {
    var arr = [];
    var quote = false;  // 'true' means we're inside a quoted field

    // Iterate over each character, keep track of current row and column (of the returned array)
    for (var row = 0, col = 0, c = 0; c < str.length; c++) {
        var cc = str[c], nc = str[c+1];        // Current character, next character
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
    for (i=0; i<arr.length; i++) {
        arr[i] = arr[i].map(Number)
    }
    return arr
}
function parseData(arr) {
    // Get Plays
    struct_play.id = arr[0].filter((v, i, a) => a.indexOf(v) === i);
    for (p=0; p<struct_play.id.length; p++) {
        datID = getAllIndexes(arr[0], struct_play.id[p]);
        // Time
        struct_play.time.push(datID.map(i => arr[1][i]))
        // Ball
        struct_play.ball.push(
            [datID.map(i => 0.05 + 0.9*arr[2][i]),
            datID.map(i => 0.05 + 0.9*arr[3][i])])
        // Team1
        var team1 = []
        for (n=0; n<NPLAY; n++) {
            team1.push(
                [datID.map(i => 0.05 + 0.9*arr[4+n][i]),
                datID.map(i => 0.05 + 0.9*arr[15+n][i])])
        }
        struct_play.team1.push(team1)
        // Team2
        var team2 = []
        for (n=0; n<NPLAY; n++) {
            team2.push(
                [datID.map(i => 0.05 + 0.9*arr[26+n][i]),
                datID.map(i => 0.05 + 0.9*arr[37+n][i])])
        }
        struct_play.team2.push(team2)
    }
    console.log(struct_play)
}
//#endregion

$(document).bind('mousemove', function(e) {
    mousePosition = {'x': e.pageX - container.offsetLeft, 'y': e.pageY - container.offsetTop};
});
window.onload = function() {
    const url = "https://raw.githubusercontent.com/abdulzaf/msc_thesis/main/play1.csv"
    fetch(url)
    .then( r => r.text() )
    .then( t => loadFile(t) )
    //canvas.width  = window.innerWidth;
    //canvas.height = window.innerHeight;
    //ctx_rect= context.canvas.getBoundingClientRect();
};
function windowResize() {
    //canvas.width  = window.innerWidth;
    //canvas.height = window.innerHeight;
};
window.addEventListener('resize', windowResize);

// HELPER FUNCTIONS
function getAllIndexes(arr, val) {
    var indexes = [], i;
    for(i = 0; i < arr.length; i++)
        if (arr[i] === val)
            indexes.push(i);
    return indexes;
}