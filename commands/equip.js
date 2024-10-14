const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../models/user');
const Weapon = require('../models/weapon');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('equip')
        .setDescription('Equip a weapon')
        .addStringOption(option =>
            option.setName('weapon_id')
                .setDescription('The unique code of the weapon to equip')
                .setRequired(true)),
    async execute(interaction) {
        const userId = interaction.user.id;
        const weaponCode = interaction.options.getString('weapon_id');

        const user = await User.findOne({ discordId: userId }).populate('weapons');
        const weapon = await Weapon.findOne({ uniqueCode: weaponCode });

        if (!user) {
            return interaction.deferreply('⚠️ User not found.');
        }
        if (!weapon) {
            return interaction.deferreply('⚠️ Weapon not found.');
        }

        // Check if the user already has an equipped weapon
        if (user.equippedWeapon) {
            const currentlyEquippedWeapon = await Weapon.findById(user.equippedWeapon);
            if (currentlyEquippedWeapon) {
                // Remove current weapon stats
                user.stats.strength -= currentlyEquippedWeapon.strength;
                user.stats.intelligence -= currentlyEquippedWeapon.intelligence;
                user.stats.ability -= currentlyEquippedWeapon.ability;
            }
        }

        // Equip the new weapon
        user.equippedWeapon = weapon._id;
        user.stats.strength += weapon.strength;
        user.stats.intelligence += weapon.intelligence;
        user.stats.ability += weapon.ability;

        await user.save();

        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle(`✅ Successfully equipped **${weapon.name}**!`)
            .setDescription(`Your stats have been updated:\n- Strength: ${user.stats.strength}\n- Intelligence: ${user.stats.intelligence}\n- Ability: ${user.stats.ability}`);

        return interaction.deferreply({ embeds: [embed] });
    }
};
