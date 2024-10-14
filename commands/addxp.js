const { SlashCommandBuilder } = require('discord.js');
const User = require('../models/user');
const { checkLevelUp } = require('../helpers/leveling');

const allowedRoleId = 'ROLE_ID_HERE'; // Ganti dengan ID peran yang diizinkan

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addexp')
        .setDescription('Tambah pengalaman ke user tertentu (hanya peran tertentu).')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('User yang ingin diberi pengalaman')
                .setRequired(true))
        .addIntegerOption(option => 
            option.setName('amount')
                .setDescription('Jumlah pengalaman yang akan ditambahkan')
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

            // Menambahkan pengalaman dan menyimpannya ke database
            user.experience += amount;
            await user.save();

            // Memeriksa apakah mereka naik level setelah mendapatkan pengalaman
            const levelUpMessage = await checkLevelUp(user);
            let responseMessage;

            if (levelUpMessage) {
                responseMessage = `${targetUser.username} telah naik level! Selamat! 🎉`;
            } else {
                responseMessage = `${targetUser.username} mendapatkan ${amount} pengalaman!`;
            }

            return interaction.reply({ content: responseMessage });
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: 'Terjadi kesalahan saat menambahkan pengalaman.', ephemeral: true });
        }
    }
};
