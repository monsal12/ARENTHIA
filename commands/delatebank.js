const { SlashCommandBuilder } = require('@discordjs/builders');
const { CommandInteraction, Client } = require('discord.js');
const Bank = require('../models/bank'); // Pastikan path ini sesuai

const REQUIRED_ROLE_ID = '1246365106846044262'; // Ganti dengan Role ID yang benar

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deletebank')
        .setDescription('Hapus bank berdasarkan nama')
        .addStringOption(option => 
            option.setName('name')
                .setDescription('Masukkan nama bank yang akan dihapus')
                .setRequired(true)),

    /**
     * @param {CommandInteraction} interaction 
     * @param {Client} bot
     */
    async execute(interaction, bot) {
        const bankName = interaction.options.getString('name'); // Ambil nama bank

        // Periksa apakah user memiliki role yang diperlukan
        if (!interaction.member.roles.cache.has(REQUIRED_ROLE_ID)) {
            return interaction.reply({ content: 'Kamu tidak memiliki izin untuk menggunakan perintah ini!', ephemeral: true });
        }

        // Cari bank berdasarkan nama
        const bankToDelete = await Bank.findOne({ name: bankName });

        if (!bankToDelete) {
            return interaction.reply({ content: `❌ Bank dengan nama **${bankName}** tidak ditemukan!`, ephemeral: true });
        }

        // Hapus bank dari database
        await Bank.deleteOne({ name: bankName });

        interaction.reply({ content: `✅ Bank **${bankName}** berhasil dihapus dari sistem!` });
    },
};
