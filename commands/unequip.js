const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../models/user');
const Weapon = require('../models/weapon');
const Armor = require('../models/armor');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unequip')
        .setDescription('Unequip the current weapon or armor')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Type of the item to unequip (weapon or armor)')
                .addChoices(
                    { name: 'weapon', value: 'weapon' },
                    { name: 'armor', value: 'armor' }
                )
                .setRequired(true)
        ),
    async execute(interaction) {
        const userId = interaction.user.id;
        const itemType = interaction.options.getString('type');

        const user = await User.findOne({ discordId: userId })
            .populate('weapons')
            .populate('armors'); // Ensure armors are populated

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

                // Debugging logs
                console.log('Currently equipped armor:', currentlyEquippedArmor);
                console.log(`Before unequip - Strength: ${user.stats.strength}, Intelligence: ${user.stats.intelligence}, Ability: ${user.stats.ability}`);
                
                // Revert armor stats
                user.stats.strength -= currentlyEquippedArmor.strength || 0; 
                user.stats.intelligence -= currentlyEquippedArmor.intelligence || 0;
                user.stats.ability -= currentlyEquippedArmor.ability || 0;
                
                console.log(`Armor stats - Strength: ${currentlyEquippedArmor.statBoost?.strength}, Intelligence: ${currentlyEquippedArmor.statBoost?.intelligence}, Ability: ${currentlyEquippedArmor.statBoost?.ability}`);
                console.log(`After unequip - Strength: ${user.stats.strength}, Intelligence: ${user.stats.intelligence}, Ability: ${user.stats.ability}`);
                
                itemName = currentlyEquippedArmor.name;

                user.equippedArmor = null; // Unequip armor
            }

            await user.save();

            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle(`❌ Successfully unequipped **${itemName}**!`)
                .setDescription(`Your stats have been updated:\n- Strength: ${user.stats.strength}\n- Intelligence: ${user.stats.intelligence}\n- Ability: ${user.stats.ability}`);

            return interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Error unequipping item:', error);
            return interaction.reply('⚠️ An error occurred while unequipping the item.');
        }
    }
};

