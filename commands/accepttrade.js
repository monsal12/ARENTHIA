const { SlashCommandBuilder } = require('discord.js');
const Inventory = require('../models/inventory');
const Weapon = require('../models/weapon');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('accept')
        .setDescription('Accept a trade request')
        .addUserOption(option => 
            option.setName('trader')
                .setDescription('User who initiated the trade')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('weapon_id')
                .setDescription('Unique code of the weapon being traded')
                .setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply(); // Menunda balasan untuk proses yang lebih lama

        const traderUser = interaction.options.getUser('trader'); // User yang mengirim trade
        const weaponCode = interaction.options.getString('weapon_id'); // Unique code dari senjata
        const userId = interaction.user.id; // User yang menerima trade

        try {
            // Cari senjata berdasarkan kode unik
            const weapon = await Weapon.findOne({ uniqueCode: weaponCode });
            if (!weapon) {
                return interaction.editReply('⚠️ Senjata tidak ditemukan.');
            }

            // Cari inventory trader
            const traderInventory = await Inventory.findOne({ userId: traderUser.id });
            if (!traderInventory) {
                return interaction.editReply('⚠️ Trader tidak memiliki inventory.');
            }

            // Cek apakah senjata ada di inventory trader
            const weaponIndex = traderInventory.weapons.indexOf(weapon._id);
            if (weaponIndex === -1) {
                return interaction.editReply('⚠️ Trader tidak memiliki senjata ini.');
            }

            // Cari inventory penerima trade (user yang menerima)
            const userInventory = await Inventory.findOne({ userId });
            if (!userInventory) {
                return interaction.editReply('⚠️ Kamu tidak memiliki inventory.');
            }

            // Pindahkan senjata dari trader ke penerima
            traderInventory.weapons.splice(weaponIndex, 1); // Hapus senjata dari inventory trader
            userInventory.weapons.push(weapon._id); // Tambahkan senjata ke inventory penerima

            // Perbarui pemilik senjata
            weapon.ownerId = userId;
            await weapon.save();

            // Simpan perubahan di inventory masing-masing
            await traderInventory.save();
            await userInventory.save();

            return interaction.editReply(`✅ Trade berhasil! Kamu telah menerima **${weapon.name}** dari ${traderUser.username}.`);
        } catch (error) {
            console.error('Terjadi kesalahan:', error);
            return interaction.editReply('⚠️ Terjadi kesalahan saat menerima trade.');
        }
    }
};
