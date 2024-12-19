const { SlashCommandBuilder } = require('discord.js');
const Accessory = require('../models/accessory'); // Schema Accessory
const Inventory = require('../models/inventory'); // Schema Inventory

// Fungsi untuk membuat uniqueCode secara otomatis
function generateUniqueCode() {
    const prefix = 'ACC';
    const randomNumber = Math.floor(1000 + Math.random() * 9000); // Generate angka acak 4 digit
    return `${prefix}${randomNumber}`;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('create-accessory')
        .setDescription('Membuat aksesori baru dan menambahkannya ke inventory.')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Nama aksesori')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('strength')
                .setDescription('Kekuatan aksesori')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('intelligence')
                .setDescription('Kecerdasan aksesori')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('ability')
                .setDescription('Kemampuan aksesori')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('grade')
                .setDescription('Grade aksesori (e.g., Common, Rare, Legendary)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('image_url')
                .setDescription('URL gambar aksesori')
                .setRequired(true)), // Tambahkan parameter URL gambar
    
    async execute(interaction) {
        try {
            // Periksa apakah pengguna memiliki role yang sesuai
            const requiredRoleId = '1246365106846044262';
            const memberRoles = interaction.member.roles.cache;
            if (!memberRoles.has(requiredRoleId)) {
                return interaction.reply({
                    content: '❌ Anda tidak memiliki izin untuk menggunakan command ini.',
                    ephemeral: true
                });
            }

            // Ambil input dari pengguna
            const name = interaction.options.getString('name');
            const strength = interaction.options.getInteger('strength');
            const intelligence = interaction.options.getInteger('intelligence');
            const ability = interaction.options.getInteger('ability');
            const grade = interaction.options.getString('grade');
            const imageUrl = interaction.options.getString('image_url'); // Ambil URL gambar
            const userId = interaction.user.id; // ID pengguna Discord

            // Generate uniqueCode secara otomatis
            const uniqueCode = generateUniqueCode();

            // Buat aksesori baru
            const newAccessory = new Accessory({
                name,
                owner: userId, // Pemilik aksesori diisi dengan ID pengguna
                uniqueCode,
                strength,
                intelligence,
                ability,
                grade,
                imageUrl // Simpan URL gambar
            });

            // Simpan aksesori ke database
            const savedAccessory = await newAccessory.save();

            // Cari atau buat inventory pengguna
            let inventory = await Inventory.findOne({ userId });
            if (!inventory) {
                inventory = new Inventory({ userId, accessories: [] });
            }

            // Tambahkan aksesori ke inventory
            inventory.accessories.push(savedAccessory._id);
            await inventory.save();

            // Balas interaksi dengan konfirmasi
            return interaction.reply({
                content: `✅ Aksesori **${name}** berhasil dibuat dengan kode unik **${uniqueCode}** dan ditambahkan ke inventory Anda.\n![Gambar Aksesori](${imageUrl})`,
                ephemeral: true
            });

        } catch (error) {
            console.error('Error saat membuat aksesori:', error);
            return interaction.reply({
                content: '❌ Terjadi kesalahan saat membuat aksesori. Silakan coba lagi nanti.',
                ephemeral: true
            });
        }
    }
};
