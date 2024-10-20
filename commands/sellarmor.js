const { SlashCommandBuilder, EmbedBuilder } = require('discord.js'); // Tambahkan EmbedBuilder di sini
const Armor = require('../models/armor'); // Sesuaikan path dengan lokasi model Armor Anda
const User = require('../models/user'); // Sesuaikan path dengan lokasi model User Anda
const Inventory = require('../models/inventory'); // Sesuaikan path dengan lokasi model Inventory Anda

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sellarmor')
        .setDescription('Menjual armor untuk mendapatkan celes.')
        .addStringOption(option =>
            option.setName('armorid')
                .setDescription('ID armor yang ingin dijual')
                .setRequired(true)
        ),
    
    async execute(interaction) {
        await interaction.deferReply(); // Tunda balasan

        const armorId = interaction.options.getString('armorid');
        const userId = interaction.user.id;

        // Temukan pengguna
        const user = await User.findOne({ discordId: userId });
        if (!user) {
            return interaction.editReply('⚠️ Pengguna tidak ditemukan.');
        }

        // Temukan inventori pengguna
        const inventory = await Inventory.findOne({ userId: userId });
        if (!inventory) {
            return interaction.editReply('⚠️ Inventori tidak ditemukan.');
        }

        // Temukan armor berdasarkan armorId
        const armor = await Armor.findOne({ uniqueCode: armorId });
        if (!armor) {
            return interaction.editReply('⚠️ Armor tidak ditemukan.');
        }

        // Hapus armor dari database
        await Armor.deleteOne({ uniqueCode: armorId });

        // Tambahkan celes ke akun pengguna
        user.celes += 200; // Tambahkan 200 celes untuk pengguna yang menjual armor
        await user.save();

        console.log(`Total Celes setelah penjualan: ${user.celes}`);

        const systemAccountId = '994553740864536596'; // ID akun sistem Anda
        const systemAccount = await User.findOne({ discordId: systemAccountId });
        if (!systemAccount) {
            console.log('Akun sistem tidak ditemukan.');
            return interaction.editReply('⚠️ Akun sistem tidak ditemukan.');
        }

        systemAccount.celes -= 200; // Kurangi celes untuk akun sistem
        await systemAccount.save();

        // Memastikan armor ada di inventori sebelum mencoba menghapusnya
        inventory.armors = inventory.armors.filter(id => id && id.toString() !== armor._id.toString()); // Tambahkan pemeriksaan untuk id yang null
        await inventory.save();

        const embed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle(`💰 Armor Terjual!`)
            .setDescription(`Kamu berhasil menjual armor **${armor.name}** dan mendapatkan 200 celes!`)
            .addFields(
                { name: 'Total Celes Kamu', value: `${user.celes}`, inline: true },
                { name: 'Armor yang Dijual', value: `${armor.name}`, inline: true }
            );
            setFooter({ text: `✨ Jadilah Bangsawan di Arenithia! Raih EXP dan Celes lebih banyak untuk eksplorasi, raid, dan event! 🔗 Gunakan /premium untuk detail harga dan pembelian!` });

        return interaction.editReply({ embeds: [embed] });
    },
};
