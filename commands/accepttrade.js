const { SlashCommandBuilder } = require('discord.js');
const Inventory = require('../models/inventory');
const Weapon = require('../models/weapon');
const Armor = require('../models/armor'); // Import Armor model
const Accessory = require('../models/accessory'); // Import Accessory model

module.exports = {
    data: new SlashCommandBuilder()
        .setName('accept')
        .setDescription('Accept a trade request')
        .addUserOption(option => 
            option.setName('trader')
                .setDescription('User who initiated the trade')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Type of item being traded (weapon, armor, or accessory)')
                .setRequired(true)
                .addChoices(
                    { name: 'weapon', value: 'weapon' },
                    { name: 'armor', value: 'armor' },
                    { name: 'accessory', value: 'accessory' } // Add accessory option
                ))
        .addStringOption(option =>
            option.setName('item_id')
                .setDescription('Unique code of the item being traded (weapon, armor, or accessory)')
                .setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply(); // Defer reply for long process

        const traderUser = interaction.options.getUser('trader'); // User who sent the trade
        const itemType = interaction.options.getString('type'); // Type of item (weapon, armor, or accessory)
        const itemCode = interaction.options.getString('item_id'); // Unique code of the item
        const userId = interaction.user.id; // User accepting the trade

        try {
            let item;
            if (itemType === 'weapon') {
                // Find weapon by unique code
                item = await Weapon.findOne({ uniqueCode: itemCode });
                if (!item) {
                    return interaction.editReply('⚠️ Weapon not found.');
                }
            } else if (itemType === 'armor') {
                // Find armor by unique code
                item = await Armor.findOne({ uniqueCode: itemCode });
                if (!item) {
                    return interaction.editReply('⚠️ Armor not found.');
                }
            } else if (itemType === 'accessory') {
                // Find accessory by unique code
                item = await Accessory.findOne({ uniqueCode: itemCode });
                if (!item) {
                    return interaction.editReply('⚠️ Accessory not found.');
                }
            }

            // Find trader's inventory
            const traderInventory = await Inventory.findOne({ userId: traderUser.id });
            if (!traderInventory) {
                return interaction.editReply('⚠️ Trader does not have an inventory.');
            }

            // Check if the item exists in the trader's inventory
            const itemIndex = traderInventory[itemType === 'weapon' ? 'weapons' : itemType === 'armor' ? 'armors' : 'accessories'].indexOf(item._id);
            if (itemIndex === -1) {
                return interaction.editReply(`⚠️ Trader does not have this ${itemType === 'weapon' ? 'weapon' : itemType === 'armor' ? 'armor' : 'accessory'}.`);
            }

            // Find the inventory of the user accepting the trade
            const userInventory = await Inventory.findOne({ userId });
            if (!userInventory) {
                return interaction.editReply('⚠️ You do not have an inventory.');
            }

            // Move the item from the trader to the recipient
            traderInventory[itemType === 'weapon' ? 'weapons' : itemType === 'armor' ? 'armors' : 'accessories'].splice(itemIndex, 1); // Remove item from trader's inventory
            userInventory[itemType === 'weapon' ? 'weapons' : itemType === 'armor' ? 'armors' : 'accessories'].push(item._id); // Add item to recipient's inventory

            // Update the owner of the item
            item.ownerId = userId;
            await item.save();

            // Save changes to both inventories
            await traderInventory.save();
            await userInventory.save();

            return interaction.editReply(`✅ Trade successful! You have received **${item.name}** from ${traderUser.username}.`);
        } catch (error) {
            console.error('An error occurred:', error);
            return interaction.editReply('⚠️ An error occurred while accepting the trade.');
        }
    }
};