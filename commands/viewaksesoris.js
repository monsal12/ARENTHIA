const { SlashCommandBuilder } = require('@discordjs/builders');
const User = require('../models/user'); // Import User model
const Accessory = require('../models/accessory'); // Import Accessory model
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('viewaccessory')
        .setDescription('Menampilkan detail aksesoris berdasarkan ID')
        .addStringOption(option => 
            option.setName('id')
                .setDescription('ID unik aksesoris yang ingin dilihat')
                .setRequired(true)),
    async execute(interaction) {
        const uniqueCode = interaction.options.getString('id');

        // Mencari aksesoris berdasarkan uniqueCode
        const accessory = await Accessory.findOne({ uniqueCode });

        // Jika aksesoris tidak ditemukan
        if (!accessory) {
            return interaction.reply("Aksesoris dengan ID unik tersebut tidak ditemukan.");
        }

        // Mencari pemilik aksesoris berdasarkan owner ID
        const owner = await User.findOne({ discordId: accessory.owner });

        // Buat embed untuk menampilkan detail aksesoris
        const embed = new EmbedBuilder()
            .setColor('#ffcc00') // Warna embed, bisa disesuaikan
            .setTitle(`Detail Aksesoris: ${accessory.name}`)
            .addFields(
                { name: 'ID Unik', value: accessory.uniqueCode, inline: true },
                { name: 'Rarity', value: accessory.grade, inline: true },
                { name: 'Strength', value: accessory.strength.toString(), inline: true },
                { name: 'Intelligence', value: accessory.intelligence.toString(), inline: true },
                { name: 'Ability', value: accessory.ability.toString(), inline: true },
                { name: 'Pemilik', value: owner ? `<@${owner.discordId}>` : 'Tidak ada pemilik', inline: true }
            )
            .setImage(accessory.imageUrl) // Menampilkan gambar aksesoris
            .setTimestamp()
            .setFooter({ text: '✨ Jadilah Bangsawan di Arenithia! Raih EXP dan Celes lebih banyak untuk eksplorasi, raid, dan event! 🔗 Gunakan /premium untuk detail harga dan pembelian!' });

        // Kirim embed ke channel
        await interaction.reply({ embeds: [embed] });
    }
};
