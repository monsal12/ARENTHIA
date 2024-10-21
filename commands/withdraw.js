const { SlashCommandBuilder } = require('@discordjs/builders');
const { CommandInteraction } = require('discord.js');
const Bank = require('../models/bank'); // Make sure this path is correct

module.exports = {
    data: new SlashCommandBuilder()
        .setName('withdraw')
        .setDescription('Tarik celes dari bank')
        .addIntegerOption(option => 
            option.setName('amount')
                .setDescription('Jumlah Celes yang ingin ditarik')
                .setRequired(true)),

    /**
     * @param {CommandInteraction} interaction 
     */
    async execute(interaction) {
        const amount = interaction.options.getInteger('amount');

        // Find bank info for the manager
        const bankInfo = await Bank.findOne({ managerId: interaction.user.id });

        if (!bankInfo) {
            return interaction.reply({ content: 'Kamu bukan pengelola bank atau bank tidak ditemukan.', ephemeral: true });
        }

        // Check if the bank has enough celes
        if (amount > bankInfo.celes) {
            return interaction.reply({ content: 'Saldo bank tidak cukup untuk melakukan penarikan ini.', ephemeral: true });
        }

        // Withdraw amount
        bankInfo.celes -= amount;
        await bankInfo.save();

        interaction.reply({ content: `✅ Kamu telah menarik **${amount} Celes** dari bank **${bankInfo.name}**. Saldo tersisa: **${bankInfo.celes} Celes**` });
    },
};
