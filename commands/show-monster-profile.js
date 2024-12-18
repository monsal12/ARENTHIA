const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Monster = require('../models/monsterdnd'); // Import the Monster model

module.exports = {
    data: new SlashCommandBuilder()
        .setName('show-monster')
        .setDescription('Shows the profile of your monster.'),
    async execute(interaction) {
        const userId = interaction.user.id;

        try {
            // Fetch the monster created by the user
            const monster = await Monster.findOne({ creatorId: userId });

            if (!monster) {
                return interaction.reply('You don\'t have any monster. Please create one using /create-monster!');
            }

            // Destructure monster properties for easy use
            const { name, health, mana, stamina, strength, intelligence, ability } = monster;

            // Example calculations for physical/magical damage, defense, and healing
            const physicalDamage = (strength * 0.5).toFixed(2);
            const magicalDamage = (intelligence * 0.7).toFixed(2);
            const physicalDefense = (ability * 0.4).toFixed(2);
            const magicalDefense = (intelligence * 0.3).toFixed(2);
            const heal = (intelligence * 0.2).toFixed(2);

            // Calculate mana and stamina based on the values divided by 10 (as per your request)
            const manaValue = (mana.current / 10).toFixed(2);
            const staminaValue = (stamina.current / 10).toFixed(2);

            // Create the embed to show monster profile
            const embed = new EmbedBuilder()
                .setTitle(`${name}'s Monster Profile`)
                .setColor('#FF5733')
                .addFields(
                    { name: 'Role', value: 'Monster', inline: true }, // Set the role to "Monster"
                    { name: 'Health', value: `${health.current} / ${health.max}`, inline: true },
                    { name: 'Mana', value: `${manaValue} (as divided by 10)`, inline: true },
                    { name: 'Stamina', value: `${staminaValue} (as divided by 10)`, inline: true },
                    { name: 'Physical Damage', value: physicalDamage, inline: true },
                    { name: 'Magical Damage', value: magicalDamage, inline: true },
                    { name: 'Physical Defense', value: physicalDefense, inline: true },
                    { name: 'Magical Defense', value: magicalDefense, inline: true },
                    { name: 'Heal', value: heal, inline: true }
                )
                .setFooter({ text: 'Created by ' + interaction.user.username })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            return interaction.reply('There was an error fetching your monster profile.');
        }
    },
};
