// quest-handler.js

// ============ TELEGRAM INTEGRATION ============
const tg = window.Telegram?.WebApp;
if (tg) {
    tg.expand();
    tg.ready();
}

// ============ USER ID ============
function getUserId() {
    return tg?.initDataUnsafe?.user?.id?.toString() || 
           localStorage.getItem('userId') || 
           `user_${Date.now()}`;
}

// ============ LOADING OVERLAY CONTROL ============
function showLoading() {
    const overlay = document.getElementById('loadingOverlay4');
    if (overlay) {
        overlay.style.display = 'flex';
    }
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay4');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

// ============ INTERSTITIAL POPUP CONTROL ============
function showInterstitialPopup(amount = 10) {
    const overlay = document.getElementById('InterstitialOverlay');
    const amountSpan = document.getElementById('Interstitial-pop-amount');
    
    if (overlay && amountSpan) {
        amountSpan.textContent = amount;
        overlay.style.display = 'flex';
        
        // Telegram haptic feedback
        if (tg) {
            tg.HapticFeedback.notificationOccurred('success');
        }
    }
}

window.closeInterstitialPopup = function() {
    const overlay = document.getElementById('InterstitialOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
};

// ============ FIREBASE BALANCE UPDATE ============
async function updateUserBalance(userId, amount, reason = 'video_quest') {
    const userRef = database.ref('users/' + userId);
    
    return userRef.transaction((currentData) => {
        if (currentData) {
            currentData.balance = (currentData.balance || 0) + amount;
            currentData.lastUpdate = new Date().toISOString();
            currentData.lastReason = reason;
        } else {
            currentData = { 
                balance: amount,
                createdAt: new Date().toISOString(),
                username: tg?.initDataUnsafe?.user?.username || 'anonymous'
            };
        }
        return currentData;
    });
}

// ============ MAIN VIDEO QUEST FUNCTION ============
window.claimInterstitial = function() {
    // Step 1: Show loading
    showLoading();
    
    // Step 2: 2-3 seconds loading effect
    setTimeout(() => {
        hideLoading();
        
        // Step 3: Redirect to telegramads.html with user data
        const userId = getUserId();
        const questUrl = `quests/telegramads.html?userId=${userId}&reward=10&timestamp=${Date.now()}`;
        
        if (tg) {
            tg.openLink(questUrl);
        } else {
            window.location.href = questUrl;
        }
    }, 2500); // 2.5 seconds loading
};

// ============ CHECK QUEST COMPLETION ON INDEX PAGE ============
function checkQuestCompletion() {
    const urlParams = new URLSearchParams(window.location.search);
    const completed = urlParams.get('quest_completed');
    const reward = urlParams.get('reward');
    const userId = urlParams.get('userId');
    
    if (completed === 'true' && reward && userId) {
        const currentUser = getUserId();
        
        // Verify same user
        if (currentUser === userId) {
            // Show interstitial popup
            showInterstitialPopup(reward);
            
            // Update Firebase balance
            updateUserBalance(userId, parseInt(reward), 'quest_completed')
                .then(() => {
                    console.log('Balance updated successfully');
                    
                    // Clean URL
                    const url = new URL(window.location);
                    url.searchParams.delete('quest_completed');
                    url.searchParams.delete('reward');
                    url.searchParams.delete('userId');
                    window.history.replaceState({}, document.title, url);
                    
                    // Update display if balance function exists
                    if (typeof updateBalanceDisplay === 'function') {
                        updateBalanceDisplay();
                    }
                })
                .catch(error => {
                    console.error('Firebase error:', error);
                });
        }
    }
}

// ============ INITIALIZE ON PAGE LOAD ============
document.addEventListener('DOMContentLoaded', () => {
    checkQuestCompletion();
});
