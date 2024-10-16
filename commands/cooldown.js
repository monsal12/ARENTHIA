const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const cooldowns = new Map(); // Menggunakan cooldowns dari battle jika sudah ada

module.exports = {
    data: new SlashCommandBuilder()
        .setName('checkcooldown')
        .setDescription('Cek cooldown explore kamu.'),
    
    async execute(interaction) {
        const now = Date.now();
        const cooldownAmount = 30 * 60 * 1000; // 30 menit dalam milidetik (sesuaikan dengan waktu explore)
        const userId = interaction.user.id;

        if (cooldowns.has(userId)) {
            const expirationTime = cooldowns.get(userId) + cooldownAmount;
            if (now < expirationTime) {
                const timeLeft = Math.round((expirationTime - now) / 1000);
                const minutes = Math.floor(timeLeft / 60);
                const seconds = timeLeft % 60;

                const cooldownEmbed = new EmbedBuilder()
                    .setTitle('Cooldown Explore')
                    .setDescription(`Kamu harus menunggu **${minutes} menit ${seconds} detik** sebelum menggunakan perintah explore lagi.`)
                    .setColor('Red');

                return interaction.reply({ embeds: [cooldownEmbed], ephemeral: true });
            }
        }

        const noCooldownEmbed = new EmbedBuilder()
            .setTitle('Cooldown Explore')
            .setDescription('Kamu tidak memiliki cooldown. Kamu bisa menggunakan perintah explore sekarang.')
            .setColor('Green');

        return interaction.reply({ embeds: [noCooldownEmbed], ephemeral: true });
    }
};
