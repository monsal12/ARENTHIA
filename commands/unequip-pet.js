const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const InventoryPet = require('../models/InventoryPet');
const User = require('../models/user');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unequip-pet')
        .setDescription('Unequip a pet and remove its bonus stats'),

    async execute(interaction) {
        const { user } = interaction;

        try {
            // Get user's data
            const userData = await User.findOne({ discordId: user.id });

            if (!userData) {
                return interaction.reply({
                    content: 'User data not found.',
                    ephemeral: false
                });
            }

            // Debugging: Log equippedPet
            console.log('Equipped Pet ID:', userData.equippedPet);

            // Check if there's an equipped pet
            if (!userData.equippedPet) {
                return interaction.reply({
                    content: 'You do not have an equipped pet to unequip.',
                    ephemeral: false
                });
            }

            // Get the equipped pet from the user's data
            const equippedPetId = userData.equippedPet;
            const inventory = await InventoryPet.findOne({ user: user.id }).populate('pets.pet');

            if (!inventory) {
                return interaction.reply({
                    content: 'Pet inventory not found.',
                    ephemeral: false
                });
            }

            // Find the equipped pet in the user's inventory
            const equippedPet = inventory.pets.find(item => item.pet._id.toString() === equippedPetId.toString());

            // Debugging: Log if the equipped pet was found
            console.log('Equipped Pet:', equippedPet);

            if (!equippedPet) {
                return interaction.reply({
                    content: 'Equipped pet not found in your inventory.',
                    ephemeral: false
                });
            }

            const pet = equippedPet.pet;

            // Remove the bonus stats from the user
            userData.health.max -= pet.bonusStats.health;
            userData.mana.max -= pet.bonusStats.mana;
            userData.stamina.max -= pet.bonusStats.stamina;

            // Reset current stats to max after unequipping
            userData.health.current = userData.health.max;
            userData.mana.current = userData.mana.max;
            userData.stamina.current = userData.stamina.max;

            // Remove the equipped pet reference
            userData.equippedPet = null;

            // Save the updated user data
            await userData.save();

            // Send confirmation message with the changes
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle(`Pet Unequipped: ${pet.name}`)
                .setDescription(`You have successfully unequipped **${pet.name}**.`)
                .addFields({
                    name: 'Bonus Stats Removed:',
                    value: `-${pet.bonusStats.health} Health, -${pet.bonusStats.mana} Mana, -${pet.bonusStats.stamina} Stamina`
                })
                .setThumbnail(pet.image);

            interaction.reply({
                embeds: [embed],
                ephemeral: false
            });

        } catch (error) {
            console.error(error);
            interaction.reply({
                content: 'There was an error unequipping the pet. Please try again later.',
                ephemeral: false
            });
        }
    }
};
