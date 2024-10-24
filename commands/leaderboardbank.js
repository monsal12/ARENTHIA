const { SlashCommandBuilder } = require('@discordjs/builders');
const Bank = require('../models/bank'); // Sesuaikan path ke model Bank
const { EmbedBuilder } = require('discord.js'); // Ganti MessageEmbed dengan EmbedBuilder

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bankleaderboard')
        .setDescription('Melihat 10 bank dengan simpanan terbanyak'),

    async execute(interaction) {
        try {
            // Ambil semua bank dari database
            const banks = await Bank.find();

            if (!banks || banks.length === 0) {
                return interaction.reply('Tidak ada bank yang ditemukan.');
            }

            // Buat array untuk menyimpan total celes tiap bank
            const bankTotals = banks.map(bank => ({
                name: bank.name,
                totalCeles: bank.celes, // Total celes per bank
            }));

            // Urutkan berdasarkan jumlah celes terbesar
            const sortedBankTotals = bankTotals
                .sort((a, b) => b.totalCeles - a.totalCeles)
                .slice(0, 10); // Ambil hanya 10 bank teratas

            // Siapkan leaderboard
            let leaderboardText = '🏦 **Bank Leaderboard** 🏦\n\n';
            sortedBankTotals.forEach((bank, index) => {
                leaderboardText += `**${index + 1}. ${bank.name}**: ${bank.totalCeles} celes\n`;
            });

            // Kirimkan leaderboard sebagai embed
            const embed = new EmbedBuilder() // Ganti MessageEmbed dengan EmbedBuilder
                .setTitle('Top 10 Bank dengan Simpanan Terbanyak')
                .setDescription(leaderboardText)
                .setColor('#FFD700');

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            interaction.reply('Terjadi kesalahan saat mengambil leaderboard bank.');
        }
    },
};
