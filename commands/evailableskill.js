const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const User = require('../models/user');
const skills = require('../Data/skills');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('availableskill')
        .setDescription('Tampilkan skill yang bisa dipelajari berdasarkan elemen dan level.'),
    async execute(interaction) {
        await interaction.deferReply(); // Memberitahu pengguna bahwa proses sedang berjalan

        try {
            const userId = interaction.user.id;
            const user = await User.findOne({ discordId: userId });

            if (!user) {
                return interaction.editReply('⚠️ **Kamu belum terdaftar.** Silakan mulai petualanganmu terlebih dahulu!'); // Mengedit balasan untuk memberikan umpan balik
            }

            const playerElement = user.element;
            const playerLevel = user.level;

            // Filter skill berdasarkan elemen pemain dan level mereka
            const availableSkills = skills.filter(skill => 
                skill.element.toLowerCase() === playerElement.toLowerCase() && skill.levelRequired <= playerLevel
            );

            if (availableSkills.length === 0) {
                return interaction.editReply('🚫 **Tidak ada skill yang bisa dipelajari** untuk elemen dan levelmu saat ini.'); // Mengedit balasan untuk memberikan umpan balik
            }

            // Format skill yang bisa dipelajari untuk ditampilkan
            const skillList = availableSkills.map(skill => {
                // Pastikan semua properti skill ada sebelum menampilkannya
                const resourceCost = skill.manaCost ? `Mana Cost: ${skill.manaCost}` : `Stamina Cost: ${skill.staminaCost || 'N/A'}`;
                const damageOrHealing = skill.damageFactor 
                    ? `• Damage Factor: ${skill.damageFactor * 100}%`
                    : skill.healingFactor 
                        ? `• Healing Factor: ${skill.healingFactor * 100}%`
                        : '';
                const defenseOrReduction = skill.damageReduction 
                    ? `• Damage Reduction: ${skill.damageReduction * 100}%`
                    : '';

                return `🔥 **${skill.name}** (Level ${skill.levelRequired}):\n• Efek: ${skill.effect}\n• ${resourceCost}\n• Cooldown: ${skill.cooldown} turn\n${damageOrHealing}\n${defenseOrReduction}`;
            }).join('\n\n');

            const embed = new EmbedBuilder()
                .setColor('#FFD700') // Warna emas untuk kesan monarki
                .setTitle('📜 **Skill yang Tersedia**')
                .setDescription(`Berikut adalah skill yang bisa dipelajari oleh pahlawan yang berjaya:\n\n${skillList}`)
                .setFooter({ text: '⚔️ Bersiaplah untuk menguasai kekuatan legendaris!' })
                .setTimestamp();

            // Mengedit balasan untuk mengirimkan embed
            return interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            return interaction.editReply('❌ **Terjadi kesalahan** saat mengambil daftar skill. Pastikan semua data sudah terisi dengan benar.'); // Mengedit balasan untuk memberikan umpan balik
        }
    }
};