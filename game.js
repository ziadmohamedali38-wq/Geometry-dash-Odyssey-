:root {
    --accent: #00FFCC;
}

body, html {
    margin: 0; padding: 0;
    width: 100%; height: 100%;
    background: #000;
    overflow: hidden;
    position: fixed;
    font-family: 'Segoe UI', sans-serif;
}

#gameCanvas {
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
}

/* Progress Bar Style */
#progress-container {
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    width: 60%;
    height: 8px;
    background: rgba(255,255,255,0.1);
    border-radius: 4px;
    display: none;
    z-index: 10;
}

#progress-bar {
    width: 0%;
    height: 100%;
    background: var(--accent);
    border-radius: 4px;
    box-shadow: 0 0 10px var(--accent);
}
