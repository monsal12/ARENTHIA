const { SlashCommandBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, ButtonBuilder } = require('discord.js');
const User = require('../models/user');
const { createProfileEmbed } = require('../helpers/embed');
const { levelUpExperience } = require('../helpers/leveling'); // Import the levelUpExperience function

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Tampilkan profil karakter kamu.'),
    async execute(interaction) {
        const discordId = interaction.user.id;
        const user = await User.findOne({ discordId });

        if (!user) {
            return interaction.reply({ content: 'Anda belum mendaftar karakter! Gunakan /register untuk membuatnya.', ephemeral: true });
        }
        
        // Get the required experience for leveling up
        const requiredExperience = levelUpExperience(user.level);
        
        // Create the profile embed using the createProfileEmbed function
        const embed = createProfileEmbed(user, 'stats', interaction.user.displayAvatarURL());

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('view_stats')
                    .setLabel('Lihat Stats')
                    .setStyle('Primary'),
                new ButtonBuilder()
                    .setCustomId('view_inventory')
                    .setLabel('Lihat Inventory')
                    .setStyle('Secondary'),
            );

        await interaction.reply({ embeds: [embed], components: [row] }); // Corrected here
    },
};
