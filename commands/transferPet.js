const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const InventoryPet = require('../models/InventoryPet');
const User = require('../models/user');
const Pet = require('../models/pet');  // Pastikan Anda mengimpor model Pet

module.exports = {
    data: new SlashCommandBuilder()
        .setName('send-pet')
        .setDescription('Send a pet to another user')
        .addStringOption(option =>
            option.setName('pet_code')
                .setDescription('The unique code of the pet you want to send')
                .setRequired(true)
        )
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user you want to send the pet to')
                .setRequired(true)
        ),

    async execute(interaction) {
        const { user } = interaction;
        const petCode = interaction.options.getString('pet_code');
        const recipient = interaction.options.getUser('user');

        try {
            // Get the sender's inventory
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

            // Get recipient's data
            const recipientData = await User.findOne({ discordId: recipient.id });

            if (!recipientData) {
                return interaction.reply({
                    content: 'Recipient not found.',
                    ephemeral: false
                });
            }

            // Check if the sender has the pet
            if (!petItem) {
                return interaction.reply({
                    content: 'You do not own this pet.',
                    ephemeral: false
                });
            }

            // Remove pet from sender's inventory
            inventory.pets = inventory.pets.filter(item => item.uniqueCode !== petCode);
            await inventory.save();

            // Change the pet's owner to the recipient
            pet.owner = recipient.id;  // Set the pet's owner to the recipient's ID
            await pet.save();

            // Add pet to recipient's inventory (create inventory if it doesn't exist)
            let recipientInventory = await InventoryPet.findOne({ user: recipient.id });

            if (!recipientInventory) {
                // If the recipient doesn't have an inventory, create a new one
                recipientInventory = new InventoryPet({
                    user: recipient.id,
                    pets: [{ pet: pet._id, uniqueCode: petCode }]
                });
                await recipientInventory.save();
            } else {
                // If the recipient has an inventory, add the pet to their list
                recipientInventory.pets.push({ pet: pet._id, uniqueCode: petCode });
                await recipientInventory.save();
            }

            // Send confirmation message to the sender
            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle(`Pet Sent: ${pet.name}`)
                .setDescription(`You have successfully sent **${pet.name}** to **${recipient.username}**!`)
                .setThumbnail(pet.image);

            interaction.reply({
                embeds: [embed],
                ephemeral: false
            });

            // Send confirmation message to the recipient
            const recipientEmbed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle(`You Received a Pet: ${pet.name}`)
                .setDescription(`**${user.username}** has sent you **${pet.name}**!`)
                .setThumbnail(pet.image);

            recipient.send({
                embeds: [recipientEmbed]
            });

        } catch (error) {
            console.error(error);
            interaction.reply({
                content: 'There was an error sending the pet. Please try again later.',
                ephemeral: false
            });
        }
    }
};
