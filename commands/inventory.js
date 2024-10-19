const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Inventory = require('../models/inventory');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('inventory')
        .setDescription('View your weapon and armor inventory'),
    async execute(interaction) {
        await interaction.deferReply(); // Memberitahu pengguna bahwa proses sedang berjalan

        const userId = interaction.user.id;
        const inventory = await Inventory.findOne({ userId }).populate('weapons armors'); // Ambil inventory pengguna

        if (!inventory || (!inventory.weapons || inventory.weapons.length === 0) && (!inventory.armors || inventory.armors.length === 0)) {
            return interaction.editReply('⚠️ You don\'t have any weapons or armors in your inventory.'); // Mengedit balasan untuk memberikan umpan balik
        }

        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle(`${interaction.user.username}'s Inventory`)
            .setDescription('Weapons:\n' +
                (inventory.weapons.length > 0 ? inventory.weapons.map(weapon => 
                    `⚔️ **${weapon.name}** (Grade: ${weapon.grade}) - Code: ${weapon.uniqueCode}`
                ).join('\n') : 'No weapons available.') + 
                '\n\nArmors:\n' +
                (inventory.armors.length > 0 ? inventory.armors.map(armor => 
                    `🛡️ **${armor.name}** (Grade: ${armor.grade}) - Code: ${armor.uniqueCode}`
                ).join('\n') : 'No armors available.'));

        return interaction.editReply({ embeds: [embed] }); // Mengedit balasan untuk mengirimkan embed
    }
};
