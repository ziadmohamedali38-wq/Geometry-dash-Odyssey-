const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
// ... all your variables, levels, update(), and draw() functions go here ...

function loop(t) {
    let dt = Math.min((t - (this.lt || t)) / 1000, 0.016);
    this.lt = t; 
    update(dt); 
    draw();
    requestAnimationFrame(loop);
}
init(); 
requestAnimationFrame(loop);
