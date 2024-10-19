const { SlashCommandBuilder } = require('discord.js');
const Inventory = require('../models/inventory');
const Weapon = require('../models/weapon');
const Armor = require('../models/armor'); // Make sure Armor model is imported

module.exports = {
    data: new SlashCommandBuilder()
        .setName('trade')
        .setDescription('Trade weapon or armor with another user')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('User to trade with')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('item_id')
                .setDescription('Unique code of the item (weapon or armor) to trade')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Type of the item (weapon or armor)')
                .addChoices(
                    { name: 'weapon', value: 'weapon' },
                    { name: 'armor', value: 'armor' }
                )
                .setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply(); // Defer reply for long process

        const targetUser = interaction.options.getUser('target');
        const itemId = interaction.options.getString('item_id');
        const itemType = interaction.options.getString('type');
        const userId = interaction.user.id;

        try {
            let item;

            // Check if the item is a weapon or armor
            if (itemType === 'weapon') {
                item = await Weapon.findOne({ uniqueCode: itemId });
                if (!item) {
                    return await interaction.editReply('⚠️ Weapon not found.');
                }
            } else if (itemType === 'armor') {
                item = await Armor.findOne({ uniqueCode: itemId });
                if (!item) {
                    return await interaction.editReply('⚠️ Armor not found.');
                }
            }

            const userInventory = await Inventory.findOne({ userId });
            if (!userInventory) {
                return await interaction.editReply('⚠️ You do not have an inventory.');
            }

            const itemIndex = itemType === 'weapon' 
                ? userInventory.weapons.indexOf(item._id) 
                : userInventory.armors.indexOf(item._id);

            if (itemIndex === -1) {
                return await interaction.editReply(`⚠️ You do not have this ${itemType === 'weapon' ? 'weapon' : 'armor'} in your inventory.`);
            }

            const targetInventory = await Inventory.findOne({ userId: targetUser.id });
            if (!targetInventory) {
                return await interaction.editReply('⚠️ The target user does not have an inventory.');
            }

            const targetMember = await interaction.guild.members.fetch(targetUser.id);
            if (!targetMember) {
                return await interaction.editReply('⚠️ Target is not in the same server or cannot receive trade requests right now.');
            }

            try {
                await targetUser.send(`📦 You received a trade request from ${interaction.user.username}.\n\n**Item:** ${item.name}\n**Grade:** ${item.grade}\n**Code:** ${item.uniqueCode}\n\nUse the command \`/accept ${interaction.user.id} ${item.uniqueCode} ${itemType}\` to accept the trade.`);
            } catch (error) {
                return await interaction.editReply('⚠️ Target user cannot be reached via DM.');
            }

            return await interaction.editReply(`✅ Trade request sent to ${targetUser.username}.`);
        } catch (error) {
            console.error('Error occurred:', error);
            await interaction.editReply('⚠️ An error occurred while executing the command.');
        }
    }
};
