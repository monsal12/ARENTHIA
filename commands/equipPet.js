const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');  // Use EmbedBuilder instead of MessageEmbed
const InventoryPet = require('../models/InventoryPet');
const User = require('../models/user');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('equip-pet')
        .setDescription('Equip a pet to gain its bonus stats')
        .addStringOption(option =>
            option.setName('pet_code')
                .setDescription('The unique code of the pet you want to equip')
                .setRequired(true)  // Pastikan opsi ini wajib
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
                    ephemeral: false
                });
            }

            // Find pet by code
            const petItem = inventory.pets.find(item => item.uniqueCode === petCode);

            if (!petItem) {
                return interaction.reply({
                    content: 'Pet not found in your inventory.',
                    ephemeral: false
                });
            }

            const pet = petItem.pet;

            // Get user's data
            const userData = await User.findOne({ discordId: user.id });

            if (!userData) {
                return interaction.reply({
                    content: 'User data not found.',
                    ephemeral: false
                });
            }

            // Check if pet is already equipped
            if (userData.equippedPet) {
                return interaction.reply({
                    content: 'You already have a pet equipped. Please unequip your current pet before equipping a new one.',
                    ephemeral: false
                });
            }

            // Apply bonus stats from the pet
            userData.health.max += pet.bonusStats.health;
            userData.mana.max += pet.bonusStats.mana;
            userData.stamina.max += pet.bonusStats.stamina;

            // Set current health, mana, and stamina equal to max values
            userData.health.current = userData.health.max;
            userData.mana.current = userData.mana.max;
            userData.stamina.current = userData.stamina.max;

            // Set equipped pet to this pet
            userData.equippedPet = pet._id;  // Assuming 'equippedPet' is a field in the user schema

            // Save updated user data
            await userData.save();

            // Send confirmation message
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle(`Pet Equipped: ${pet.name}`)
                .setDescription(`You have successfully equipped **${pet.name}**!`)
                .addFields({
                    name: 'Bonus Stats Applied:',
                    value: `+${pet.bonusStats.health} Health, +${pet.bonusStats.mana} Mana, +${pet.bonusStats.stamina} Stamina`
                })
                .setThumbnail(pet.image);

            interaction.reply({
                embeds: [embed],
                ephemeral: false
            });

        } catch (error) {
            console.error(error);
            interaction.reply({
                content: 'There was an error equipping the pet. Please try again later.',
                ephemeral: false
            });
        }
    }
};
