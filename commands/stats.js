const { SlashCommandBuilder } = require('discord.js');
const User = require('../models/user');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stat')
        .setDescription('Alokasikan poin stat')
        .addStringOption(option => 
            option.setName('type')
                .setDescription('Tipe stat yang ingin ditingkatkan')
                .setRequired(true)
                .addChoices(
                    { name: 'Strength', value: 'strength' },
                    { name: 'Intelligence', value: 'intelligence' },
                    { name: 'Ability', value: 'ability' }
                ))
        .addIntegerOption(option => 
            option.setName('amount')
                .setDescription('Jumlah poin yang ingin dialokasikan')
                .setRequired(true)),
    async execute(interaction) {
        const user = await User.findOne({ discordId: interaction.user.id });

        if (!user) {
            return interaction.reply('Kamu belum terdaftar, gunakan `/register` untuk mendaftar.');
        }

        const statType = interaction.options.getString('type');
        const amount = interaction.options.getInteger('amount');

        if (amount <= 0) {
            return interaction.reply('Jumlah poin harus lebih dari 0.');
        }

        if (user.spyr < amount) {
            return interaction.reply(`Kamu tidak memiliki cukup poin spyr. Kamu hanya memiliki ${user.spyr} poin.`);
        }

        // You can set a maximum limit for each stat if necessary
        const MAX_STAT_VALUE = 1000000000; // Example limit
        if (user.stats[statType] + amount > MAX_STAT_VALUE) {
            return interaction.reply(`Poin yang dialokasikan melebihi batas maksimum ${MAX_STAT_VALUE} untuk ${statType}.`);
        }

        // Update user stats
        user.stats[statType] += amount; // Allocate points to the specified stat
        user.spyr -= amount; // Deduct points from spyr

        try {
            await user.save(); // Save the updated user data
        } catch (error) {
            console.error(error);
            return interaction.reply('❌ Terjadi kesalahan saat menyimpan data. Silakan coba lagi.');
        }

        return interaction.reply(`Kamu berhasil menambahkan ${amount} poin ke **${statType}**! Stat kamu sekarang: **Strength**: ${user.stats.strength}, **Intelligence**: ${user.stats.intelligence}, **Ability**: ${user.stats.ability}`);
    }
};
