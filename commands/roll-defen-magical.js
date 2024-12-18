const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../models/user'); // Model mongoose User
const { calculateRoleStats } = require('../helpers/roleStatsHelper'); // Mengimpor fungsi helper

// Fungsi untuk roll nilai antara 0 hingga max
function roll(value) {
    return Math.floor(Math.random() * (value + 1)); // Roll antara 0 hingga nilai yang diberikan
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roll-defensive-magical')
        .setDescription('Rolls for Magical Defense based on your profile\'s attributes')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Choose the type of roll')
                .setRequired(true)
                .addChoices(
                    { name: 'Normal Roll', value: 'normal' },
                    { name: 'Critical Roll (+25%)', value: 'critical' },
                    { name: 'Skill Roll', value: 'skill' },
                    { name: 'Reduced Roll (-50%)', value: 'reduced' } // New "Reduced Roll" type
                )
        )
        .addStringOption(option =>
            option.setName('skill_name')
                .setDescription('The name of the skill to use (if you selected "Skill Roll")')
                .setRequired(false)
        )
        .addIntegerOption(option =>
            option.setName('bonus')
                .setDescription('Bonus defense added to the skill roll')
                .setRequired(false)
        )
        .addIntegerOption(option =>
            option.setName('mana_cost')
                .setDescription('The mana cost for using the skill')
                .setRequired(false) // Using mana for defense skills
        ),
    async execute(interaction) {
        try {
            const userId = interaction.user.id;
            const rollType = interaction.options.getString('type');
            const skillName = interaction.options.getString('skill_name');
            const bonusDefense = interaction.options.getInteger('bonus') || 0;
            const manaCost = interaction.options.getInteger('mana_cost') || 0;

            // Ambil data user dari database
            const userData = await User.findOne({ discordId: userId });

            if (!userData) {
                return interaction.reply({ content: 'Profile kamu tidak ditemukan! Pastikan kamu sudah terdaftar.', ephemeral: true });
            }

            const { element: role, stats, mana } = userData;

            // Validasi jika role tidak tersedia
            if (!role) {
                return interaction.reply({ content: 'Role kamu belum diatur. Silakan pilih role terlebih dahulu!', ephemeral: true });
            }

            // Validasi mana untuk skill
            if (mana.current < manaCost) {
                return interaction.reply({ content: 'Mana kamu tidak cukup untuk menggunakan skill ini!', ephemeral: true });
            }

            // Kalkulasi stats berdasarkan role
            const roleStats = calculateRoleStats(role, stats);

            // Maximum roll value for Magical Defense
            const maxMagicalDefense = roleStats.magical_defense;

            // Cek jenis roll yang dipilih dan hitung max value baru
            let finalMaxValue = maxMagicalDefense;

            if (rollType === 'critical') {
                finalMaxValue = maxMagicalDefense * 1.25; // Critical roll (+25%)
            } else if (rollType === 'reduced') {
                finalMaxValue = maxMagicalDefense * 0.5; // Reduced roll (-50%)
            }

            // Roll untuk Magical Defense
            const rolledMagicalDefense = roll(finalMaxValue);

            // Skill logic
            let finalDefense = rolledMagicalDefense;
            if (rollType === 'skill') {
                // Apply skill bonus and reduce mana
                finalDefense += bonusDefense;

                // Deduct mana by the skill cost
                await User.updateOne(
                    { discordId: userId },
                    { $inc: { "mana.current": -manaCost } } // Decrease mana by the skill cost
                );
            }

            // Buat embed untuk response
            const embed = new EmbedBuilder()
                .setTitle(`🎲 ${interaction.user.username}'s Magical Defense Roll 🎲`)
                .setColor(rollType === 'critical' ? '#FF0000' : (rollType === 'reduced' ? '#00FF00' : '#5733FF')) // Red for critical, Green for reduced, Blue for normal
                .setImage('https://media1.tenor.com/m/mDSa8CcMd9sAAAAd/encounter-party-encounterparty.gif')
                .addFields(
                    { name: 'Base Magical Defense Roll', value: `${maxMagicalDefense}`, inline: true },
                    { name: 'Roll Type', value: rollType === 'critical' ? 'Critical (+25%)' : (rollType === 'reduced' ? 'Reduced (-50%)' : 'Normal'), inline: true },
                    { name: 'Final Defense Roll', value: `${finalDefense}`, inline: true },
                    { name: 'Mana Remaining', value: `${userData.mana.current - manaCost}`, inline: true }
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
