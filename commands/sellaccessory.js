const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../models/user');
const Accessory = require('../models/accessory'); // Pastikan model accessory ada
const Inventory = require('../models/inventory');

const systemAccountId = '994553740864536596'; // Discord ID akun sistem

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sellaccessory')
        .setDescription('Menjual aksesoris dan mendapatkan celes!')
        .addStringOption(option =>
            option.setName('accessory_id')
                .setDescription('ID aksesoris yang ingin dijual')
                .setRequired(true)),
    
    async execute(interaction) {
        await interaction.deferReply(); // Tunda balasan untuk interaksi ini

        const userId = interaction.user.id; // ID pengguna Discord
        const accessoryId = interaction.options.getString('accessory_id'); // Mendapatkan ID aksesoris yang ingin dijual

        try {
            const user = await User.findOne({ discordId: userId }); // Mencari pengguna berdasarkan Discord ID
            if (!user) {
                return interaction.editReply('⚠️ Pengguna tidak ditemukan.');
            }

            const accessory = await Accessory.findOne({ uniqueCode: accessoryId }); // Mencari aksesoris berdasarkan uniqueCode
            if (!accessory) {
                return interaction.editReply('⚠️ Aksesoris tidak ditemukan.');
            }

            const inventory = await Inventory.findOne({ userId: userId });
            if (!inventory || !inventory.accessories.includes(accessory._id.toString())) {
                return interaction.editReply('⚠️ Kamu tidak memiliki aksesoris ini dalam inventori.');
            }

            // Menghapus aksesoris dari database
            await Accessory.deleteOne({ uniqueCode: accessoryId }); 

            // Menambahkan celes ke pengguna
            user.celes += 150; 
            await user.save();

            // Memperbarui akun sistem
            const systemAccount = await User.findOne({ discordId: systemAccountId });
            if (!systemAccount) {
                return interaction.editReply('⚠️ Akun sistem tidak ditemukan.');
            }

            systemAccount.celes -= 150; // Kurangi celes untuk akun sistem
            await systemAccount.save();

            // Menghapus aksesoris dari inventori pengguna
            inventory.accessories = inventory.accessories.filter(id => id.toString() !== accessory._id.toString());
            await inventory.save();

            // Membuat embed balasan
            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle(`💰 Aksesoris Terjual!`)
                .setDescription(`Kamu berhasil menjual aksesoris **${accessory.name}** dan mendapatkan 150 celes!`)
                .addFields(
                    { name: 'Total Celes Kamu', value: `${user.celes}`, inline: true },
                    { name: 'Aksesoris yang Dijual', value: `${accessory.name}`, inline: true }
                );
                setFooter({ text: `✨ Jadilah Bangsawan di Arenithia! Raih EXP dan Celes lebih banyak untuk eksplorasi, raid, dan event! 🔗 Gunakan /premium untuk detail harga dan pembelian!` });

            return interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Terjadi kesalahan:', error);
            return interaction.editReply('⚠️ Terjadi kesalahan saat menjalankan perintah ini.');
        }
    }
};
