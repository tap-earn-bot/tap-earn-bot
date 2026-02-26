const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Bot is Live!'));
app.get('/ping', (req, res) => {
  res.status(200).send('OK');
});
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const bot = new Telegraf('8652596915:AAGgK4nWqRM-YB3864rCII_T0uHxQbz_RKU');
const DB_BASE = "https://tap-earn-bot-default-rtdb.asia-southeast1.firebasedatabase.app/users";
const photoUrl = 'https://raw.githubusercontent.com/tap-earn-bot/tap-earn-bot/main/1771951780779.png'; 

bot.start(async (ctx) => {
    const userId = ctx.from.id;
    const refId = ctx.startPayload;
    const firstName = ctx.from.first_name || "User";

    try {
        // --- Firebase Database Logic (No Changes) ---
        let res = await axios.get(`${DB_BASE}/${userId}.json`);
        let userData = res.data;

        if (!userData) {
            userData = { 
                balance: 0, 
                energy: 1000, 
                totalRefs: 0, 
                referredBy: refId || null,
                lastClaim: 0 
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

        // --- Photo and Welcome Message Logic ---
        const welcomeMessage = `**Hi ${firstName}, Welcome to the Tap Fortune community!** ✨\n\n` +
            `Ready to unlock unlimited potential? The more you tap, the more you earn. Don't let your coins wait!\n\n` +
            `🔥 **Get started and boost your balance!**`;

        await ctx.replyWithPhoto(photoUrl, {
            caption: welcomeMessage,
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
                [Markup.button.webApp('🚀 Play Now', 'https://tap-earn-bot.github.io/tap-earn-bot/')]
            ])
        });

    } catch (err) { 
        console.log("Error Details:", err);
        ctx.reply("❌ Error: Something went wrong while connecting to the server.");
    }
});

bot.launch().then(() => console.log("Bot started!"));

// Graceful stop settings
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
