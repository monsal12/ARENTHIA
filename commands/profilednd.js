const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../models/user'); // Model mongoose User

// Fungsi untuk menghitung stats berdasarkan role
function calculateRoleStats(role, stats) {
    const { strength, intelligence, ability } = stats;

    let physical_damage, magical_damage, physical_defense, magical_defense, heal;

    switch (role) {
        case 'flame':
        case 'wave':
        case 'venom':
            physical_damage = (strength * 180 / 100) + (ability * 25 / 100);
            magical_damage = (intelligence * 180 / 100) + (ability * 25 / 100);
            physical_defense = (strength * 60 / 100) + (ability * 25 / 100);
            magical_defense = (intelligence * 60 / 100) + (ability * 25 / 100);
            heal = (intelligence * 60 / 100) + (ability * 25 / 100);
            break;
        case 'volt':
        case 'gale':
        case 'alloy':
            physical_damage = (strength * 150 / 100) + (ability * 25 / 100);
            magical_damage = (intelligence * 150 / 100) + (ability * 25 / 100);
            physical_defense = strength + (ability * 25 / 100);
            magical_defense = intelligence + (ability * 25 / 100);
            heal = (intelligence * 60 / 100) + (ability * 25 / 100);
            break;
        case 'frost':
        case 'bloom':
            physical_damage = (strength * 60 / 100) + (ability * 25 / 100);
            magical_damage = (intelligence * 60 / 100) + (ability * 25 / 100);
            physical_defense = (strength * 150 / 100) + (ability * 25 / 100);
            magical_defense = (intelligence * 150 / 100) + (ability * 25 / 100);
            heal = intelligence + (ability * 25 / 100);
            break;
        case 'terra':
            physical_damage = (strength * 60 / 100) + (ability * 25 / 100);
            magical_damage = (intelligence * 60 / 100) + (ability * 25 / 100);
            physical_defense = (strength * 180 / 100) + (ability * 25 / 100);
            magical_defense = (intelligence * 180 / 100) + (ability * 25 / 100);
            heal = (intelligence * 60 / 100) + (ability * 25 / 100);
            break;
        case 'light':
            physical_damage = (strength * 60 / 100) + (ability * 25 / 100);
            magical_damage = (intelligence * 60 / 100) + (ability * 25 / 100);
            physical_defense = (strength * 60 / 100) + (ability * 25 / 100);
            magical_defense = (intelligence * 60 / 100) + (ability * 25 / 100);
            heal = (intelligence * 180 / 100) + (ability * 25 / 100);
            break;
        default:
            throw new Error('Invalid role specified');
    }

    return { physical_damage, magical_damage, physical_defense, magical_defense, heal };
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile-role')
        .setDescription('Displays role-based stats from the database'),
    async execute(interaction) {
        try {
            const userId = interaction.user.id;

            // Ambil data user dari database
            const userData = await User.findOne({ discordId: userId });

            if (!userData) {
                return interaction.reply({ content: 'Profile kamu tidak ditemukan! Pastikan kamu sudah terdaftar.', ephemeral: true });
            }

            const { element: role, stats, health, mana, stamina } = userData;

            // Validasi jika role tidak tersedia
            if (!role) {
                return interaction.reply({ content: 'Role kamu belum diatur. Silakan pilih role terlebih dahulu!', ephemeral: true });
            }

            // Kalkulasi stats berdasarkan role
            const roleStats = calculateRoleStats(role, stats);

            // Hitung mana dan stamina (dibagi 10)
            const manaValue = Math.floor(mana.current / 10);
            const staminaValue = Math.floor(stamina.current / 10);

            // Buat embed untuk response
            const embed = new EmbedBuilder()
                .setTitle(`⚔️ ${interaction.user.username}'s Role: ${role.toUpperCase()} ⚔️`)
                .setColor('#FF5733')
                .addFields(
                    { name: 'Role', value: role.charAt(0).toUpperCase() + role.slice(1), inline: true },
                    { name: 'Health', value: `${health.current} / ${health.max}`, inline: true },
                    { name: 'Mana', value: `${manaValue} (as divided by 10)`, inline: true },
                    { name: 'Stamina', value: `${staminaValue} (as divided by 10)`, inline: true },
                    { name: 'Physical Damage', value: roleStats.physical_damage.toFixed(2), inline: true },
                    { name: 'Magical Damage', value: roleStats.magical_damage.toFixed(2), inline: true },
                    { name: 'Physical Defense', value: roleStats.physical_defense.toFixed(2), inline: true },
                    { name: 'Magical Defense', value: roleStats.magical_defense.toFixed(2), inline: true },
                    { name: 'Heal', value: roleStats.heal.toFixed(2), inline: true }
                )
                .setFooter({ text: 'Use wisely to dominate battles!' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Terjadi kesalahan saat mengambil data profile.', ephemeral: true });
        }
    },
};
