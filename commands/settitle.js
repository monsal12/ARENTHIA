const { SlashCommandBuilder } = require('@discordjs/builders');
const { CommandInteraction, Client } = require('discord.js');
const User = require('../models/user'); // Make sure this path is correct

const REQUIRED_ROLE_ID = '1246365106846044262'; // Replace with the actual role ID that can use this command

module.exports = {
    data: new SlashCommandBuilder()
        .setName('settitle')
        .setDescription('Atur title untuk pengguna tertentu')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('Pilih pengguna untuk diatur title-nya')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('title')
                .setDescription('Masukkan title yang ingin diatur')
                .setRequired(true)),
    
    /**
     * @param {CommandInteraction} interaction 
     * @param {Client} bot
     */
    async execute(interaction, bot) {
        const targetUser = interaction.options.getUser('user'); // Get the target user
        const newTitle = interaction.options.getString('title'); // Get the new title

        // Check if the command executor has the required role
        if (!interaction.member.roles.cache.has(REQUIRED_ROLE_ID)) {
            return interaction.reply({ content: 'Kamu tidak memiliki izin untuk menggunakan perintah ini!', ephemeral: true });
        }

        // Find the target user in the database
        let user = await User.findOne({ discordId: targetUser.id });

        if (!user) {
            return interaction.reply({ content: 'Pengguna ini belum terdaftar di sistem. Gunakan perintah lain untuk mendaftar.', ephemeral: true });
        }

        // Update user title
        user.title = newTitle;
        await user.save();

        interaction.reply({ content: `🎉 Title untuk **${targetUser.username}** telah diatur menjadi: **${newTitle}** 🎉` });
    },
};
