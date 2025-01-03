const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const InventoryPet = require('../models/InventoryPet');
const User = require('../models/user');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('view-pet')
        .setDescription('View all stats of your pet'),

    async execute(interaction) {
        const { user } = interaction;

        try {
            // Get user's inventory
            const inventory = await InventoryPet.findOne({ user: user.id }).populate('pets.pet');

            if (!inventory || inventory.pets.length === 0) {
                return interaction.reply({
                    content: 'You do not have any pets in your inventory.',
                    ephemeral: false
                });
            }

            // Create an embed for each pet in the inventory
            const embeds = inventory.pets.map(item => {
                const pet = item.pet;

                // Creating embed for each pet
                return new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle(`Pet: ${pet.name}`)
                    .setDescription(`Here are the stats of your pet **${pet.name}**`)
                    .addFields(
                        { name: 'Health Bonus', value: `+${pet.bonusStats.health} Health`, inline: true },
                        { name: 'Mana Bonus', value: `+${pet.bonusStats.mana} Mana`, inline: true },
                        { name: 'Stamina Bonus', value: `+${pet.bonusStats.stamina} Stamina`, inline: true },
                        { name: 'Strength Bonus', value: `+${pet.bonusStats.strength} Strength`, inline: true },
                        { name: 'Intelligence Bonus', value: `+${pet.bonusStats.intelligence} Intelligence`, inline: true },
                        { name: 'Ability Bonus', value: `+${pet.bonusStats.ability} Ability`, inline: true }
                    )
                    .setThumbnail(pet.image)
                    .setFooter(`Pet Code: ${item.uniqueCode}`);
            });

            // Send embeds (all pets in user's inventory)
            interaction.reply({
                embeds: embeds,
                ephemeral: false
            });

        } catch (error) {
            console.error(error);
            interaction.reply({
                content: 'There was an error retrieving your pets. Please try again later.',
                ephemeral: false
            });
        }
    }
};
