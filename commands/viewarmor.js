const { SlashCommandBuilder } = require('@discordjs/builders');
const User = require('../models/user'); // Import model user
const Armor = require('../models/armor'); // Import model armor
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('viewarmor')
        .setDescription('Menampilkan detail armor berdasarkan ID')
        .addStringOption(option => 
            option.setName('id')
                .setDescription('ID unik armor yang ingin dilihat')
                .setRequired(true)),
    async execute(interaction) {
        const uniqueCode = interaction.options.getString('id');

        // Mencari armor berdasarkan uniqueCode
        const armor = await Armor.findOne({ uniqueCode });

        // Jika armor tidak ditemukan
        if (!armor) {
            return interaction.reply("Armor dengan ID unik tersebut tidak ditemukan.");
        }

        // Mencari pemilik armor berdasarkan owner ID
        const owner = await User.findOne({ discordId: armor.owner });

        // Buat embed untuk menampilkan detail armor
        const embed = new EmbedBuilder()
            .setColor('#ff9900')
            .setTitle(`Detail Armor: ${armor.name}`)
            .addFields(
                { name: 'ID Unik', value: armor.uniqueCode, inline: true },
                { name: 'Rarity', value: armor.grade, inline: true },
                { name: 'Strength', value: armor.strength.toString(), inline: true },           // Menampilkan strength
                { name: 'Intelligence', value: armor.intelligence.toString(), inline: true },   // Menampilkan intelligence
                { name: 'Ability', value: armor.ability.toString(), inline: true },             // Menampilkan ability
                { name: 'Pemilik', value: owner ? `<@${owner.discordId}>` : 'Tidak ada pemilik', inline: true }
            )
            .setImage(armor.imageUrl) // Menampilkan gambar armor
            .setTimestamp()
            .setFooter({ text: '✨ Jadilah Bangsawan di Arenithia! Raih EXP dan Celes lebih banyak untuk eksplorasi, raid, dan event! 🔗 Gunakan /premium untuk detail harga dan pembelian!' });

        // Kirim embed ke channel
        await interaction.reply({ embeds: [embed] });
    }
};
