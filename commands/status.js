const { SlashCommandBuilder } = require('@discordjs/builders');
const User = require('../models/user'); // Import model user
const { CronJob } = require('cron'); // Pastikan kamu sudah menginstal paket 'cron'

module.exports = {
    data: new SlashCommandBuilder()
        .setName('status')
        .setDescription('Menampilkan status lapar dan haus pengguna'),

    async execute(interaction) {
        const userId = interaction.user.id;

        // Mencari user berdasarkan ID Discord
        let user = await User.findOne({ discordId: userId });

        // Jika user tidak ditemukan
        if (!user) {
            return interaction.reply("Kamu belum terdaftar. Gunakan perintah pendaftaran terlebih dahulu.");
        }

        // Ambil data hunger dan thirst dari user
        const hunger = user.hunger;
        const thirst = user.thirst;

        // Tampilkan status hunger dan thirst
        await interaction.reply(`**Status Karakter**\n🍗 **Lapar**: ${hunger}%\n💧 **Haus**: ${thirst}%`);

        // Role ID yang akan diberikan ketika hunger/thirst di bawah 20%
        const hungryRoleId = '1295359532872110174'; // Ganti dengan role ID di servermu
        const thirstyRoleId = '1295359653911330867'; // Ganti dengan role ID di servermu

        // Fungsi untuk mengurangi hunger dan thirst sebesar 1% setiap 3 menit
        const hungerAndThirstReduction = new CronJob('*/3 * * * *', async () => {
            // Ambil kembali data user untuk memastikan data terbaru
            user = await User.findOne({ discordId: userId });

            if (!user) return; // Jika user tidak ditemukan, hentikan proses

            // Kurangi hunger dan thirst
            user.hunger = Math.max(user.hunger - 1, 0); // Mengurangi 1%, minimum 0
            user.thirst = Math.max(user.thirst - 1, 0); // Mengurangi 1%, minimum 0

            // Simpan perubahan ke database
            await user.save();

            // Ambil member dari server
            const member = interaction.guild.members.cache.get(userId);

            // Jika hunger < 20%, tambahkan role lapar
            if (user.hunger < 20 && !member.roles.cache.has(hungryRoleId)) {
                await member.roles.add(hungryRoleId);
            } else if (user.hunger >= 20 && member.roles.cache.has(hungryRoleId)) {
                // Jika hunger kembali >= 20%, hapus role lapar
                await member.roles.remove(hungryRoleId);
            }

            // Jika thirst < 20%, tambahkan role haus
            if (user.thirst < 20 && !member.roles.cache.has(thirstyRoleId)) {
                await member.roles.add(thirstyRoleId);
            } else if (user.thirst >= 20 && member.roles.cache.has(thirstyRoleId)) {
                // Jika thirst kembali >= 20%, hapus role haus
                await member.roles.remove(thirstyRoleId);
            }

        });

        // Jalankan pengurangan hunger/thirst secara berkala
        hungerAndThirstReduction.start();
    },
};
