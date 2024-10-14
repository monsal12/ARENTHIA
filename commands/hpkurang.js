const { SlashCommandBuilder } = require('discord.js');
const User = require('../models/user'); // Import model user

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reducehp')
        .setDescription('Kurangi HP pemain.')
        .addUserOption(option => 
            option
                .setName('target')
                .setDescription('Pilih pemain yang ingin dikurangi HP-nya.')
                .setRequired(true)
        )
        .addIntegerOption(option => 
            option
                .setName('amount')
                .setDescription('Jumlah HP yang ingin dikurangi.')
                .setRequired(true)
        ),

    async execute(interaction) {
        const target = interaction.options.getUser('target'); // Ambil target user
        const amount = interaction.options.getInteger('amount'); // Ambil jumlah HP yang akan dikurangi
        const adminRoleId = '1246365106846044262'; // Role ID admin, ubah sesuai dengan servermu
        
        // Periksa apakah pengguna yang menjalankan command memiliki peran admin
        if (!interaction.member.roles.cache.has(adminRoleId)) {
            return interaction.reply({ content: 'Kamu tidak memiliki izin untuk menjalankan perintah ini.', ephemeral: true });
        }

        // Coba ambil data user target dari database
        try {
            const targetUser = await User.findOne({ discordId: target.id });

            if (!targetUser) {
                return interaction.reply({ content: 'Pengguna tidak ditemukan di database.', ephemeral: true });
            }

            // Kurangi HP (current health) target dengan jumlah yang diberikan
            targetUser.health.current -= amount;

            // Jika HP di bawah 0, set ke 0 (menghindari HP negatif)
            if (targetUser.health.current < 0) {
                targetUser.health.current = 0;
            }

            // Simpan perubahan ke database
            await targetUser.save();

            // Kirim pesan sukses
            return interaction.reply({ content: `HP ${target.username} telah dikurangi sebesar ${amount}. HP sekarang: ${targetUser.health.current}/${targetUser.health.max}.` });
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: 'Terjadi kesalahan saat memperbarui HP pemain.', ephemeral: true });
        }
    },
};
