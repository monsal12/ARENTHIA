const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');
const User = require('../models/user'); // Pastikan jalur sesuai

module.exports = {
    data: new SlashCommandBuilder()
        .setName('heal')
        .setDescription('Memberikan heal ke pengguna lain untuk memulihkan HP.')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('Pengguna yang akan di-heal')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Jumlah HP yang akan dipulihkan')
                .setRequired(true)
        ),

    async execute(interaction) {
        // Role ID yang diizinkan untuk menggunakan command
        const allowedRoles = ['1246365106846044262', '1267759659272503296'];

        // Mengecek apakah pengguna memiliki salah satu dari role yang diizinkan
        const memberRoles = interaction.member.roles.cache.map(role => role.id);
        const hasPermission = allowedRoles.some(roleId => memberRoles.includes(roleId));

        if (!hasPermission) {
            return interaction.reply({ content: 'Kamu tidak memiliki izin untuk menggunakan perintah ini.', ephemeral: true });
        }

        const targetUser = interaction.options.getUser('target');
        const healAmount = interaction.options.getInteger('amount');

        // Mencari pengguna di database berdasarkan Discord ID target
        let user = await User.findOne({ discordId: targetUser.id });

        if (!user) {
            return interaction.reply({ content: 'Pengguna ini belum terdaftar dalam sistem.', ephemeral: true });
        }

        // Menghitung HP baru setelah heal
        const newHealth = Math.min(user.health.current + healAmount, user.health.max); // HP tidak boleh melebihi maksimum

        const healthBefore = user.health.current;
        user.health.current = newHealth;
        await user.save();

        // Membuat embed untuk feedback
        const embed = new EmbedBuilder()
            .setTitle(`${targetUser.username} telah di-heal!`)
            .setDescription(`**Jumlah Heal**: ${healAmount} HP\n**HP Sebelum**: ${healthBefore}/${user.health.max}\n**HP Sekarang**: ${newHealth}/${user.health.max}`)
            .setColor(0x00FF00) // Menggunakan hexadecimal untuk hijau
            .setThumbnail(targetUser.displayAvatarURL()) // Avatar pengguna yang di-heal
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
