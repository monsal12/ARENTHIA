const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../models/user'); // Model mongoose User
const { calculateRoleStats } = require('../helpers/roleStatsHelper'); // Mengimpor fungsi helper

// Fungsi untuk roll nilai antara 0 hingga max
function roll(value) {
    return Math.floor(Math.random() * (value + 1)); // Roll antara 0 hingga nilai yang diberikan
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roll-defens-physical')
        .setDescription('Rolls for Physical Defense based on your profile\'s attributes')
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
            option.setName('stamina_cost')
                .setDescription('The stamina cost for using the skill')
                .setRequired(false)
        ),
    async execute(interaction) {
        try {
            const userId = interaction.user.id;
            const rollType = interaction.options.getString('type');
            const skillName = interaction.options.getString('skill_name');
            const bonusDefense = interaction.options.getInteger('bonus') || 0;
            const staminaCost = interaction.options.getInteger('stamina_cost') || 0;

            // Ambil data user dari database
            const userData = await User.findOne({ discordId: userId });

            if (!userData) {
                return interaction.reply({ content: 'Profile kamu tidak ditemukan! Pastikan kamu sudah terdaftar.', ephemeral: true });
            }

            const { element: role, stats, stamina } = userData;

            // Validasi jika role tidak tersedia
            if (!role) {
                return interaction.reply({ content: 'Role kamu belum diatur. Silakan pilih role terlebih dahulu!', ephemeral: true });
            }

            // Validasi stamina untuk skill
            if (rollType === 'skill' && stamina.current < staminaCost) {
                return interaction.reply({ content: 'Stamina kamu tidak cukup untuk menggunakan skill ini!', ephemeral: true });
            }

            // Kalkulasi stats berdasarkan role
            const roleStats = calculateRoleStats(role, stats);

            // Maximum roll value for Physical Defense
            const maxPhysicalDefense = roleStats.physical_defense;

            // Cek apakah critical roll dipilih dan hitung max value baru
            const criticalRoll = rollType === 'critical';
            const reducedRoll = rollType === 'reduced'; // Check if Reduced Roll is selected
            const criticalMaxValue = criticalRoll ? maxPhysicalDefense * 1.25 : maxPhysicalDefense;
            const reducedMaxValue = reducedRoll ? maxPhysicalDefense * 0.5 : maxPhysicalDefense;

            // Roll untuk Physical Defense (normal, critical, or reduced)
            const rolledPhysicalDefense = roll(reducedRoll ? reducedMaxValue : criticalRoll ? criticalMaxValue : maxPhysicalDefense);

            // Skill logic
            let finalDefense = rolledPhysicalDefense;
            if (rollType === 'skill') {
                // Apply skill bonus and reduce stamina
                finalDefense += bonusDefense;

                // Deduct stamina by the skill cost
                await User.updateOne(
                    { discordId: userId },
                    { $inc: { "stamina.current": -staminaCost } } // Decrease stamina by the skill cost
                );
            }

            // Buat embed untuk response
            const embed = new EmbedBuilder()
                .setTitle(`🎲 ${interaction.user.username}'s Physical Defense Roll 🎲`)
                .setColor(criticalRoll ? '#FF0000' : (reducedRoll ? '#0000FF' : '#FF5733')) // Warna merah untuk critical, biru untuk reduced
                .setImage('https://media1.tenor.com/m/mDSa8CcMd9sAAAAd/encounter-party-encounterparty.gif')
                .addFields(
                    { name: 'Base Physical Defense Roll', value: `${maxPhysicalDefense}`, inline: true },
                    { name: 'Roll Type', value: criticalRoll ? 'Critical (+25% Max)' : (reducedRoll ? 'Reduced (-50% Max)' : 'Normal'), inline: true },
                    { name: 'Final Defense Roll', value: `${finalDefense}`, inline: true },
                    { name: 'Stamina Remaining', value: `${userData.stamina.current - staminaCost}`, inline: true }
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
