const { SlashCommandBuilder } = require('@discordjs/builders');
const { CommandInteraction } = require('discord.js');
const Bank = require('../models/bank'); // Make sure this path is correct

module.exports = {
    data: new SlashCommandBuilder()
        .setName('checkbalancebank')
        .setDescription('Cek saldo bank yang dikelola'),

    /**
     * @param {CommandInteraction} interaction 
     */
    async execute(interaction) {
        // Find bank info for the manager
        const bankInfo = await Bank.findOne({ managerId: interaction.user.id });

        if (!bankInfo) {
            return interaction.reply({ content: 'Kamu bukan pengelola bank atau bank tidak ditemukan.', ephemeral: true });
        }

        interaction.reply({ content: `💰 Saldo bank **${bankInfo.name}**: **${bankInfo.celes} Celes**` });
    },
};
