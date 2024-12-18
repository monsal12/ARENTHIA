const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../models/user'); // Model mongoose User

// Role ID yang diperlukan untuk bisa menggunakan heal
const REQUIRED_ROLE_ID = '1318853492474904627';  // Ganti dengan ID role yang diinginkan

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roll-heal')
        .setDescription('Roll heal to restore health'),
    async execute(interaction) {
        try {
            const userId = interaction.user.id;

            // Cek apakah pengguna memiliki role yang diperlukan
            const member = await interaction.guild.members.fetch(userId);
            const hasRequiredRole = member.roles.cache.has(REQUIRED_ROLE_ID); // Cek apakah memiliki role yang diperlukan

            if (!hasRequiredRole) {
                return interaction.reply({ content: 'Kamu harus memiliki role tertentu untuk menggunakan perintah ini.', ephemeral: true });
            }

            // Ambil data user dari database
            const userData = await User.findOne({ discordId: userId });

            if (!userData) {
                return interaction.reply({ content: 'Profile kamu tidak ditemukan! Pastikan kamu sudah terdaftar.', ephemeral: true });
            }

            // Kalkulasi heal berdasarkan stats
            const { stats } = userData;
            const healAmount = (stats.intelligence * 60 / 100) + (stats.ability * 25 / 100);

            // Periksa apakah health melebihi batas maksimum
            const newHealth = Math.min(userData.health.current + healAmount, userData.health.max);

            // Update health di database
            userData.health.current = newHealth;
            await userData.save();

            // Kirimkan response dengan embed
            const embed = new EmbedBuilder()
                .setTitle('✨ Heal Roll Result ✨')
                .setDescription(`${interaction.user.username} berhasil menyembuhkan diri dengan **${healAmount.toFixed(2)}**!`)
                .setImage('https://media1.tenor.com/m/mDSa8CcMd9sAAAAd/encounter-party-encounterparty.gif')
                .addFields(
                    { name: 'New Health', value: `${newHealth} / ${userData.health.max}`, inline: true }
                )
                .setColor('#00FF00')
                .setFooter({ text: 'Use wisely and heal yourself!' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Terjadi kesalahan saat melakukan heal.', ephemeral: true });
        }
    },
};
