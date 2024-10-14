const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../models/user');
const Weapon = require('../models/weapon');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unequip')
        .setDescription('Unequip the current weapon'),
    async execute(interaction) {
        const userId = interaction.user.id;

        const user = await User.findOne({ discordId: userId }).populate('weapons');

        if (!user) {
            return interaction.reply('⚠️ User not found.');
        }

        if (!user.equippedWeapon) {
            return interaction.reply('⚠️ You do not have any weapon equipped.');
        }

        const currentlyEquippedWeapon = await Weapon.findById(user.equippedWeapon);
        if (currentlyEquippedWeapon) {
            // Remove current weapon stats
            user.stats.strength -= currentlyEquippedWeapon.strength;
            user.stats.intelligence -= currentlyEquippedWeapon.intelligence;
            user.stats.ability -= currentlyEquippedWeapon.ability;
        }

        // Unequip the weapon
        user.equippedWeapon = null;

        await user.save();

        const embed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle(`❌ Successfully unequipped **${currentlyEquippedWeapon.name}**!`)
            .setDescription(`Your stats have been updated:\n- Strength: ${user.stats.strength}\n- Intelligence: ${user.stats.intelligence}\n- Ability: ${user.stats.ability}`);

        return interaction.reply({ embeds: [embed] });
    }
};
