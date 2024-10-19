const { SlashCommandBuilder } = require('discord.js');
const Inventory = require('../models/inventory');
const Weapon = require('../models/weapon');
const Armor = require('../models/armor'); // Pastikan Anda mengimpor model Armor

module.exports = {
    data: new SlashCommandBuilder()
        .setName('accept')
        .setDescription('Accept a trade request')
        .addUserOption(option => 
            option.setName('trader')
                .setDescription('User who initiated the trade')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Type of item being traded (weapon or armor)')
                .setRequired(true)
                .addChoices(
                    { name: 'weapon', value: 'weapon' }, // Format objek
                    { name: 'armor', value: 'armor' }    // Format objek
                )) // Menggunakan objek untuk pilihan
        .addStringOption(option =>
            option.setName('item_id')
                .setDescription('Unique code of the item being traded (weapon or armor)')
                .setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply(); // Menunda balasan untuk proses yang lebih lama

        const traderUser = interaction.options.getUser('trader'); // User yang mengirim trade
        const itemType = interaction.options.getString('type'); // Tipe item (weapon atau armor)
        const itemCode = interaction.options.getString('item_id'); // Unique code dari item
        const userId = interaction.user.id; // User yang menerima trade

        try {
            let item;
            if (itemType === 'weapon') {
                // Cari senjata berdasarkan kode unik
                item = await Weapon.findOne({ uniqueCode: itemCode });
                if (!item) {
                    return interaction.editReply('⚠️ Senjata tidak ditemukan.');
                }
            } else if (itemType === 'armor') {
                // Cari armor berdasarkan kode unik
                item = await Armor.findOne({ uniqueCode: itemCode });
                if (!item) {
                    return interaction.editReply('⚠️ Armor tidak ditemukan.');
                }
            }

            // Cari inventory trader
            const traderInventory = await Inventory.findOne({ userId: traderUser.id });
            if (!traderInventory) {
                return interaction.editReply('⚠️ Trader tidak memiliki inventory.');
            }

            // Cek apakah item ada di inventory trader
            const itemIndex = traderInventory[itemType === 'weapon' ? 'weapons' : 'armors'].indexOf(item._id);
            if (itemIndex === -1) {
                return interaction.editReply(`⚠️ Trader tidak memiliki ${itemType === 'weapon' ? 'senjata' : 'armor'} ini.`);
            }

            // Cari inventory penerima trade (user yang menerima)
            const userInventory = await Inventory.findOne({ userId });
            if (!userInventory) {
                return interaction.editReply('⚠️ Kamu tidak memiliki inventory.');
            }

            // Pindahkan item dari trader ke penerima
            traderInventory[itemType === 'weapon' ? 'weapons' : 'armors'].splice(itemIndex, 1); // Hapus item dari inventory trader
            userInventory[itemType === 'weapon' ? 'weapons' : 'armors'].push(item._id); // Tambahkan item ke inventory penerima

            // Perbarui pemilik item
            item.ownerId = userId;
            await item.save();

            // Simpan perubahan di inventory masing-masing
            await traderInventory.save();
            await userInventory.save();

            return interaction.editReply(`✅ Trade berhasil! Kamu telah menerima **${item.name}** dari ${traderUser.username}.`);
        } catch (error) {
            console.error('Terjadi kesalahan:', error);
            return interaction.editReply('⚠️ Terjadi kesalahan saat menerima trade.');
        }
    }
};

