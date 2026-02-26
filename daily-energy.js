// 1. CSS & UI Setup
const style = document.createElement('style');
style.innerHTML = `
    .energy-card { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 20px; padding: 20px; margin-top: 15px; display: flex; justify-content: space-between; align-items: center; }
    #energyOverlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.95); display: none; align-items: center; justify-content: center; z-index: 20000; backdrop-filter: blur(10px); }
    .energy-btn { background: #ffcc00; color: black; border: none; padding: 10px 20px; border-radius: 12px; font-weight: 800; cursor: pointer; }
    .energy-btn:disabled { background: #444; color: #888; cursor: not-allowed; }
`;
document.head.appendChild(style);

window.addEventListener('load', () => {
    const questContainer = document.querySelector('#tasks');
    if (questContainer) {
        const energyDiv = document.createElement('div');
        energyDiv.className = 'energy-card';
        energyDiv.innerHTML = `<div><div style="font-weight:bold; color:white; font-size:16px;">Daily Energy Boost</div><div style="color:#888; font-size:12px;">+ 100⚡ Every 24h</div></div><button id="energyBtn" class="energy-btn" onclick="claimDailyEnergy()">CLAIM</button>`;
        questContainer.appendChild(energyDiv);
    }
    checkEnergyStatus(); 
});

// 2. Main Functions
function checkEnergyStatus() {
    const now = Date.now();
    if (window.lastEnergyClaim && (now - window.lastEnergyClaim < 24 * 60 * 60 * 1000)) {
        const btn = document.getElementById('energyBtn');
        if(btn) { btn.innerText = "Claimed"; btn.disabled = true; }
    }
}

async function claimDailyEnergy() {
    const now = Date.now();
    if (window.lastEnergyClaim && (now - window.lastEnergyClaim < 24 * 60 * 60 * 1000)) {
        return showAlert("Please wait 24 hours!");
    }

    const loader = document.getElementById("loadingOverlay");
    if(loader) loader.style.display = "flex";

    setTimeout(async () => {
        if(loader) loader.style.display = "none";
        try {
            energy = Math.min(1000, energy + 100); 
            window.lastEnergyClaim = now;
            updateUI(); 
            document.getElementById("energyOverlay").style.display = "flex";

            await fetch(`${DB_BASE_URL}${userId}.json`, {
                method: 'PATCH',
                body: JSON.stringify({ energy: energy, lastEnergyClaim: window.lastEnergyClaim })
            });
            checkEnergyStatus();
        } catch (e) { showAlert("Error claiming energy!"); }
    }, 2000); 
}

function closeEnergyPopup() { document.getElementById("energyOverlay").style.display = "none"; }
