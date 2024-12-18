const { SlashCommandBuilder } = require('discord.js');
const Monster = require('../models/monsterdnd'); // Import the Monster model

module.exports = {
    data: new SlashCommandBuilder()
        .setName('delete-monster')
        .setDescription('Delete your monster from the database.'),
    
    async execute(interaction) {
        const userId = interaction.user.id;

        try {
            // Find the monster created by the user (using creatorId)
            const monster = await Monster.findOne({ creatorId: userId });

            if (!monster) {
                return interaction.reply({
                    content: 'You don\'t have any monster to delete. Please create one using `/create-monster`!',
                    ephemeral: true
                });
            }

            // Delete the monster from the database
            await monster.deleteOne();

            // Send a confirmation message
            await interaction.reply({
                content: `Your monster **${monster.name}** has been successfully deleted from the database.`,
                ephemeral: true
            });

        } catch (error) {
            console.error(error);
            return interaction.reply({
                content: 'There was an error deleting your monster. Please try again later.',
                ephemeral: true
            });
        }
    },
};
