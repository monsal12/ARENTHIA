const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');
const User = require('../models/user'); // Pastikan jalur sesuai

let intervals = new Map(); // Menyimpan interval untuk setiap pengguna

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rest')
        .setDescription('Beristirahat untuk memulihkan mana dan stamina setiap 5 menit.'),

    async execute(interaction) {
        const allowedChannelId = '1283017837287444510'; // Ganti dengan ID channel yang diizinkan

        // Memeriksa apakah command digunakan di channel yang benar
        if (interaction.channel.id !== allowedChannelId) {
            return interaction.reply({ content: `Kamu hanya bisa menggunakan perintah ini di <#${allowedChannelId}>.`, ephemeral: true });
        }

        const discordId = interaction.user.id;
        const user = await User.findOne({ discordId });

        // Jika pengguna belum terdaftar
        if (!user) {
            return interaction.reply({ content: 'Anda belum terdaftar! Gunakan /register untuk mendaftar.', ephemeral: true });
        }

        // Mulai pemulihan setiap 5 menit
        if (intervals.has(discordId)) {
            return interaction.reply({ content: 'Anda sudah beristirahat!', ephemeral: true });
        }

        intervals.set(discordId, setInterval(async () => {
            user.mana.current = Math.min(user.mana.current + 10, user.mana.max);
            user.stamina.current = Math.min(user.stamina.current + 10, user.stamina.max);
            await user.save();

            console.log(`Mana dan stamina dipulihkan untuk ${interaction.user.username}`);
        }, 300000)); // 300000 ms = 5 menit

        // Mengirim pesan bahwa pemulihan dimulai
        await interaction.reply({ content: 'Anda telah mulai beristirahat. Mana dan stamina akan dipulihkan setiap 5 menit.', ephemeral: true });

        // Menangani pesan di channel lain
        interaction.channel.client.on('messageCreate', async (message) => {
            if (message.author.id === interaction.user.id && message.channel.id !== allowedChannelId) {
                console.log(`${interaction.user.username} mengirim pesan di channel lain.`);
                // Jika pengguna mengirim pesan di channel lain, tidak melakukan apa-apa
            }
        });

        // Menambahkan logika untuk menghentikan pemulihan saat keluar dari channel
        interaction.channel.client.on('voiceStateUpdate', async (oldState, newState) => {
            if (newState.member.id === interaction.user.id && newState.channelId !== allowedChannelId) {
                clearInterval(intervals.get(discordId));
                intervals.delete(discordId);
                await interaction.followUp({ content: 'Pemulihan mana dan stamina telah dihentikan.', ephemeral: true });
            }
        });
    }
};
