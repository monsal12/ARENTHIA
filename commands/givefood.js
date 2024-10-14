const { SlashCommandBuilder } = require('@discordjs/builders');
const User = require('../models/user'); // Pastikan jalur sesuai

module.exports = {
    data: new SlashCommandBuilder()
        .setName('givefood')
        .setDescription('Memberikan makanan ke pengguna lain untuk mengurangi rasa lapar dan haus.')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('Pengguna yang akan diberi makanan')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('percentage')
                .setDescription('Persentase makanan yang akan diberikan (30%, 50%, 80%, 100%)')
                .setRequired(true)
                .addChoices(
                    { name: '30%', value: 30 },
                    { name: '50%', value: 50 },
                    { name: '80%', value: 80 },
                    { name: '100%', value: 100 }
                )
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
        const percentage = interaction.options.getInteger('percentage');

        // Mencari pengguna di database berdasarkan Discord ID target
        let user = await User.findOne({ discordId: targetUser.id });

        if (!user) {
            return interaction.reply({ content: 'Pengguna ini belum terdaftar dalam sistem.', ephemeral: true });
        }

        // Menghitung persentase makanan yang diberikan
        const newHunger = Math.min(user.hunger + percentage, 100); // Maksimal 100%
        const newThirst = Math.min(user.thirst + percentage, 100); // Maksimal 100%

        user.hunger = newHunger;
        user.thirst = newThirst;
        await user.save();

        return interaction.reply(`${targetUser.username} telah diberi makanan sebesar ${percentage}%. Hunger dan thirst sekarang menjadi ${newHunger}% dan ${newThirst}%.`);
    }
};
