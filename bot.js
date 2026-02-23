const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');
const express = require('express'); // Port detect karne ke liye

// 1. Express Setup (Isse Render wala error solve hoga)
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Bot is Live!'));
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// 2. Bot Setup
const bot = new Telegraf('8307773463:AAEI0GefnG3PrdqwVXr42SFwj3PIaNWDPxY');
const DB_URL = "https://tap-earn-bot-default-rtdb.asia-southeast1.firebasedatabase.app/.json";

bot.start(async (ctx) => {
    const userId = ctx.from.id;
    const refId = ctx.startPayload;

    try {
        let res = await axios.get(`https://tap-earn-bot-default-rtdb.asia-southeast1.firebasedatabase.app/users/${userId}.json`);
        let userData = res.data;

        if (!userData) {
            userData = { balance: 0, energy: 1000, totalRefs: 0, referredBy: refId || null };
            await axios.put(`https://tap-earn-bot-default-rtdb.asia-southeast1.firebasedatabase.app/users/${userId}.json`, userData);

            if (refId && refId != userId) {
                let refRes = await axios.get(`https://tap-earn-bot-default-rtdb.asia-southeast1.firebasedatabase.app/users/${refId}.json`);
                if (refRes.data) {
                    await axios.patch(`https://tap-earn-bot-default-rtdb.asia-southeast1.firebasedatabase.app/users/${refId}.json`, {
                        energy: Math.min(1000, (refRes.data.energy || 0) + 250),
                        balance: (refRes.data.balance || 0) + 10,
                        totalRefs: (refRes.data.totalRefs || 0) + 1
                    });
                    bot.telegram.sendMessage(refId, "🎊 Naya friend juda! +250⚡ Energy aur ₹10 Reward!");
                }
            }
        }

        ctx.reply(`🎰 Welcome to Elite Tap & Earn!`, Markup.inlineKeyboard([
            [Markup.button.webApp('🚀 Play Now', 'https://tap-earn-bot.github.io/tap-earn-bot/')]
        ]));
    } catch (err) { console.log(err); }
});

bot.launch();
