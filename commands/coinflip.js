const { SlashCommandBuilder } = require('@discordjs/builders');
const { CommandInteraction, Client, EmbedBuilder } = require('discord.js');
const User = require('../models/user'); // Pastikan path ini benar
const SYSTEM_ACCOUNT_ID = '994553740864536596'; // ID akun sistem

module.exports = {
    data: new SlashCommandBuilder()
        .setName('coinflip')
        .setDescription('Flip koin untuk bertaruh celes')
        .addIntegerOption(option => 
            option.setName('amount')
                .setDescription('Jumlah celes yang ingin kamu pertaruhkan')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('choice')
                .setDescription('Pilih Kepala atau Ekor')
                .setRequired(true)
                .addChoices(
                    { name: 'Kepala', value: 'Kepala' },
                    { name: 'Ekor', value: 'Ekor' }
                )),
    
    /**
     * @param {CommandInteraction} interaction 
     * @param {Client} bot
     */
    async execute(interaction, bot) {
        const betAmount = interaction.options.getInteger('amount');
        const userChoice = interaction.options.getString('choice');

        // Mencari pengguna berdasarkan discordId
        let user = await User.findOne({ discordId: interaction.user.id });

        if (!user) {
            return interaction.reply({ content: 'Kamu belum terdaftar di sistem. Gunakan perintah lain untuk mendaftar.', ephemeral: true });
        }

        // Check apakah user memiliki cukup celes untuk bermain
        if (user.celes < betAmount) {
            return interaction.reply({ content: `Kamu tidak memiliki cukup celes untuk bermain. Kamu butuh setidaknya ${betAmount} celes!`, ephemeral: true });
        }

        // Transfer celes ke akun sistem (taruhan coin flip)
        user.celes -= betAmount;
        let systemAccount = await User.findOne({ discordId: SYSTEM_ACCOUNT_ID });

        // Jika akun sistem belum ada, buat akun baru
        if (!systemAccount) {
            systemAccount = new User({ discordId: SYSTEM_ACCOUNT_ID, celes: 0 });
        }

        systemAccount.celes += betAmount;
        await user.save();
        await systemAccount.save();

        // Membuat embed untuk hasil flip koin
        const embed = new EmbedBuilder()
            .setTitle("🪙 Coin Flip 🪙")
            .setDescription("🔄 Mem-flip koin... 🔄")
            .setColor('Random')
            .setFooter({ text: "Tunggu sebentar..." });

        // Kirim embed awal
        const flipMessage = await interaction.reply({ embeds: [embed], fetchReply: true });

        // Simulasi flip koin
        const results = ['Kepala', 'Ekor'];
        const emojiMap = {
            'Kepala': '🪙', // Emoji untuk Kepala
            'Ekor': '🔄'    // Emoji untuk Ekor
        };
        const flipDuration = 1000; // Durasi flip dalam ms

        // Tunggu selama flip
        await new Promise(resolve => setTimeout(resolve, flipDuration));

        // Tentukan peluang kemenangan
        const winChance = Math.random() < 0.1; // 10% peluang kemenangan

        // Tentukan hasil akhir flip
        let finalResult;
        if (winChance) {
            finalResult = userChoice; // Pemain menang jika masuk 10%
        } else {
            // Pilih hasil yang berbeda dari pilihan pengguna
            finalResult = userChoice === 'Kepala' ? 'Ekor' : 'Kepala';
        }

        // Update embed dengan hasil akhir
        embed.setDescription(`Hasil flip koin: **${emojiMap[finalResult]} ${finalResult}**`);
        await flipMessage.edit({ embeds: [embed] });

        // Check hasil flip
        if (winChance) {
            // Menang: Ambil celes dari akun sistem dan berikan ke user
            const winAmount = betAmount * 2; // Pengguna mendapatkan dua kali lipat taruhan
            systemAccount.celes -= winAmount;
            user.celes += winAmount;
            await user.save();
            await systemAccount.save();

            interaction.followUp({ content: `🎉 Selamat! Kamu menang dan mendapatkan **${winAmount} celes!** 🎉` });
        } else {
            interaction.followUp({ content: '😞 Kamu kalah! Coba lagi nanti.' });
        }
    },
};
