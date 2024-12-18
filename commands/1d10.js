const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../models/user'); // Mongoose User model

// Function to roll a value between 1 and 10 (1d10)
function roll1d10() {
    return Math.floor(Math.random() * 10) + 1; // Rolls between 1 and 10
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roll-1d10')
        .setDescription('Rolls a 1d10 but requires mana and/or stamina')
        .addIntegerOption(option =>
            option.setName('rolls')
                .setDescription('Number of rolls to perform')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(10)
        )
        .addStringOption(option =>
            option.setName('resource')
                .setDescription('Choose which resource to use: mana, stamina, or both')
                .setRequired(true)
                .addChoices(
                    { name: 'Mana Only', value: 'mana' },
                    { name: 'Stamina Only', value: 'stamina' },
                    { name: 'Mana and Stamina', value: 'both' }
                )
        ),
    async execute(interaction) {
        try {
            const userId = interaction.user.id;
            const numberOfRolls = interaction.options.getInteger('rolls'); // Number of rolls
            const resourceChoice = interaction.options.getString('resource'); // Resource choice (mana, stamina, or both)

            // Get user data from the database
            const userData = await User.findOne({ discordId: userId });

            if (!userData) {
                return interaction.reply({ content: 'Profile kamu tidak ditemukan! Pastikan kamu sudah terdaftar.', ephemeral: true });
            }

            const { stamina, mana } = userData;

            // Check if the user has enough mana and stamina for the rolls
            let requiredMana = 10 * numberOfRolls;
            let requiredStamina = 10 * numberOfRolls;

            // If user chooses to use both mana and stamina, check if they have enough of both
            if (resourceChoice === 'mana' || resourceChoice === 'both') {
                if (mana.current < requiredMana) {
                    return interaction.reply({ content: 'Kamu tidak punya cukup mana untuk melakukan semua roll.', ephemeral: true });
                }
            }
            if (resourceChoice === 'stamina' || resourceChoice === 'both') {
                if (stamina.current < requiredStamina) {
                    return interaction.reply({ content: 'Kamu tidak punya cukup stamina untuk melakukan semua roll.', ephemeral: true });
                }
            }

            let rolls = [];
            let totalRoll = 0;

            // Perform the rolls and calculate the total
            for (let i = 0; i < numberOfRolls; i++) {
                const rollResult = roll1d10();
                rolls.push(rollResult);
                totalRoll += rollResult;
            }

            // Deduct mana and/or stamina based on the user's choice
            let updateFields = {};
            if (resourceChoice === 'mana' || resourceChoice === 'both') {
                updateFields['mana.current'] = -requiredMana;
            }
            if (resourceChoice === 'stamina' || resourceChoice === 'both') {
                updateFields['stamina.current'] = -requiredStamina;
            }

            // Update user data in the database
            await User.updateOne(
                { discordId: userId },
                { $inc: updateFields } // Deduct mana and/or stamina
            );

            // Create the embed for the result
            const embed = new EmbedBuilder()
                .setTitle(`${interaction.user.username}'s 1d10 Roll Results 🎲`)
                .setColor('#FF5733')
                .addFields(
                    { name: 'Number of Rolls', value: `${numberOfRolls}`, inline: true },
                    { name: 'Rolls', value: rolls.join(', '), inline: true },
                    { name: 'Total Roll Value', value: `${totalRoll}`, inline: true },
                    { name: 'Resource Used', value: resourceChoice.charAt(0).toUpperCase() + resourceChoice.slice(1), inline: true },
                    { name: 'Mana Remaining', value: `${userData.mana.current - (resourceChoice === 'mana' || resourceChoice === 'both' ? requiredMana : 0)}`, inline: true },
                    { name: 'Stamina Remaining', value: `${userData.stamina.current - (resourceChoice === 'stamina' || resourceChoice === 'both' ? requiredStamina : 0)}`, inline: true }
                )
                .setFooter({ text: 'Good luck in your adventure!' })
                .setTimestamp();

            // Send the result
            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Terjadi kesalahan saat melakukan roll.', ephemeral: true });
        }
    },
};
