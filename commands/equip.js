const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../models/user');
const Inventory = require('../models/inventory');
const Weapon = require('../models/weapon');
const Armor = require('../models/armor'); // Pastikan model Armor diimpor
const Accessory = require('../models/accessory'); // Pastikan model Accessory diimpor

module.exports = {
    data: new SlashCommandBuilder()
        .setName('equip')
        .setDescription('Equip a weapon, armor, or accessory')
        .addStringOption(option =>
            option.setName('id')
                .setDescription('The unique code of the item to equip')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Type of the item (weapon, armor, or accessory)')
                .addChoices(
                    { name: 'weapon', value: 'weapon' },
                    { name: 'armor', value: 'armor' },
                    { name: 'accessory', value: 'accessory' } // Menambahkan pilihan aksesoris
                )
                .setRequired(true)),
    async execute(interaction) {
        const userId = interaction.user.id;
        const itemId = interaction.options.getString('id');
        const itemType = interaction.options.getString('type');

        try {
            // Find user from User model
            const user = await User.findOne({ discordId: userId });
            if (!user) {
                return interaction.reply('⚠️ User not found.');
            }

            // Find the user's inventory
            const inventory = await Inventory.findOne({ userId: userId }).populate('weapons').populate('armors').populate('accessories'); // Menambahkan populate untuk aksesoris
            if (!inventory) {
                return interaction.reply('⚠️ You don\'t have an inventory.');
            }

            let item;

            if (itemType === 'weapon') {
                // Find weapon by unique code
                item = await Weapon.findOne({ uniqueCode: itemId });
                if (!item) {
                    return interaction.reply('⚠️ Weapon not found.');
                }

                // Check if the weapon is in the user's inventory
                const weaponInInventory = inventory.weapons.some(w => String(w._id) === String(item._id));
                if (!weaponInInventory) {
                    return interaction.reply('⚠️ You do not own this weapon.');
                }

                // Prevent equipping the same weapon
                if (user.equippedWeapon && String(user.equippedWeapon) === String(item._id)) {
                    return interaction.reply('⚠️ You already have this weapon equipped.');
                }

                // If the user has another weapon equipped, remove the stats from the current weapon
                if (user.equippedWeapon) {
                    const currentlyEquippedWeapon = await Weapon.findById(user.equippedWeapon);
                    if (currentlyEquippedWeapon) {
                        user.stats.strength -= currentlyEquippedWeapon.strength;
                        user.stats.intelligence -= currentlyEquippedWeapon.intelligence;
                        user.stats.ability -= currentlyEquippedWeapon.ability;
                    }
                }

                // Equip the new weapon and apply its stats
                user.equippedWeapon = item._id;
                user.stats.strength += item.strength;
                user.stats.intelligence += item.intelligence;
                user.stats.ability += item.ability;

            } else if (itemType === 'armor') {
                // Find armor by unique code
                item = await Armor.findOne({ uniqueCode: itemId });
                if (!item) {
                    return interaction.reply('⚠️ Armor not found.');
                }

                // Check if the armor is in the user's inventory
                const armorInInventory = inventory.armors.some(a => String(a._id) === String(item._id));
                if (!armorInInventory) {
                    return interaction.reply('⚠️ You do not own this armor.');
                }

                // Prevent equipping the same armor
                if (user.equippedArmor && String(user.equippedArmor) === String(item._id)) {
                    return interaction.reply('⚠️ You already have this armor equipped.');
                }

                // If the user has another armor equipped, remove the stats from the current armor
                if (user.equippedArmor) {
                    const currentlyEquippedArmor = await Armor.findById(user.equippedArmor);
                    if (currentlyEquippedArmor) {
                        user.stats.strength -= currentlyEquippedArmor.strength;
                        user.stats.intelligence -= currentlyEquippedArmor.intelligence;
                        user.stats.ability -= currentlyEquippedArmor.ability;
                    }
                }

                // Equip the new armor and apply its stats
                user.equippedArmor = item._id;
                user.stats.strength += item.strength;
                user.stats.intelligence += item.intelligence;
                user.stats.ability += item.ability;

            } else if (itemType === 'accessory') {
                // Find accessory by unique code
                item = await Accessory.findOne({ uniqueCode: itemId });
                if (!item) {
                    return interaction.reply('⚠️ Accessory not found.');
                }

                // Check if the accessory is in the user's inventory
                const accessoryInInventory = inventory.accessories.some(a => String(a._id) === String(item._id));
                if (!accessoryInInventory) {
                    return interaction.reply('⚠️ You do not own this accessory.');
                }

                // Prevent equipping the same accessory
                if (user.equippedAccessory && String(user.equippedAccessory) === String(item._id)) {
                    return interaction.reply('⚠️ You already have this accessory equipped.');
                }

                // If the user has another accessory equipped, remove the stats from the current accessory
                if (user.equippedAccessory) {
                    const currentlyEquippedAccessory = await Accessory.findById(user.equippedAccessory);
                    if (currentlyEquippedAccessory) {
                        user.stats.strength -= currentlyEquippedAccessory.strength;
                        user.stats.intelligence -= currentlyEquippedAccessory.intelligence;
                        user.stats.ability -= currentlyEquippedAccessory.ability;
                    }
                }

                // Equip the new accessory and apply its stats
                user.equippedAccessory = item._id;
                user.stats.strength += item.strength;
                user.stats.intelligence += item.intelligence;
                user.stats.ability += item.ability;
            }

            // Save changes to the user
            await user.save();

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle(`✅ Successfully equipped **${item.name}**!`)
                .setDescription(`Your stats have been updated:\n- Strength: ${user.stats.strength}\n- Intelligence: ${user.stats.intelligence}\n- Ability: ${user.stats.ability}`)
                .setFooter({ text: `✨ Jadilah Bangsawan di Arenithia! Raih EXP dan Celes lebih banyak untuk eksplorasi, raid, dan event! 🔗 Gunakan /premium untuk detail harga dan pembelian!` });
            return interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error equipping item:', error);
            return interaction.reply('⚠️ An error occurred while equipping the item.');
        }
    }
};
