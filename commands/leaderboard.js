const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const User = require('../models/user');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Tampilkan leaderboard celes.'),
    async execute(interaction) {
        await interaction.deferReply(); // Memberitahu pengguna bahwa proses sedang berjalan

        const users = await User.find().sort({ celes: -1 }).limit(10);
        
        // Membuat embed untuk leaderboard
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Leaderboard Celes')
            .setDescription('Berikut adalah leaderboard celes:')
            .setTimestamp()
            .setFooter({ text: `✨ Jadilah Bangsawan di Arenithia! Raih EXP dan Celes lebih banyak untuk eksplorasi, raid, dan event! 🔗 Gunakan /premium untuk detail harga dan pembelian!` });
        // Menambahkan setiap pengguna ke embed
        users.forEach((user, index) => {
            embed.addFields({ name: `#${index + 1}: ${user.username}`, value: `${user.celes} celes`, inline: true });
        });

        await interaction.editReply({ embeds: [embed] }); // Mengedit balasan untuk mengirimkan embed
    },
};
