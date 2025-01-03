const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const InventoryPet = require('../models/InventoryPet');

// Command untuk melihat inventory pet
module.exports = {
    data: new SlashCommandBuilder()
        .setName('inventorypet')
        .setDescription('Show all pets in your inventory'),

    async execute(interaction) {
        const { user } = interaction;

        try {
            // Dapatkan inventory pet pengguna
            const inventory = await InventoryPet.findOne({ user: user.id }).populate('pets.pet');

            if (!inventory || inventory.pets.length === 0) {
                return interaction.reply({
                    content: 'You have no pets in your inventory.',
                    ephemeral: true
                });
            }

            // Buat embed untuk inventory
            const embed = new MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`${user.username}'s Pet Inventory`)
                .setDescription('Here are the pets in your inventory:');

            // Tambahkan setiap pet ke dalam embed
            inventory.pets.forEach((item, index) => {
                const pet = item.pet;

                embed.addFields({
                    name: `${index + 1}. **${pet.name}** (Code: ${item.uniqueCode})`,
                    value: `[Pet Image](${pet.image})`, // Tampilkan gambar pet sebagai link
                    inline: true
                });
            });

            // Kirim embed dengan informasi inventory
            interaction.reply({
                embeds: [embed],
                ephemeral: true
            });

        } catch (error) {
            console.error(error);
            interaction.reply({
                content: 'There was an error retrieving your inventory. Please try again later.',
                ephemeral: true
            });
        }
    }
};
