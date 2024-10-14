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
                .setDescription('Unique code of the weapon being traded') // Ubah menjadi uniqueCode
                .setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply(); // Menunda balasan untuk proses yang lebih lama

        const traderUser = interaction.options.getUser('trader');
        const weaponCode = interaction.options.getString('weapon_id'); // Ubah menjadi weaponCode
        const userId = interaction.user.id;

        // Temukan senjata berdasarkan uniqueCode
        const weapon = await Weapon.findOne({ uniqueCode: weaponCode }); // Menggunakan findOne dengan uniqueCode
        if (!weapon) {
            return interaction.editReply('⚠️ Senjata tidak ditemukan.'); // Gunakan editReply untuk memperbarui balasan
        }

        // Temukan inventory pengguna yang melakukan trade
        const traderInventory = await Inventory.findOne({ userId: traderUser.id });
        if (!traderInventory) {
            return interaction.editReply('⚠️ Trader tidak memiliki inventory.'); // Gunakan editReply
        }

        // Cek apakah senjata ada di inventory trader
        const weaponIndex = traderInventory.weapons.indexOf(weapon._id);
        if (weaponIndex === -1) {
            return interaction.editReply('⚠️ Trader tidak memiliki senjata ini.'); // Gunakan editReply
        }

        // Temukan inventory pengguna yang menerima trade
        const userInventory = await Inventory.findOne({ userId });
        if (!userInventory) {
            return interaction.editReply('⚠️ Kamu tidak memiliki inventory.'); // Gunakan editReply
        }

        // Pindahkan senjata dari trader ke penerima
        traderInventory.weapons.splice(weaponIndex, 1); // Hapus senjata dari inventory trader
        userInventory.weapons.push(weapon._id); // Tambahkan senjata ke inventory penerima

        await traderInventory.save();
        await userInventory.save();

        return interaction.editReply(`✅ Trade berhasil! Kamu telah menerima **${weapon.name}** dari ${traderUser.username}.`);
    }
};
