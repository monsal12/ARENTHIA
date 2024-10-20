const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../models/user');
const Weapon = require('../models/weapon');
const Armor = require('../models/armor');
const Accessory = require('../models/accessory'); // Assuming you have an Accessory model

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unequip')
        .setDescription('Unequip the current weapon, armor, or accessory')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Type of the item to unequip (weapon, armor, or accessory)')
                .addChoices(
                    { name: 'weapon', value: 'weapon' },
                    { name: 'armor', value: 'armor' },
                    { name: 'accessory', value: 'accessory' } // Added accessory option
                )
                .setRequired(true)
        ),
    async execute(interaction) {
        const userId = interaction.user.id;
        const itemType = interaction.options.getString('type');

        const user = await User.findOne({ discordId: userId })
            .populate('weapons')
            .populate('armors')
            .populate('accessories'); // Ensure accessories are populated

        if (!user) {
            return interaction.reply('⚠️ User not found.');
        }

        let itemName;

        try {
            if (itemType === 'weapon') {
                if (!user.equippedWeapon) {
                    return interaction.reply('⚠️ You do not have any weapon equipped.');
                }

                const currentlyEquippedWeapon = await Weapon.findById(user.equippedWeapon);
                if (!currentlyEquippedWeapon) {
                    console.error('Currently equipped weapon not found:', user.equippedWeapon);
                    return interaction.reply('⚠️ Equipped weapon not found.');
                }

                // Revert weapon stats
                user.stats.strength -= currentlyEquippedWeapon.strength || 0;
                user.stats.intelligence -= currentlyEquippedWeapon.intelligence || 0;
                user.stats.ability -= currentlyEquippedWeapon.ability || 0;
                itemName = currentlyEquippedWeapon.name;

                user.equippedWeapon = null; // Unequip weapon

            } else if (itemType === 'armor') {
                if (!user.equippedArmor) {
                    return interaction.reply('⚠️ You do not have any armor equipped.');
                }

                const currentlyEquippedArmor = await Armor.findById(user.equippedArmor);
                if (!currentlyEquippedArmor) {
                    console.error('Currently equipped armor not found:', user.equippedArmor);
                    return interaction.reply('⚠️ Equipped armor not found.');
                }

                // Revert armor stats
                user.stats.strength -= currentlyEquippedArmor.strength || 0; 
                user.stats.intelligence -= currentlyEquippedArmor.intelligence || 0;
                user.stats.ability -= currentlyEquippedArmor.ability || 0;
                itemName = currentlyEquippedArmor.name;

                user.equippedArmor = null; // Unequip armor

            } else if (itemType === 'accessory') {
                if (!user.equippedAccessory) {
                    return interaction.reply('⚠️ You do not have any accessory equipped.');
                }

                const currentlyEquippedAccessory = await Accessory.findById(user.equippedAccessory);
                if (!currentlyEquippedAccessory) {
                    console.error('Currently equipped accessory not found:', user.equippedAccessory);
                    return interaction.reply('⚠️ Equipped accessory not found.');
                }

                // Revert accessory stats
                user.stats.strength -= currentlyEquippedAccessory.strength || 0;
                user.stats.intelligence -= currentlyEquippedAccessory.intelligence || 0;
                user.stats.ability -= currentlyEquippedAccessory.ability || 0;
                itemName = currentlyEquippedAccessory.name;

                user.equippedAccessory = null; // Unequip accessory
            }

            await user.save();

            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle(`❌ Successfully unequipped **${itemName}**!`)
                .setDescription(`Your stats have been updated:\n- Strength: ${user.stats.strength}\n- Intelligence: ${user.stats.intelligence}\n- Ability: ${user.stats.ability}`)
                .setFooter({ text: `✨ Jadilah Bangsawan di Arenithia! Raih EXP dan Celes lebih banyak untuk eksplorasi, raid, dan event! 🔗 Gunakan /premium untuk detail harga dan pembelian!` })
            return interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Error unequipping item:', error);
            return interaction.reply('⚠️ An error occurred while unequipping the item.');
        }
    }
};
