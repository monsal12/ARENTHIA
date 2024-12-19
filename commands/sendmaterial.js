const { SlashCommandBuilder } = require('discord.js');
const MaterialInventory = require('../models/MaterialInventory'); // Ganti dengan path yang sesuai
const materialsData = require('../Data/materials'); // Mengimpor data materials.js

module.exports = {
    data: new SlashCommandBuilder()
        .setName('transfermaterial')
        .setDescription('Transfer material ke pemain lain.')
        .addUserOption(option => 
            option.setName('recipient')
                .setDescription('Pemain yang akan menerima transfer material')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('material')
                .setDescription('Material yang ingin ditransfer')
                .setRequired(true)
                .addChoices(
                    ...Object.keys(materialsData).map(material => ({
                        name: material,
                        value: material
                    }))
                ))
        .addStringOption(option =>
            option.setName('tier')
                .setDescription('Pilih tier material yang akan ditransfer')
                .setRequired(true)
                .addChoices(
                    ...["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8"].map(tier => ({
                        name: tier,
                        value: tier
                    }))
                ))
        .addIntegerOption(option => 
            option.setName('quantity')
                .setDescription('Jumlah material yang ingin ditransfer')
                .setRequired(true)),

    async execute(interaction) {
        const senderId = interaction.user.id;
        const recipient = interaction.options.getUser('recipient');
        const materialName = interaction.options.getString('material');
        const tier = interaction.options.getString('tier');
        const quantity = interaction.options.getInteger('quantity');

        // Pastikan jumlah material yang ingin ditransfer lebih besar dari 0
        if (quantity <= 0) {
            return interaction.reply({ content: 'Jumlah material yang ingin ditransfer harus lebih besar dari 0.', ephemeral: true });
        }

        try {
            // Ambil inventory pengirim dan penerima
            let senderInventory = await MaterialInventory.findOne({ userId: senderId });
            let recipientInventory = await MaterialInventory.findOne({ userId: recipient.id });

            // Periksa apakah pengirim memiliki inventory, jika tidak, buatkan
            if (!senderInventory) {
                senderInventory = new MaterialInventory({ userId: senderId, materials: [] });
                await senderInventory.save();
            }

            // Periksa apakah penerima memiliki inventory, jika tidak, buatkan
            if (!recipientInventory) {
                recipientInventory = new MaterialInventory({ userId: recipient.id, materials: [] });
                await recipientInventory.save();
            }

            // Pastikan bahwa materials adalah array yang valid
            if (!Array.isArray(senderInventory.materials)) {
                senderInventory.materials = [];
            }

            if (!Array.isArray(recipientInventory.materials)) {
                recipientInventory.materials = [];
            }

            // Cari material yang akan ditransfer pada inventory pengirim dan periksa tier-nya
            const senderMaterial = senderInventory.materials.find(m => m.materialName === materialName && m.tier === tier);

            // Periksa apakah material dan tier ada dalam inventory pengirim
            if (!senderMaterial) {
                return interaction.reply({ content: `Anda tidak memiliki ${materialName} Tier ${tier} dalam inventory.`, ephemeral: true });
            }

            // Periksa apakah pengirim memiliki cukup material
            if (senderMaterial.quantity < quantity) {
                return interaction.reply({ content: 'Anda tidak memiliki cukup material untuk ditransfer.', ephemeral: true });
            }

            // Cari material yang ada di inventory penerima
            let recipientMaterial = recipientInventory.materials.find(m => m.materialName === materialName && m.tier === tier);

            // Jika penerima tidak memiliki material tersebut, tambahkan
            if (!recipientMaterial) {
                recipientMaterial = {
                    materialName,
                    tier,
                    quantity: 0
                };
                recipientInventory.materials.push(recipientMaterial);
            }

            // Transfer material
            senderMaterial.quantity -= quantity; // Kurangi material pengirim
            recipientMaterial.quantity += quantity; // Tambah material penerima

            // Simpan perubahan pada kedua inventory
            await senderInventory.save();
            await recipientInventory.save();

            // Balas dengan konfirmasi transfer
            await interaction.reply({ content: `Berhasil mentransfer ${quantity} ${materialName} Tier ${tier} ke ${recipient.username}.` });
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: 'Terjadi kesalahan saat mentransfer material.', ephemeral: true });
        }
    }
};
