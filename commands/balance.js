const { SlashCommandBuilder } = require('@discordjs/builders');
const User = require('../models/user');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cekceles')
        .setDescription('Cek saldo celes kamu.'),
    async execute(interaction) {
        // Menunda balasan
        await interaction.deferReply();

        // Cek apakah pengguna terdaftar
        const user = await User.findOne({ discordId: interaction.user.id });

        if (!user) {
            // Balas dengan pesan jika pengguna belum terdaftar
            return interaction.editReply({ content: 'Anda belum terdaftar! Gunakan /register untuk membuat karakter.', ephemeral: true });
        }

        // Dapatkan saldo celes
        const celesBalance = user.celes !== undefined ? user.celes : 0;

        // Balas dengan saldo celes
        return interaction.editReply(`Saldo celes kamu: ${celesBalance}`);
    },
};
