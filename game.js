// Odyssey Engine State
let editorMode = false;
let selectedObject = 'block'; 
let levelData = []; // This stores your objects

// THE 7952 UNLOCK (Functional)
function unlockSystem() {
    const code = prompt("System Access:");
    if (code === "7952") {
        editorMode = true;
        document.getElementById('editor-ui').style.display = 'flex';
        document.getElementById('auth-btn').style.display = 'none';
        initCanvas(); // Starts the drawing engine
    }
}

// THE PLACEMENT LOGIC
function placeObject(x, y) {
    if (!editorMode) return;

    // Grid Snapping (Typical GD logic)
    const snapX = Math.floor(x / 30) * 30;
    const snapY = Math.floor(y / 30) * 30;

    const newObj = { x: snapX, y: snapY, type: selectedObject };
    levelData.push(newObj);
    
    drawLevel(); // Refreshes the screen
}

// DRAWING THE GAME
function drawLevel() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    levelData.forEach(obj => {
        if(obj.type === 'block') ctx.fillStyle = '#00aaff';
        if(obj.type === 'spike') ctx.fillStyle = '#ff4444';
        ctx.fillRect(obj.x, obj.y, 30, 30);
    });
}
