const { SlashCommandBuilder } = require('@discordjs/builders');
const Weapon = require('../models/weapon');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('listweapon')
        .setDescription('List a weapon for sale')
        .addStringOption(option =>
            option.setName('code')
                .setDescription('Weapon code to sell')
                .setRequired(true))
        .addNumberOption(option =>
            option.setName('price')
                .setDescription('Price in celes')
                .setRequired(true)),
    async execute(interaction) {
        const weaponCode = interaction.options.getString('code');
        const price = interaction.options.getNumber('price');
        const userId = interaction.user.id;

        // Mencari senjata berdasarkan kode
        const weapon = await Weapon.findOne({ uniqueCode: weaponCode });

        // Mengecek apakah senjata ditemukan
        if (!weapon) {
            return interaction.reply('⚠️ **Senjata tidak ditemukan!**');
        }

        // Mengecek apakah pengguna memiliki senjata
        if (weapon.owner.toString() !== userId) {
            return interaction.reply('⚠️ **Kamu tidak memiliki senjata ini!**');
        }

        // Mengecek apakah senjata sudah terdaftar untuk dijual
        if (weapon.isListedForSale) {
            return interaction.reply('⚠️ **Senjata ini sudah terdaftar untuk dijual!**');
        }

        // Menandai senjata sebagai terdaftar untuk dijual dan menetapkan harga
        weapon.isListedForSale = true;
        weapon.price = price;

        await weapon.save();

        return interaction.reply(`🔨 **${weapon.name}** telah terdaftar untuk dijual dengan harga **${price} celes**!`);
    }
};
