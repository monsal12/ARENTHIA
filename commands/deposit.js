const { SlashCommandBuilder } = require('@discordjs/builders');
const { CommandInteraction, Client } = require('discord.js');
const Bank = require('../models/bank'); // Make sure this path is correct
const User = require('../models/user'); // User model to find the user's celes

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deposit')
        .setDescription('Deposit celes to the bank')
        .addStringOption(option => 
            option.setName('bank')
                .setDescription('Masukkan nama bank')
                .setRequired(true))
        .addIntegerOption(option => 
            option.setName('amount')
                .setDescription('Masukkan jumlah celes yang ingin disimpan')
                .setRequired(true)),
    
    /**
     * @param {CommandInteraction} interaction 
     * @param {Client} bot
     */
    async execute(interaction, bot) {
        const bankName = interaction.options.getString('bank');
        const depositAmount = interaction.options.getInteger('amount');

        // Find the bank by name
        const bank = await Bank.findOne({ name: bankName });

        if (!bank) {
            return interaction.reply({ content: 'Bank tidak ditemukan!', ephemeral: true });
        }

        // Find the user
        const user = await User.findOne({ discordId: interaction.user.id });
        
        if (!user || user.celes < depositAmount) {
            return interaction.reply({ content: 'Kamu tidak memiliki cukup celes untuk melakukan deposit!', ephemeral: true });
        }

        // Calculate the tax (15%)
        const tax = depositAmount * 0.15; // 15% tax
        const amountAfterTax = depositAmount - tax; // Amount to deposit after tax

        // Update the bank's celes and user celes
        bank.celes += amountAfterTax; // Update bank's celes
        user.celes -= depositAmount; // Deduct the full deposit amount from user's celes

        // Update user's celes and bank in the database
        await user.save();
        await bank.save();

        // Optionally, track deposits by user
        const userDeposit = bank.deposits.find(deposit => deposit.userId === interaction.user.id);
        if (userDeposit) {
            userDeposit.amount += amountAfterTax; // Update existing deposit after tax
        } else {
            bank.deposits.push({ userId: interaction.user.id, amount: amountAfterTax }); // New deposit entry
        }

        await bank.save();

        interaction.reply({ content: `✅ Kamu telah berhasil menyimpan **${amountAfterTax} celes** ke bank **${bankName}** setelah pajak 15%!` });
    },
};
