const { SlashCommandBuilder } = require('discord.js');
const Monster = require('../models/monsterdnd'); // Import the Monster model

module.exports = {
    data: new SlashCommandBuilder()
        .setName('create-monster')
        .setDescription('Create a custom monster with stats!')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Name of the monster')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('health')
                .setDescription('Monster health')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('mana')
                .setDescription('Monster mana')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('stamina')
                .setDescription('Monster stamina')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('strength')
                .setDescription('Monster strength')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('intelligence')
                .setDescription('Monster intelligence')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('ability')
                .setDescription('Monster ability')
                .setRequired(true)),

    async execute(interaction) {
        const userId = interaction.user.id;
        const monsterName = interaction.options.getString('name');
        const health = interaction.options.getInteger('health');
        const mana = interaction.options.getInteger('mana');
        const stamina = interaction.options.getInteger('stamina');
        const strength = interaction.options.getInteger('strength');
        const intelligence = interaction.options.getInteger('intelligence');
        const ability = interaction.options.getInteger('ability');

        try {
            // Check if the user already has a monster
            const existingMonster = await Monster.findOne({ creatorId: userId });
            if (existingMonster) {
                return interaction.reply('You already have a monster. You can only have one!');
            }

            // Create a new monster with the user's custom stats
            const newMonster = new Monster({
                name: monsterName,
                health: { current: health, max: health },
                mana: { current: mana, max: mana },
                stamina: { current: stamina, max: stamina },
                strength,
                intelligence,
                ability,
                creatorId: userId // Associate the monster with the user
            });

            // Save the monster to the database
            await newMonster.save();

            return interaction.reply(`Your monster, **${monsterName}**, has been created with the following stats: 
            - **Health**: ${health}
            - **Mana**: ${mana}
            - **Stamina**: ${stamina}
            - **Strength**: ${strength}
            - **Intelligence**: ${intelligence}
            - **Ability**: ${ability}`);
        } catch (error) {
            console.error(error);
            return interaction.reply('There was an error creating your monster.');
        }
    },
};
