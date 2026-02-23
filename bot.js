const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');

const bot = new Telegraf('8307773463:AAEI0GefnG3PrdqwVXr42SFwj3PIaNWDPxY');
const DB_URL = "AAPKA_FIREBASE_URL_YAHAN_DALO/.json"; // Firebase URL yahan dalein

bot.start(async (ctx) => {
    const userId = ctx.from.id;
    const refId = ctx.startPayload; // Ye refer karne wale ki ID hai

    // Pehle check karo user naya hai ya nahi
    let userRes = await axios.get(`https://aapka-db-url/users/${userId}.json`);
    
    if (!userRes.data) {
        // Naya User hai, data create karo
        let newUser = { balance: 0, energy: 1000, referredBy: refId || null, totalRefs: 0 };
        await axios.put(`https://aapka-db-url/users/${userId}.json`, newUser);

        // Agar kisi ne refer kiya hai toh use reward do
        if (refId && refId != userId) {
            let refRes = await axios.get(`https://aapka-db-url/users/${refId}.json`);
            if (refRes.data) {
                let updatedEnergy = Math.min(1000, (refRes.data.energy || 0) + 250);
                let updatedBalance = (refRes.data.balance || 0) + 10;
                let updatedRefs = (refRes.data.totalRefs || 0) + 1;

                await axios.patch(`https://aapka-db-url/users/${refId}.json`, {
                    energy: updatedEnergy,
                    balance: updatedBalance,
                    totalRefs: updatedRefs
                });

                bot.telegram.sendMessage(refId, "🎊 Naya friend juda! +250⚡ Energy aur ₹10 add ho gaye.");
            }
        }
    }

    ctx.reply('🎰 Welcome to Elite Tap & Earn!', Markup.inlineKeyboard([
        [Markup.button.webApp('🚀 Play Now (Full Screen)', 'https://your-github-link.io/')]
    ]));
});

bot.launch();
