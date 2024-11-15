const { SlashCommandBuilder } = require('discord.js');
const User = require('../models/user');
const { checkLevelUp } = require('../helpers/leveling');

const allowedRoleId = '1246365106846044262'; // Ganti dengan ID peran yang diizinkan

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removeexp')
        .setDescription('Hapus pengalaman dari user tertentu (hanya peran tertentu).')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('User yang ingin dihapus pengalamannya')
                .setRequired(true))
        .addIntegerOption(option => 
            option.setName('amount')
                .setDescription('Jumlah pengalaman yang akan dihapus')
                .setRequired(true)),
    async execute(interaction) {
        // Memeriksa apakah pengguna memiliki peran yang diizinkan
        if (!interaction.member.roles.cache.has(allowedRoleId)) {
            return interaction.reply({ content: '⚠️ Anda tidak memiliki izin untuk menggunakan perintah ini.', ephemeral: true });
        }

        try {
            const targetUser = interaction.options.getUser('user');
            const amount = interaction.options.getInteger('amount');

            const user = await User.findOne({ discordId: targetUser.id });

            if (!user) {
                return interaction.reply({ content: `⚠️ User ${targetUser.username} belum terdaftar.`, ephemeral: true });
            }

            // Mengurangi pengalaman dan menyimpannya ke database
            user.experience -= amount;
            if (user.experience < 0) user.experience = 0; // Menghindari pengalaman menjadi negatif
            await user.save();

            // Memeriksa apakah mereka turun level setelah menghapus pengalaman
            const levelDownMessage = await checkLevelUp(user);
            let responseMessage;

            if (levelDownMessage) {
                responseMessage = `${targetUser.username} telah turun level. 😞`;
            } else {
                responseMessage = `${targetUser.username} kehilangan ${amount} pengalaman!`;
            }

            return interaction.reply({ content: responseMessage });
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: 'Terjadi kesalahan saat menghapus pengalaman.', ephemeral: true });
        }
    }
};
