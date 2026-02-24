const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Bot is Live!'));
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const bot = new Telegraf('8652596915:AAGgK4nWqRM-YB3864rCII_T0uHxQbz_RKU');
const DB_BASE = "https://tap-earn-bot-default-rtdb.asia-southeast1.firebasedatabase.app/users";

bot.start(async (ctx) => {
    const userId = ctx.from.id;
    const refId = ctx.startPayload;


    try {
        let res = await axios.get(`${DB_BASE}/${userId}.json`);
        let userData = res.data;

        if (!userData) {
            userData = { 
                balance: 0, 
                energy: 1000, 
                totalRefs: 0, 
                referredBy: refId || null,
                lastClaim: 0 // New Field
            };
            await axios.put(`${DB_BASE}/${userId}.json`, userData);

            if (refId && refId != userId) {
                let refRes = await axios.get(`${DB_BASE}/${refId}.json`);
                if (refRes.data) {
                    await axios.patch(`${DB_BASE}/${refId}.json`, {
                        energy: Math.min(1000, (refRes.data.energy || 0) + 250),
                        balance: (refRes.data.balance || 0) + 10,
                        totalRefs: (refRes.data.totalRefs || 0) + 1
                    });
                    bot.telegram.sendMessage(refId, "🎊 Naya friend juda! +250⚡ Energy aur ₹10 Reward!");
                }
            }
        }

        ctx.reply(`🎰 Welcome back, ${ctx.from.first_name}!\nTap Fortune mein aapka swagat hai.`, Markup.inlineKeyboard([
            [Markup.button.webApp('🚀 Play Now', 'https://tap-earn-bot.github.io/tap-earn-bot/')]
        ]));
    } catch (err) { 
        console.log(err);
        ctx.reply("❌ Error: Database se connect nahi ho paya. Dobara try karein.");
    }
});

bot.launch().then(() => console.log("Bot started!"));
