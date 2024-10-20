const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Inventory = require('../models/inventory');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('inventory')
        .setDescription('Lihat inventory senjata, armor, dan aksesoris kamu.'),
    async execute(interaction) {
        await interaction.deferReply(); // Memberitahu pengguna bahwa proses sedang berjalan

        const userId = interaction.user.id;
        const inventory = await Inventory.findOne({ userId }).populate('weapons armors accessories'); // Ambil inventory pengguna dengan populate senjata, armor, dan aksesoris

        if (!inventory || (!inventory.weapons || inventory.weapons.length === 0) && (!inventory.armors || inventory.armors.length === 0) && (!inventory.accessories || inventory.accessories.length === 0)) {
            return interaction.editReply('⚠️ Kamu tidak memiliki senjata, armor, atau aksesoris dalam inventory.'); // Mengedit balasan untuk memberikan umpan balik
        }

        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle(`${interaction.user.username}'s Inventory`)
            .setDescription('Weapons:\n' +
                (inventory.weapons.length > 0 ? inventory.weapons.map(weapon => 
                    `⚔️ **${weapon.name}** (Grade: ${weapon.grade}) - Code: ${weapon.uniqueCode}`
                ).join('\n') : 'Tidak ada senjata yang tersedia.') + 
                '\n\nArmors:\n' +
                (inventory.armors.length > 0 ? inventory.armors.map(armor => 
                    `🛡️ **${armor.name}** (Grade: ${armor.grade}) - Code: ${armor.uniqueCode}`
                ).join('\n') : 'Tidak ada armor yang tersedia.') +
                '\n\nAksesoris:\n' +
                (inventory.accessories.length > 0 ? inventory.accessories.map(accessory => 
                    `✨ **${accessory.name}** (Grade: ${accessory.grade}) - Code: ${accessory.uniqueCode}`
                ).join('\n') : 'Tidak ada aksesoris yang tersedia.'))
                .setFooter({ text: `✨ Jadilah Bangsawan di Arenithia! Raih EXP dan Celes lebih banyak untuk eksplorasi, raid, dan event! 🔗 Gunakan /premium untuk detail harga dan pembelian!` });

        return interaction.editReply({ embeds: [embed] }); // Mengedit balasan untuk mengirimkan embed
    }
};
