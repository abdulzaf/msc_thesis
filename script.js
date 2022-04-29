const canvas = document.getElementById('myCanvas');
const context = canvas.getContext('2d');

function draw() {
    var centerX = canvas.width / 2;
    var centerY = canvas.height / 2;
    const radius = 30;
    
    context.beginPath();
    context.fillStyle = '#0077aa';
    context.strokeStyle = '#0077aa47';
    context.lineWidth = 2;
    
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context.fill();
    context.stroke();
}

window.onload = function() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    draw();
};
function windowResize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    draw();
};
window.addEventListener('resize', windowResize);