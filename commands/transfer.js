const { SlashCommandBuilder } = require('@discordjs/builders');
const User = require('../models/user');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('transfer')
        .setDescription('Transfer celes ke pengguna lain.')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('Pengguna yang ingin ditransfer')
                .setRequired(true))
        .addIntegerOption(option => 
            option.setName('amount')
                .setDescription('Jumlah celes yang ingin ditransfer')
                .setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply(); // Menunda respons

        const targetUser = interaction.options.getUser('target');
        const amount = interaction.options.getInteger('amount');
        const sender = await User.findOne({ discordId: interaction.user.id });
        const recipient = await User.findOne({ discordId: targetUser.id });

        if (!sender) {
            return interaction.editReply({ content: 'Anda belum terdaftar! Gunakan /register untuk membuat karakter.', ephemeral: true });
        }

        if (!recipient) {
            return interaction.editReply({ content: 'Pengguna tersebut belum terdaftar!', ephemeral: true });
        }

        // Input validation
        if (amount <= 0) {
            return interaction.editReply({ content: 'Jumlah transfer harus lebih dari 0!', ephemeral: true });
        }

        if (amount > sender.celes) {
            return interaction.editReply({ content: 'Saldo celes tidak cukup untuk transfer!', ephemeral: true });
        }

        const fee = Math.floor(amount * 0.15); // 15% fee
        const totalDeduction = amount + fee; // Total yang akan dikurangi dari pengirim

        // Update saldo pengguna
        sender.celes -= totalDeduction;
        recipient.celes += amount;

        try {
            await sender.save();
            await recipient.save();

            // Mengupdate fee ke akun sistem
            const feeUser = await User.findOne({ discordId: '994553740864536596' });
            if (feeUser) {
                feeUser.celes += fee;
                await feeUser.save();
            }

            await interaction.editReply(`Transfer berhasil! Anda mentransfer ${amount} celes ke ${targetUser.username}.\n**Biaya transaksi:** ${fee} celes.`);
        } catch (error) {
            console.error('Terjadi kesalahan saat melakukan transfer:', error);
            await interaction.editReply({ content: '⚠️ Terjadi kesalahan saat melakukan transfer.', ephemeral: true });
        }
    },
};
