const { SlashCommandBuilder } = require('@discordjs/builders');
const User = require('../models/user');
const skills = require('../Data/skills');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('learnskill')
        .setDescription('Pelajari skill baru.')
        .addStringOption(option => 
            option.setName('skill')
                .setDescription('Nama skill yang ingin dipelajari')
                .setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply(); // Memberitahu pengguna bahwa proses sedang berjalan

        const discordId = interaction.user.id;
        const user = await User.findOne({ discordId });

        if (!user) {
            return interaction.editReply('⚠️ **Anda belum mendaftar karakter!** Gunakan /register untuk membuatnya.'); // Mengedit balasan untuk memberikan umpan balik
        }

        const skillName = interaction.options.getString('skill');

        // Filter skill berdasarkan elemen pemain dan level mereka
        const availableSkills = skills.filter(skill => 
            skill.element.toLowerCase() === user.element.toLowerCase() && skill.levelRequired <= user.level
        );

        // Cek jika skill yang ingin dipelajari ada di daftar skill yang tersedia
        const skillToLearn = availableSkills.find(skill => skill.name.toLowerCase() === skillName.toLowerCase());

        if (!skillToLearn) {
            return interaction.editReply(`🚫 **Skill ${skillName} tidak tersedia untuk Anda.** Pastikan Anda memilih skill yang sesuai dengan elemen dan level Anda.`);
        }

        // Tambahkan skill ke daftar skill pengguna
        user.skills.push(skillToLearn.name);
        await user.save();

        return interaction.editReply(`✅ **Anda telah mempelajari skill ${skillToLearn.name}!**`);
    }
};
