const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const InventoryPet = require('../models/InventoryPet');
const User = require('../models/user');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('view-pet')
        .setDescription('View stats of your pet using its unique code')
        .addStringOption(option =>
            option.setName('pet_code')
                .setDescription('The unique code of the pet you want to view')
                .setRequired(true)  // Pet code is required
        ),

    async execute(interaction) {
        const { user } = interaction;
        const petCode = interaction.options.getString('pet_code');  // Get the pet code

        try {
            // Get user's inventory
            const inventory = await InventoryPet.findOne({ user: user.id }).populate('pets.pet');

            if (!inventory || inventory.pets.length === 0) {
                return interaction.reply({
                    content: 'You do not have any pets in your inventory.',
                    ephemeral: false
                });
            }

            // Find pet by unique code in the inventory
            const petItem = inventory.pets.find(item => item.uniqueCode === petCode);

            if (!petItem) {
                return interaction.reply({
                    content: 'Pet with the provided code not found in your inventory.',
                    ephemeral: false
                });
            }

            const pet = petItem.pet;

            // Check if the pet has valid bonus stats and set default values if missing
            const bonusStats = pet.bonusStats || {
                health: 0,
                mana: 0,
                stamina: 0,
                strength: 0,
                intelligence: 0,
                ability: 0
            };

            // Creating embed to show pet stats
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle(`Pet: ${pet.name}`)
                .setDescription(`Here are the stats of your pet **${pet.name}** with code **${petCode}**`)
                .addFields(
                    { name: 'Health Bonus', value: `+${bonusStats.health} Health`, inline: true },
                    { name: 'Mana Bonus', value: `+${bonusStats.mana} Mana`, inline: true },
                    { name: 'Stamina Bonus', value: `+${bonusStats.stamina} Stamina`, inline: true },
                    { name: 'species', value: pet.species, inline: true }
                )
                .setThumbnail(pet.image || 'https://example.com/default-image.jpg'); // Ensure image is valid

            // Send the embed with pet stats
            interaction.reply({
                embeds: [embed],
                ephemeral: false
            });

        } catch (error) {
            console.error(error);
            interaction.reply({
                content: 'There was an error retrieving your pet stats. Please try again later.',
                ephemeral: false
            });
        }
    }
};
