const { SlashCommandBuilder } = require('@discordjs/builders');
const MaterialInventory = require('../models/MaterialInventory'); // Ganti dengan path yang sesuai

module.exports = {
    data: new SlashCommandBuilder()
        .setName('showinventory')
        .setDescription('Show all materials in your inventory.'),

    async execute(interaction) {
        const userId = interaction.user.id;

        try {
            // Ambil inventory material untuk pengguna
            const inventory = await MaterialInventory.findOne({ userId });  // Ganti InventoryMaterial dengan MaterialInventory

            if (!inventory || inventory.materials.length === 0) {
                return await interaction.reply('Anda tidak memiliki material di inventory.');
            }

            // Format output material yang dimiliki
            let inventoryList = 'Material yang ada di inventory Anda:\n';
            inventory.materials.forEach(item => {
                inventoryList += `${item.materialName} (Tier ${item.tier}): ${item.quantity} pcs\n`;
            });

            await interaction.reply(inventoryList);
        } catch (error) {
            console.error(error);
            await interaction.reply('Terjadi kesalahan saat menampilkan inventory Anda.');
        }
    }
};
