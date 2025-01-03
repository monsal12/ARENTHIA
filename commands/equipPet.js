const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const InventoryPet = require('../models/InventoryPet');
const User = require('../models/user');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('equip')
        .setDescription('Equip a pet to gain its bonus stats')
        .addStringOption(option =>
            option.setName('pet_code')
                .setDescription('The unique code of the pet you want to equip')
                .setRequired(true)
        ),

    async execute(interaction) {
        const { user } = interaction;
        const petCode = interaction.options.getString('pet_code');

        try {
            // Get user's inventory
            const inventory = await InventoryPet.findOne({ user: user.id }).populate('pets.pet');

            if (!inventory) {
                return interaction.reply({
                    content: 'You do not have an inventory.',
                    ephemeral: true
                });
            }

            // Find pet by code
            const petItem = inventory.pets.find(item => item.uniqueCode === petCode);

            if (!petItem) {
                return interaction.reply({
                    content: 'Pet not found in your inventory.',
                    ephemeral: true
                });
            }

            const pet = petItem.pet;

            // Equip the pet to the user and apply bonus stats
            const userData = await User.findOne({ discordId: user.id });

            if (!userData) {
                return interaction.reply({
                    content: 'User data not found.',
                    ephemeral: true
                });
            }

            // Apply bonus stats from the pet
            userData.health.max += pet.bonusStats.health;
            userData.mana.max += pet.bonusStats.mana;
            userData.stamina.max += pet.bonusStats.stamina;

            // Set equipped pet to this pet
            userData.equippedPet = pet._id;  // Assuming 'equippedPet' is a field in the user schema

            // Save updated user data
            await userData.save();

            // Send confirmation message
            const embed = new MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`Pet Equipped: ${pet.name}`)
                .setDescription(`You have successfully equipped **${pet.name}**!`)
                .addField('Bonus Stats Applied:', `+${pet.bonusStats.health} Health, +${pet.bonusStats.mana} Mana, +${pet.bonusStats.stamina} Stamina`)
                .setThumbnail(pet.image);

            interaction.reply({
                embeds: [embed],
                ephemeral: true
            });

        } catch (error) {
            console.error(error);
            interaction.reply({
                content: 'There was an error equipping the pet. Please try again later.',
                ephemeral: true
            });
        }
    }
};
