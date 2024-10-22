const { SlashCommandBuilder } = require('@discordjs/builders');
const { CommandInteraction, Client, EmbedBuilder } = require('discord.js');
const mongoose = require('mongoose');
const User = require('../models/user'); // Pastikan path ini benar
const SYSTEM_ACCOUNT_ID = '994553740864536596'; // ID akun sistem

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slot')
        .setDescription('Main slot dengan celes')
        .addIntegerOption(option => 
            option.setName('amount')
                .setDescription('Jumlah celes yang ingin kamu pertaruhkan')
                .setRequired(true)),
    
    /**
     * @param {CommandInteraction} interaction 
     * @param {Client} bot
     */
    async execute(interaction, bot) {
        const betAmount = interaction.options.getInteger('amount');

        // Mencari pengguna berdasarkan discordId
        let user = await User.findOne({ discordId: interaction.user.id });

        if (!user) {
            return interaction.reply({ content: 'Kamu belum terdaftar di sistem. Gunakan perintah lain untuk mendaftar.', ephemeral: true });
        }

        // Check apakah user memiliki cukup celes untuk bermain
        if (user.celes < betAmount) {
            return interaction.reply({ content: `Kamu tidak memiliki cukup celes untuk bermain. Kamu butuh setidaknya ${betAmount} celes!`, ephemeral: true });
        }

        // Transfer celes ke akun sistem (taruhan slot)
        user.celes -= betAmount;
        let systemAccount = await User.findOne({ discordId: SYSTEM_ACCOUNT_ID });

        // Jika akun sistem belum ada, buat akun baru
        if (!systemAccount) {
            systemAccount = new User({ discordId: SYSTEM_ACCOUNT_ID, celes: 0 });
        }

        systemAccount.celes += betAmount;
        await user.save();
        await systemAccount.save();

        // Membuat embed awal untuk slot
        const embed = new EmbedBuilder()
            .setTitle("🎰 Slot Machine 🎰")
            .setDescription("🔄 Memutar slot... 🔄")
            .setColor('Random')
            .setFooter({ text: "Tunggu sebentar..." });

        // Kirim embed awal
        const slotMessage = await interaction.reply({ embeds: [embed], fetchReply: true });

        // Simulasi animasi slot
        const items = ['💵', '💍', '💯'];
        const spinDuration = 300; // Durasi setiap spin dalam ms
        const spins = 10; // Jumlah spin sebelum hasil final

        for (let i = 0; i < spins; i++) {
            // Ambil hasil slot acak
            const slot1 = items[Math.floor(Math.random() * items.length)];
            const slot2 = items[Math.floor(Math.random() * items.length)];
            const slot3 = items[Math.floor(Math.random() * items.length)];

            // Update embed dengan hasil sementara
            embed.setDescription(`• ${slot1} | ${slot2} | ${slot3} •`);
            await slotMessage.edit({ embeds: [embed] });

            // Tunggu selama spin
            await new Promise(resolve => setTimeout(resolve, spinDuration));
        }

        // Setelah animasi selesai, tentukan hasil akhir
        const finalSlot1 = items[Math.floor(Math.random() * items.length)];
        const finalSlot2 = items[Math.floor(Math.random() * items.length)];
        const finalSlot3 = items[Math.floor(Math.random() * items.length)];

        // Tampilkan hasil akhir di embed
        embed.setDescription(`• ${finalSlot1} | ${finalSlot2} | ${finalSlot3} •`);
        await slotMessage.edit({ embeds: [embed] });

        // Tentukan peluang kemenangan
        const finalOutcome = Math.random() < 0.1; // 30% chance to win

        // Check hasil slot
        if (finalOutcome) {
            // Menang: Ambil celes dari akun sistem dan berikan ke user
            const winAmount = betAmount * 2; // Contoh hadiah 3 kali lipat
            if (systemAccount.celes < winAmount) {
                return interaction.followUp({ content: 'Akun sistem tidak memiliki cukup celes untuk membayar kemenanganmu!', ephemeral: true });
            }

            systemAccount.celes -= winAmount;
            user.celes += winAmount;
            await user.save();
            await systemAccount.save();

            interaction.followUp({ content: `🎉 Selamat! Kamu menang dan mendapatkan ${winAmount} celes! 🎉` });
        } else {
            interaction.followUp({ content: '😞 Kamu kalah! Coba lagi nanti.' });
        }
    },
};
