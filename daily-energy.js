// CSS Styles Inject Karein (Taaki index.html touch na karni pade)
const style = document.createElement('style');
style.innerHTML = `
    .energy-card {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 20px;
        padding: 20px;
        margin-top: 15px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    #energyOverlay {
        position: fixed; inset: 0; background: rgba(0, 0, 0, 0.95);
        display: none; align-items: center; justify-content: center; z-index: 20000;
        backdrop-filter: blur(10px);
    }
    .energy-btn {
        background: #ffcc00; color: black; border: none; padding: 10px 20px;
        border-radius: 12px; font-weight: 800; cursor: pointer;
    }
    .energy-btn:disabled { background: #444; color: #888; cursor: not-allowed; }
`;
document.head.appendChild(style);

// Quests page par Card add karein
window.addEventListener('load', () => {
    const questContainer = document.querySelector('#tasks') || document.body;
    const energyDiv = document.createElement('div');
    energyDiv.className = 'energy-card';
    energyDiv.innerHTML = `
        <div style="text-align:left;">
            <div style="font-weight:bold; color:white; font-size:16px;">Daily Energy Boost</div>
            <div style="color:#888; font-size:12px;">+ 100⚡ Every 24h</div>
        </div>
        <button id="energyBtn" class="energy-btn" onclick="claimDailyEnergy()">CLAIM</button>
    `;
    questContainer.appendChild(energyDiv);

    // Energy Popup ka HTML inject karein
    const popupHTML = `
    <div id="energyOverlay">
        <div class="reward-card">
            <div class="sunburst"></div>
            <div class="congrats-text">Congratulations! You got</div>
            <div class="reward-amount">100</div>
            <div class="reward-unit">Energy ⚡</div>
            <img src="https://raw.githubusercontent.com/tap-earn-bot/tap-earn-bot/main/1000410752-removebg-preview.png" class="coin-stack" style="filter: hue-rotate(180deg) saturate(2);">
            <button class="accept-btn" onclick="closeEnergyPopup()" style="background:#ffcc00; color:black;">COLLECT</button>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', popupHTML);
    
    checkEnergyStatus(); // Status check karein page load par
});
        }
    } catch (e) { console.error(e); }
}

// Energy Claim karne ka Logic
async function claimDailyEnergy() {
    const now = Date.now();
    const btn = document.getElementById('energyClaimBtn');

    try {
        // Database se latest data fetch karein
        let res = await fetch(`${DB_BASE_URL}${userId}.json`);
        let data = await res.json();
        let lastClaim = data.lastEnergyClaim || 0;

        if (now - lastClaim < 24 * 60 * 60 * 1000) {
            return showAlert("Wait for 24 hours!");
        }

        // 1. UI update
        energy += 100; // Local variable update
        updateUI();

        // 2. Firebase update (Energy + Timestamp)
        await fetch(`${DB_BASE_URL}${userId}.json`, {
            method: 'PATCH',
            body: JSON.stringify({ 
                energy: energy, 
                lastEnergyClaim: now 
            })
        });

        // 3. Button status change
        btn.innerText = "Claimed";
        btn.disabled = true;
        
        // Branded Success Alert
        showAlert("100⚡ Energy Added Successfully!");

    } catch (e) {
        console.error(e);
        showAlert("Error claiming energy!");
    }
}
let lastEnergyClaim = 0; // Global variable (loadData mein isse set karein)

function checkEnergyStatus() {
    const now = Date.now();
    // Firebase se load hone ke baad check karein
    if (lastEnergyClaim && (now - lastEnergyClaim < 24 * 60 * 60 * 1000)) {
        const btn = document.getElementById('energyBtn');
        if(btn) {
            btn.innerText = "Claimed";
            btn.disabled = true;
        }
    }
}

async function claimDailyEnergy() {
    const now = Date.now();
    
    // 24 ghante ka check
    if (lastEnergyClaim && (now - lastEnergyClaim < 24 * 60 * 60 * 1000)) {
        return showAlert("Please wait 24 hours for next boost!");
    }

    // 1. Loading dikhao (Wahi purana loader use hoga)
    const loader = document.getElementById("loadingOverlay");
    if(loader) loader.style.display = "flex";

    // 2. Delay for Professional Feel
    setTimeout(async () => {
        if(loader) loader.style.display = "none";

        // Logic: Energy update (Max energy limit ka dhyan rakhte hue)
        energy = Math.min(1000, energy + 100); 
        lastEnergyClaim = now;
        
        // 3. Branded Pop-up dikhao
        document.getElementById("energyOverlay").style.display = "flex";

        // UI update karein (Main page par energy bar update hogi)
        updateUI(); 

        // 4. Firebase mein save karein (Naya field: lastEnergyClaim)
        try {
            await fetch(`${DB_BASE_URL}${userId}.json`, {
                method: 'PATCH',
                body: JSON.stringify({ 
                    energy: energy, 
                    lastEnergyClaim: lastEnergyClaim 
                })
            });
        } catch (e) { console.error("Firebase Sync Error:", e); }

        checkEnergyStatus();
    }, 2000); 
}

function closeEnergyPopup() {
    document.getElementById("energyOverlay").style.display = "none";
}
