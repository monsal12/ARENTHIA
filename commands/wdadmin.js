const { SlashCommandBuilder } = require('@discordjs/builders');
const { CommandInteraction, Client } = require('discord.js');
const Bank = require('../models/bank'); // Pastikan path ini sesuai

const REQUIRED_ROLE_ID = '1246365106846044262'; // Ganti dengan Role ID yang benar

module.exports = {
    data: new SlashCommandBuilder()
        .setName('withdrawetmint')
        .setDescription('Tarik uang dari bank berdasarkan jumlah')
        .addStringOption(option => 
            option.setName('name')
                .setDescription('Masukkan nama bank')
                .setRequired(true))
        .addIntegerOption(option => 
            option.setName('amount')
                .setDescription('Masukkan jumlah uang yang akan ditarik')
                .setRequired(true)),

    /**
     * @param {CommandInteraction} interaction 
     * @param {Client} bot
     */
    async execute(interaction, bot) {
        const bankName = interaction.options.getString('name'); // Ambil nama bank
        const amount = interaction.options.getInteger('amount'); // Ambil jumlah uang yang akan ditarik

        // Periksa apakah user memiliki role yang diperlukan
        if (!interaction.member.roles.cache.has(REQUIRED_ROLE_ID)) {
            return interaction.reply({ content: 'Kamu tidak memiliki izin untuk menggunakan perintah ini!', ephemeral: true });
        }

        // Validasi jumlah uang
        if (amount <= 0) {
            return interaction.reply({ content: '❌ Jumlah uang yang ditarik harus lebih dari 0!', ephemeral: true });
        }

        // Cari bank berdasarkan nama
        const bank = await Bank.findOne({ name: bankName });

        if (!bank) {
            return interaction.reply({ content: `❌ Bank dengan nama **${bankName}** tidak ditemukan!`, ephemeral: true });
        }

        // Periksa apakah saldo mencukupi
        if (bank.celes < amount) {
            return interaction.reply({ content: `❌ Saldo bank **${bankName}** tidak mencukupi untuk menarik **${amount}** celes!`, ephemeral: true });
        }

        // Kurangi saldo bank
        bank.celes -= amount;
        await bank.save();

        interaction.reply({ content: `✅ Kamu berhasil menarik **${amount}** celes dari bank **${bankName}**. Sisa saldo: **${bank.celes}** celes.` });
    },
};