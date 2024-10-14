const { SlashCommandBuilder } = require('discord.js');
const User = require('../models/user');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboardlv')
        .setDescription('Menampilkan leaderboard level tertinggi.'),
    async execute(interaction) {
        await interaction.deferReply(); // Menyatakan bahwa proses sedang berjalan

        try {
            // Ambil 10 pengguna teratas yang diurutkan berdasarkan level dan pengalaman
            const topUsers = await User.find().sort({ level: -1, experience: -1 }).limit(10);

            if (!topUsers || topUsers.length === 0) {
                return interaction.editReply({ content: 'Tidak ada pemain dalam leaderboard.', ephemeral: true });
            }

            // Membuat embed untuk leaderboard
            const embed = new EmbedBuilder()
                .setTitle('🏆 Leaderboard Level 🏆')
                .setColor('#FFD700') // Warna emas untuk leaderboard
                .setTimestamp();

            topUsers.forEach((user, index) => {
                embed.addFields({
                    name: `${index + 1}. ${user.username}`,
                    value: `Level: ${user.level} | EXP: ${user.experience}`,
                    inline: false
                });
            });

            return interaction.editReply({ embeds: [embed] }); // Mengedit balasan untuk mengirimkan embed
        } catch (error) {
            console.error(error);
            return interaction.editReply({ content: 'Terjadi kesalahan saat mengambil data leaderboard.', ephemeral: true });
        }
    }
};
