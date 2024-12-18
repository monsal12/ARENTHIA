const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../models/User'); // Model mongoose User
const { calculateRoleStats } = require('../helpers/roleStatsHelper'); // Mengimpor fungsi helper

// Fungsi untuk roll nilai antara 0 hingga max
function roll(value) {
    return Math.floor(Math.random() * (value + 1)); // Roll antara 0 hingga nilai yang diberikan
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roll-magical-defense')
        .setDescription('Rolls for Magical Defense based on your profile\'s attributes'),
    async execute(interaction) {
        try {
            const userId = interaction.user.id;

            // Ambil data user dari database
            const userData = await User.findOne({ discordId: userId });

            if (!userData) {
                return interaction.reply({ content: 'Profile kamu tidak ditemukan! Pastikan kamu sudah terdaftar.', ephemeral: true });
            }

            const { element: role, stats } = userData;

            // Validasi jika role tidak tersedia
            if (!role) {
                return interaction.reply({ content: 'Role kamu belum diatur. Silakan pilih role terlebih dahulu!', ephemeral: true });
            }

            // Kalkulasi stats berdasarkan role
            const roleStats = calculateRoleStats(role, stats);

            // Roll untuk Magical Defense
            const rolledMagicalDefense = roll(roleStats.magical_defense);

            // Buat embed untuk response
            const embed = new EmbedBuilder()
                .setTitle(`🎲 ${interaction.user.username}'s Magical Defense Roll 🎲`)
                .setColor('#FF5733')
                .setImage('https://media1.tenor.com/m/mDSa8CcMd9sAAAAd/encounter-party-encounterparty.gif')
                .addFields(
                    { name: 'Magical Defense Roll', value: `${rolledMagicalDefense}`, inline: true }
                )
                .setFooter({ text: 'Good luck in your adventure!' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Terjadi kesalahan saat melakukan roll.', ephemeral: true });
        }
    },
};
