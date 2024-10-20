const { SlashCommandBuilder } = require('@discordjs/builders');
const User = require('../models/user'); // Pastikan jalur sesuai

module.exports = {
    data: new SlashCommandBuilder()
        .setName('givefood')
        .setDescription('Memberikan makanan atau minuman ke pengguna lain untuk mengurangi rasa lapar atau haus.')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('Pengguna yang akan diberi makanan atau minuman')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('item')
                .setDescription('Pilih apakah ingin memberikan makanan atau minuman')
                .setRequired(true)
                .addChoices(
                    { name: 'Makanan', value: 'food' },
                    { name: 'Minuman', value: 'drink' }
                )
        )
        .addIntegerOption(option =>
            option.setName('percentage')
                .setDescription('Persentase makanan atau minuman yang ingin diberikan (1-100%)')
                .setRequired(true)
        ),
            
    async execute(interaction) {
        // Role ID yang diizinkan untuk menggunakan command
        const allowedRoles = ['1246365106846044262', '1262721701733470249'];

        // Mengecek apakah pengguna memiliki salah satu dari role yang diizinkan
        const memberRoles = interaction.member.roles.cache.map(role => role.id);
        const hasPermission = allowedRoles.some(roleId => memberRoles.includes(roleId));

        if (!hasPermission) {
            return interaction.reply({ content: 'Kamu tidak memiliki izin untuk menggunakan perintah ini.', ephemeral: true });
        }

        const targetUser = interaction.options.getUser('target');
        const item = interaction.options.getString('item');
        const percentage = interaction.options.getInteger('percentage');

        // Validasi persentase
        if (percentage < 1 || percentage > 100) {
            return interaction.reply({ content: 'Persentase harus antara 1% dan 100%.', ephemeral: true });
        }

        // Mencari pengguna di database berdasarkan Discord ID target
        let user = await User.findOne({ discordId: targetUser.id });

        if (!user) {
            return interaction.reply({ content: 'Pengguna ini belum terdaftar dalam sistem.', ephemeral: true });
        }

        if (item === 'food') {
            // Memberikan makanan
            const newHunger = Math.min(user.hunger + percentage, 100); // Menambahkan hunger sesuai persentase, maksimal 100%
            user.hunger = newHunger;
            await user.save();
            return interaction.reply(`${targetUser.username} telah diberi makanan sebesar ${percentage}%. Hunger sekarang menjadi ${newHunger}%.`);
        } else if (item === 'drink') {
            // Memberikan minuman
            const newThirst = Math.min(user.thirst + percentage, 100); // Menambahkan thirst sesuai persentase, maksimal 100%
            user.thirst = newThirst;
            await user.save();
            return interaction.reply(`${targetUser.username} telah diberi minuman sebesar ${percentage}%. Thirst sekarang menjadi ${newThirst}%.`);
        }
    }
};
