window.addEventListener('load', function() {
    const taskPage = document.getElementById('tasks');
    if (!taskPage) return;

    // Daily Energy Card Inject karna
    const energyCard = document.createElement('div');
    energyCard.className = 'glass-card';
    energyCard.style.marginTop = "15px";
    energyCard.innerHTML = `
        <div>
            <b>Daily Energy Boost</b>
            <p style="font-size:12px; color:#777;">+ 100⚡ Every 24h</p>
        </div>
        <button id="energyClaimBtn" class="btn-action" onclick="claimDailyEnergy()">Claim</button>
    `;
    taskPage.appendChild(energyCard);
    
    // Page load par button status check karna
    checkEnergyStatus();
});

// Timer aur Button Status check karne ke liye
async function checkEnergyStatus() {
    try {
        let res = await fetch(`${DB_BASE_URL}${userId}.json`);
        let data = await res.json();
        if (data && data.lastEnergyClaim) {
            const now = Date.now();
            if (now - data.lastEnergyClaim < 24 * 60 * 60 * 1000) {
                const btn = document.getElementById('energyClaimBtn');
                if(btn) {
                    btn.innerText = "Claimed";
                    btn.disabled = true;
                    btn.style.opacity = "0.5";
                }
            }
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
