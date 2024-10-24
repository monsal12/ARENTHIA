const { SlashCommandBuilder } = require('@discordjs/builders');
const Bank = require('../models/bank'); // Sesuaikan path ke model Bank
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bankleaderboard')
        .setDescription('Melihat 10 pengguna dengan simpanan terbanyak di semua bank'),

    async execute(interaction) {
        try {
            // Ambil semua bank dari database
            const banks = await Bank.find();

            if (!banks || banks.length === 0) {
                return interaction.reply('Tidak ada bank yang ditemukan.');
            }

            // Buat objek untuk menyimpan total simpanan tiap pengguna dari semua bank
            const userDeposits = {};

            // Iterasi setiap bank dan kumpulkan semua deposit
            banks.forEach(bank => {
                bank.deposits.forEach(deposit => {
                    if (userDeposits[deposit.userId]) {
                        userDeposits[deposit.userId] += deposit.amount;
                    } else {
                        userDeposits[deposit.userId] = deposit.amount;
                    }
                });
            });

            // Ubah objek menjadi array, lalu urutkan berdasarkan jumlah celes terbesar
            const sortedDeposits = Object.entries(userDeposits)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10); // Ambil hanya 10 pengguna teratas

            // Siapkan leaderboard
            let leaderboardText = '🏦 **Global Bank Leaderboard** 🏦\n\n';
            sortedDeposits.forEach((deposit, index) => {
                leaderboardText += `**${index + 1}. <@${deposit[0]}>**: ${deposit[1]} celes\n`;
            });

            // Kirimkan leaderboard sebagai embed
            const embed = new MessageEmbed()
                .setTitle('Top 10 Pengguna Terkaya di Bank')
                .setDescription(leaderboardText)
                .setColor('#FFD700');

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            interaction.reply('Terjadi kesalahan saat mengambil leaderboard global bank.');
        }
    },
};
