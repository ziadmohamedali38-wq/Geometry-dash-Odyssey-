// --- ODYSSEY ENGINE CORE ---
const CONFIG = {
    BASE: "https://rtxd.ps.fhgdps.com/",
    SEC: "Wmdf2p9383k3"
};

// 1. Authorization Logic
function systemAuth() {
    const access = prompt("System Code:");
    if (access === "7952") {
        document.getElementById('dev-panel').className = 'dev-active';
        console.log("System: Dev Access Granted.");
    }
}

// 2. Lively Level Fetcher (No-Crash Version)
async function loadLivelyFeed() {
    try {
        const res = await fetch(`${CONFIG.BASE}getGJLevels21.php`, {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: `type=4&secret=${CONFIG.SEC}`
        });
        const text = await res.text();
        if (text === "-1") return;

        const levels = text.split('|').map(l => {
            const d = l.split(':');
            return `<div class='lvl-card'>${d[3]} by ${d[5]}</div>`;
        });
        
        document.getElementById('level-list').innerHTML = levels.join('');
    } catch (err) {
        console.log("System: Server link offline. Retrying...");
    }
}

// 3. Mod Delete Request (The "Delete" Chunk)
async function modDeleteLevel(targetID) {
    if (confirm("Delete level " + targetID + " permanently?")) {
        const res = await fetch(`${CONFIG.BASE}deleteGJLevel21.php`, {
            method: 'POST',
            body: `levelID=${targetID}&secret=${CONFIG.SEC}`
        });
        const status = await res.text();
        if (status === "1") alert("Level Purged.");
    }
}

// Auto-run on load
window.onload = loadLivelyFeed;
