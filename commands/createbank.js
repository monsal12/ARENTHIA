const { SlashCommandBuilder } = require('@discordjs/builders');
const { CommandInteraction, Client } = require('discord.js');
const Bank = require('../models/bank'); // Make sure this path is correct

const REQUIRED_ROLE_ID = '1246365106846044262'; // Replace with the actual role ID that can use this command

module.exports = {
    data: new SlashCommandBuilder()
        .setName('createbank')
        .setDescription('Buat bank untuk menyimpan celes dan tetapkan pengelola bank')
        .addStringOption(option => 
            option.setName('name')
                .setDescription('Masukkan nama bank')
                .setRequired(true))
        .addUserOption(option => 
            option.setName('manager')
                .setDescription('Pilih pengguna sebagai pengelola bank')
                .setRequired(true)),
    
    /**
     * @param {CommandInteraction} interaction 
     * @param {Client} bot
     */
    async execute(interaction, bot) {
        const bankName = interaction.options.getString('name'); // Get the bank name
        const managerUser = interaction.options.getUser('manager'); // Get the manager user

        // Check if the command executor has the required role
        if (!interaction.member.roles.cache.has(REQUIRED_ROLE_ID)) {
            return interaction.reply({ content: 'Kamu tidak memiliki izin untuk menggunakan perintah ini!', ephemeral: true });
        }

        // Create a new bank entry in the database
        const newBank = new Bank({
            name: bankName,
            managerId: managerUser.id,
            celes: 0 // Initialize the bank celes
        });

        // Save the bank to the database
        await newBank.save();

        interaction.reply({ content: `🏦 Bank **${bankName}** telah berhasil dibuat dan **${managerUser.username}** ditetapkan sebagai pengelola bank!` });
    },
};
