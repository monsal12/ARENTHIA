const { SlashCommandBuilder } = require('discord.js');
const User = require('../models/user'); // Model mongoose User

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reduce-health')
        .setDescription('Kurangi jumlah health karakter kamu.')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Jumlah health yang ingin dikurangi')
                .setRequired(true)
        ),
    async execute(interaction) {
        try {
            const userId = interaction.user.id;
            const amount = interaction.options.getInteger('amount');

            // Validasi input
            if (amount <= 0) {
                return interaction.reply({ content: 'Jumlah pengurangan harus lebih dari 0!', ephemeral: true });
            }

            // Ambil data user dari database
            const userData = await User.findOne({ discordId: userId });

            if (!userData) {
                return interaction.reply({ content: 'Profil kamu tidak ditemukan! Pastikan kamu sudah terdaftar.', ephemeral: true });
            }

            // Kurangi health
            const newHealth = Math.max(userData.health.current - amount, 0); // Tidak boleh kurang dari 0
            userData.health.current = newHealth;

            // Simpan ke database
            await userData.save();

            // Kirim respons ke pengguna
            await interaction.reply({
                content: `Health kamu berhasil dikurangi sebesar **${amount}**! Sisa health saat ini: **${newHealth}**.`,
                ephemeral: false
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Terjadi kesalahan saat mencoba mengurangi health.', ephemeral: true });
        }
    },
};
