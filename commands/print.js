const { SlashCommandBuilder } = require('@discordjs/builders');
const User = require('../models/user');

const allowedRoleId = 'ROLE_ID_HERE'; // Ganti dengan ID peran yang diizinkan

module.exports = {
    data: new SlashCommandBuilder()
        .setName('print')
        .setDescription('Print celes untuk pengguna.')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('Pengguna yang ingin di-print celes-nya')
                .setRequired(true))
        .addIntegerOption(option => 
            option.setName('amount')
                .setDescription('Jumlah celes yang ingin di-print')
                .setRequired(true)),
    async execute(interaction) {
        // Memeriksa apakah pengguna memiliki peran yang diizinkan
        if (!interaction.member.roles.cache.has(allowedRoleId)) {
            return interaction.reply({ content: '⚠️ Anda tidak memiliki izin untuk menggunakan perintah ini.', ephemeral: true });
        }

        const targetUser = interaction.options.getUser('target');
        const amount = interaction.options.getInteger('amount');
        const recipient = await User.findOne({ discordId: targetUser.id });

        // Memeriksa apakah pengguna terdaftar
        if (!recipient) {
            return interaction.reply({ content: '⚠️ Pengguna tersebut belum terdaftar!', ephemeral: true });
        }

        // Memastikan jumlah celes yang ingin dicetak adalah positif
        if (amount <= 0) {
            return interaction.reply({ content: '❌ Jumlah celes harus lebih besar dari 0!', ephemeral: true });
        }

        // Menambahkan jumlah celes ke penerima
        recipient.celes += amount;
        await recipient.save();

        // Mengirimkan pesan konfirmasi
        return interaction.reply(`✅ Celes berhasil di-print ke ${targetUser.username}: ${amount} celes.`);
    },
};
