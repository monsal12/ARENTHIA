const { SlashCommandBuilder } = require('@discordjs/builders');
const User = require('../models/user'); // Import model user
const Weapon = require('../models/weapon'); // Import model weapon
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('viewweapon')
        .setDescription('Menampilkan detail senjata berdasarkan ID')
        .addStringOption(option => 
            option.setName('id')
                .setDescription('ID unik senjata yang ingin dilihat')
                .setRequired(true)),
    async execute(interaction) {
        const uniqueCode = interaction.options.getString('id');

        // Mencari senjata berdasarkan uniqueCode
        const weapon = await Weapon.findOne({ uniqueCode });

        // Jika senjata tidak ditemukan
        if (!weapon) {
            return interaction.reply("Senjata dengan ID unik tersebut tidak ditemukan.");
        }

        // Mencari pemilik senjata berdasarkan owner ID
        const owner = await User.findOne({ discordId: weapon.owner });

        // Buat embed untuk menampilkan detail senjata
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(`Detail Senjata: ${weapon.name}`)
            .addFields(
                { name: 'ID Unik', value: weapon.uniqueCode, inline: true },
                { name: 'Rarity', value: weapon.grade, inline: true },
                { name: 'Strength', value: weapon.strength.toString(), inline: true },
                { name: 'Intelligence', value: weapon.intelligence.toString(), inline: true },
                { name: 'Ability', value: weapon.ability.toString(), inline: true },
                { name: 'Pemilik', value: owner ? `<@${owner.discordId}>` : 'Tidak ada pemilik', inline: true }
            )
            .setImage(weapon.imageUrl) // Menampilkan gambar senjata
            .setTimestamp()
            .setFooter({ text: 'Gunakan perintah lain untuk mengelola senjata ini.' });

        // Kirim embed ke channel
        await interaction.reply({ embeds: [embed] });
    }
};
