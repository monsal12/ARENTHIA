const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../models/user'); // Model mongoose User
const { calculateRoleStats } = require('../helpers/roleStatsHelper'); // Mengimpor fungsi helper

// Fungsi untuk roll nilai antara 0 hingga max
function roll(value) {
    return Math.floor(Math.random() * (value + 1)); // Roll antara 0 hingga nilai yang diberikan
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roll-magical')
        .setDescription('Rolls for Magical Damage based on your profile\'s attributes')
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
                .setDescription('Bonus damage added to the skill roll')
                .setRequired(false)
        )
        .addIntegerOption(option =>
            option.setName('mana_cost')
                .setDescription('The mana cost for using the skill')
                .setRequired(false) // Using mana instead of stamina
        ),
    async execute(interaction) {
        try {
            const userId = interaction.user.id;
            const rollType = interaction.options.getString('type');
            const skillName = interaction.options.getString('skill_name');
            const bonusDamage = interaction.options.getInteger('bonus') || 0;
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

            // Maximum roll value for Magical Damage
            const maxMagicalDamage = roleStats.magical_damage;

            // Cek apakah critical roll dipilih dan hitung max value baru
            const criticalRoll = rollType === 'critical';
            const reducedRoll = rollType === 'reduced'; // Check if Reduced Roll is selected
            const criticalMaxValue = criticalRoll ? maxMagicalDamage * 1.25 : maxMagicalDamage;
            const reducedMaxValue = reducedRoll ? maxMagicalDamage * 0.5 : maxMagicalDamage;

            // Roll untuk Magical Damage (normal, critical, or reduced)
            const rolledMagicalDamage = roll(reducedRoll ? reducedMaxValue : criticalRoll ? criticalMaxValue : maxMagicalDamage);

            // Skill logic
            let finalDamage = rolledMagicalDamage;
            if (rollType === 'skill') {
                // Apply skill bonus and reduce mana
                finalDamage += bonusDamage;

                // Deduct mana by the skill cost
                await User.updateOne(
                    { discordId: userId },
                    { $inc: { "mana.current": -manaCost } } // Decrease mana by the skill cost
                );
            }

            // Buat embed untuk response
            const embed = new EmbedBuilder()
                .setTitle(`🎲 ${interaction.user.username}'s Magical Damage Roll 🎲`)
                .setColor(criticalRoll ? '#FF0000' : (reducedRoll ? '#0000FF' : '#FF5733')) // Warna merah untuk critical, biru untuk reduced
                .setImage('https://media1.tenor.com/m/mDSa8CcMd9sAAAAd/encounter-party-encounterparty.gif')
                .addFields(
                    { name: 'Base Magical Damage Roll', value: `${maxMagicalDamage}`, inline: true },
                    { name: 'Roll Type', value: criticalRoll ? 'Critical (+25% Max)' : (reducedRoll ? 'Reduced (-50% Max)' : 'Normal'), inline: true },
                    { name: 'Final Damage Roll', value: `${finalDamage}`, inline: true },
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
