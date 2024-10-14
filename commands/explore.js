const { SlashCommandBuilder } = require('discord.js');
const { initBattle } = require('../helpers/battle');
const User = require('../models/user'); // Pastikan Anda mengimpor model User
const Monster = require('../models/monster'); // Import model monster

module.exports = {
    data: new SlashCommandBuilder()
        .setName('explore')
        .setDescription('Jelajahi dan temui monster!'),
    async execute(interaction) {
        const user = await User.findOne({ discordId: interaction.user.id });
        const monster = await Monster.findOne(); // Dapatkan monster acak dari database

        // Mulai pertarungan dengan monster
        await initBattle(interaction, user, monster);
    },
};