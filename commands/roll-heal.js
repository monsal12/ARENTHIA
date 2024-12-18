const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../models/user'); // Mongoose User model
const { calculateRoleStats } = require('../helpers/roleStatsHelper'); // Helper function for role stats

// Function to roll a value between 0 and the given max value
function roll(value) {
    return Math.floor(Math.random() * (value + 1)); // Roll between 0 and the max value
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roll-heal')
        .setDescription('Rolls for Magical Heal based on your profile\'s attributes')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Choose the type of roll')
                .setRequired(true)
                .addChoices(
                    { name: 'Normal Heal', value: 'normal' },
                    { name: 'Critical Heal (+25%)', value: 'critical' },
                    { name: 'Skill Heal', value: 'skill' },
                    { name: 'Reduced Heal (-50%)', value: 'reduced' }
                )
        )
        .addStringOption(option =>
            option.setName('targets')
                .setDescription('Select up to 10 users to heal (mention using @)')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('bonus')
                .setDescription('Bonus heal added to the skill roll')
                .setRequired(false)
        )
        .addIntegerOption(option =>
            option.setName('mana_cost')
                .setDescription('Mana cost for using the skill')
                .setRequired(false)
        ),
    async execute(interaction) {
        try {
            const userId = interaction.user.id;
            const rollType = interaction.options.getString('type');
            const targetMentions = interaction.options.getString('targets').match(/<@(\d+)>/g) || []; // Extract target mentions from the string
            const bonusHeal = interaction.options.getInteger('bonus') || 0;
            const manaCost = interaction.options.getInteger('mana_cost') || 0;

            if (targetMentions.length === 0 || targetMentions.length > 10) {
                return interaction.reply({ content: 'Please mention between 1 to 10 users to heal.', ephemeral: true });
            }

            // Get user data from database
            const userData = await User.findOne({ discordId: userId });

            if (!userData) {
                return interaction.reply({ content: 'Profile kamu tidak ditemukan! Pastikan kamu sudah terdaftar.', ephemeral: true });
            }

            const { element: role, stats, mana } = userData;

            // Validate if the role is set
            if (!role) {
                return interaction.reply({ content: 'Role kamu belum diatur. Silakan pilih role terlebih dahulu!', ephemeral: true });
            }

            // Validate mana for skill
            if (rollType === 'skill' && mana.current < manaCost) {
                return interaction.reply({ content: 'Mana kamu tidak cukup untuk menggunakan skill ini!', ephemeral: true });
            }

            // Calculate role stats based on role
            const roleStats = calculateRoleStats(role, stats);

            // Maximum heal value
            const maxHeal = roleStats.heal;

            // Ensure maxHeal is a valid number
            if (isNaN(maxHeal)) {
                return interaction.reply({ content: 'Error: Invalid magical heal value calculated.', ephemeral: true });
            }

            // Final max value for heal based on roll type
            let finalMaxValue = maxHeal;

            if (rollType === 'critical') {
                finalMaxValue = maxHeal * 1.25; // Critical heal (+25%)
            } else if (rollType === 'reduced') {
                finalMaxValue = maxHeal * 0.5; // Reduced heal (-50%)
            }

            // Ensure finalMaxValue is a valid number
            if (isNaN(finalMaxValue)) {
                return interaction.reply({ content: 'Error: Invalid final max heal value.', ephemeral: true });
            }

            // Roll for magical heal
            const rolledHeal = roll(finalMaxValue);

            // Ensure rolledHeal is a valid number
            if (isNaN(rolledHeal)) {
                return interaction.reply({ content: 'Error: Invalid heal roll value.', ephemeral: true });
            }

            // Apply skill bonus and deduct mana if skill is selected
            let finalHeal = rolledHeal;
            if (rollType === 'skill') {
                finalHeal += bonusHeal;

                // Ensure finalHeal is a valid number
                if (isNaN(finalHeal)) {
                    return interaction.reply({ content: 'Error: Invalid final heal value after bonus.', ephemeral: true });
                }

                // Deduct mana by the skill cost
                await User.updateOne(
                    { discordId: userId },
                    { $inc: { "mana.current": -manaCost } } // Decrease mana by the skill cost
                );
            }

            // Apply healing to each target user
            for (let targetMention of targetMentions) {
                const targetId = targetMention.match(/\d+/)[0]; // Extract the user ID from the mention

                const targetUser = await User.findOne({ discordId: targetId });

                if (!targetUser) {
                    continue; // Skip if the target user is not found
                }

                // Calculate the new health
                const newHealth = Math.min(targetUser.health.current + finalHeal, targetUser.health.max);

                // Ensure that newHealth is a valid number
                if (isNaN(newHealth)) {
                    return interaction.reply({ content: 'Error: Invalid heal value calculated for a target.', ephemeral: true });
                }

                // Update the target health in the database
                await User.updateOne(
                    { discordId: targetId },
                    { $set: { "health.current": newHealth } } // Update target health
                );
            }

            // Create the response embed
            const embed = new EmbedBuilder()
                .setTitle(`🎲 ${interaction.user.username}'s Magical Heal Roll 🎲`)
                .setColor(rollType === 'critical' ? '#FF0000' : (rollType === 'reduced' ? '#00FF00' : '#0000FF'))
                .setImage('https://media1.tenor.com/m/mDSa8CcMd9sAAAAd/encounter-party-encounterparty.gif')
                .addFields(
                    { name: 'Base Magical Heal', value: `${maxHeal}`, inline: true },
                    { name: 'Roll Type', value: rollType === 'critical' ? 'Critical (+25%)' : (rollType === 'reduced' ? 'Reduced (-50%)' : 'Normal'), inline: true },
                    { name: 'Final Heal Roll', value: `${finalHeal}`, inline: true },
                    { name: 'Target(s) Healed', value: targetMentions.join(', '), inline: true }
                )
                .setFooter({ text: 'Good luck in your adventure!' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Terjadi kesalahan saat melakukan heal.', ephemeral: true });
        }
    },
};
