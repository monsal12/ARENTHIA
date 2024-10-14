const { SlashCommandBuilder } = require('@discordjs/builders');
const User = require('../models/user');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unlearnskill')
        .setDescription('Menghapus skill yang sudah dipelajari.')
        .addStringOption(option => 
            option.setName('skill')
                .setDescription('Nama skill yang ingin dihapus')
                .setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply(); // Defer the reply

        const discordId = interaction.user.id;

        try {
            const user = await User.findOne({ discordId });

            if (!user) {
                return interaction.editReply({ content: 'Anda belum mendaftar karakter! Gunakan /register untuk membuatnya.', ephemeral: true });
            }

            const skillName = interaction.options.getString('skill');

            if (!user.skills || !user.skills.includes(skillName)) {
                return interaction.editReply({ content: `Anda tidak memiliki skill **${skillName}** untuk dihapus.`, ephemeral: true });
            }

            // Menghapus skill
            user.skills = user.skills.filter(skill => skill !== skillName);
            await user.save();

            return interaction.editReply({ content: `Anda telah menghapus skill **${skillName}**!`, ephemeral: true });
        } catch (error) {
            console.error('Error while unlearning skill:', error);
            return interaction.editReply({ content: '⚠️ Terjadi kesalahan saat menghapus skill.', ephemeral: true });
        }
    }
};
