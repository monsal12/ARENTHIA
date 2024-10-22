const { SlashCommandBuilder } = require('@discordjs/builders');
const { CommandInteraction } = require('discord.js');
const Bank = require('../models/bank'); // Pastikan path ini benar
const User = require('../models/user'); // Pastikan path ini benar

module.exports = {
    data: new SlashCommandBuilder()
        .setName('withdraw')
        .setDescription('Tarik celes dari bank')
        .addIntegerOption(option => 
            option.setName('amount')
                .setDescription('Jumlah Celes yang ingin ditarik')
                .setRequired(true)),

    /**
     * @param {CommandInteraction} interaction 
     */
    async execute(interaction) {
        const amount = interaction.options.getInteger('amount');
        const userId = interaction.user.id;

        // Ambil informasi bank berdasarkan user sebagai manager
        const bankInfo = await Bank.findOne({ managerId: userId });

        if (!bankInfo) {
            return interaction.reply({ content: 'Kamu bukan pengelola bank atau bank tidak ditemukan.', ephemeral: true });
        }

        // Periksa apakah bank memiliki cukup celes
        if (amount > bankInfo.celes) {
            return interaction.reply({ content: 'Saldo bank tidak cukup untuk melakukan penarikan ini.', ephemeral: true });
        }

        // Kurangi saldo dari bank
        bankInfo.celes -= amount;
        await bankInfo.save(); // Simpan perubahan saldo bank

        // Ambil data user dari database
        const user = await User.findOne({ discordId: userId });

        if (!user) {
            return interaction.reply({ content: 'Data pengguna tidak ditemukan.', ephemeral: true });
        }

        // Tambahkan celes ke saldo user
        user.celes += amount;
        await user.save(); // Simpan perubahan saldo user

        // Berikan konfirmasi bahwa penarikan berhasil
        interaction.reply({ content: `✅ Kamu telah menarik **${amount} Celes** dari bank **${bankInfo.name}**. Saldo bank sekarang: **${bankInfo.celes} Celes**. Saldo kamu sekarang: **${user.celes} Celes**` });
    },
};
