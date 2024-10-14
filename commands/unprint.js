const { SlashCommandBuilder } = require('@discordjs/builders');
const User = require('../models/user');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unprint')
        .setDescription('Unprint celes dari pengguna.')
        .addUserOption(option => option.setName('target').setDescription('Pengguna yang ingin di-unprint celes-nya').setRequired(true))
        .addIntegerOption(option => option.setName('amount').setDescription('Jumlah celes yang ingin di-unprint').setRequired(true)),
    async execute(interaction) {
        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
            return interaction.reply({ content: 'Anda tidak memiliki izin untuk menggunakan perintah ini.', ephemeral: true });
        }

        const targetUser = interaction.options.getUser('target');
        const amount = interaction.options.getInteger('amount');
        const recipient = await User.findOne({ discordId: targetUser.id });

        if (!recipient) {
            return interaction.reply({ content: 'Pengguna tersebut belum terdaftar!', ephemeral: true });
        }

        if (amount <= 0) {
            return interaction.reply({ content: 'Jumlah celes yang ingin di-unprint harus lebih dari 0.', ephemeral: true });
        }

        if (recipient.celes < amount) {
            return interaction.reply({ content: 'Saldo celes tidak cukup untuk unprint!', ephemeral: true });
        }

        // Deduct celes
        recipient.celes -= amount;
        await recipient.save();

        // Notify target user about the unprint action
        await targetUser.send(`⚠️ ${interaction.user.username} telah melakukan unprint ${amount} celes dari akun Anda.`).catch(console.error);

        await interaction.reply(`Celes berhasil di-unprint dari ${targetUser.username}: ${amount} celes.`);
    },
};
