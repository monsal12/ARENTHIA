const { SlashCommandBuilder } = require('discord.js');
const Armor = require('../models/armor'); // Schema Armor
const Inventory = require('../models/inventory'); // Schema Inventory

// Fungsi untuk membuat uniqueCode secara otomatis
function generateUniqueCode() {
    const prefix = 'ARM';
    const randomNumber = Math.floor(1000 + Math.random() * 9000); // Generate angka acak 4 digit
    return `${prefix}${randomNumber}`;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('create-armor')
        .setDescription('Membuat armor baru dan menambahkannya ke inventory.')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Nama armor')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('strength')
                .setDescription('Kekuatan armor')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('intelligence')
                .setDescription('Kecerdasan armor')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('ability')
                .setDescription('Kemampuan armor')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('grade')
                .setDescription('Grade armor (e.g., Common, Rare, Legendary)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('image_url')
                .setDescription('URL gambar armor')
                .setRequired(true)), // Tambahkan parameter URL gambar

    async execute(interaction) {
        try {
            // Role yang diizinkan
            const requiredRoleIds = ['1319306786783887360', '1246365106846044262'];
            const memberRoles = interaction.member.roles.cache;

            // Periksa apakah pengguna memiliki salah satu Role ID
            const hasRequiredRole = requiredRoleIds.some(roleId => memberRoles.has(roleId));
            if (!hasRequiredRole) {
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

            // Buat armor baru
            const newArmor = new Armor({
                name,
                owner: userId, // Pemilik armor diisi dengan ID pengguna
                uniqueCode,
                strength,
                intelligence,
                ability,
                grade,
                imageUrl // Simpan URL gambar
            });

            // Simpan armor ke database
            const savedArmor = await newArmor.save();

            // Cari atau buat inventory pengguna
            let inventory = await Inventory.findOne({ userId });
            if (!inventory) {
                inventory = new Inventory({ userId, armors: [] });
            }

            // Tambahkan armor ke inventory
            inventory.armors.push(savedArmor._id);
            await inventory.save();

            // Balas interaksi dengan konfirmasi
            return interaction.reply({
                content: `✅ Armor **${name}** berhasil dibuat dengan kode unik **${uniqueCode}** dan ditambahkan ke inventory Anda.\n![Gambar Armor](${imageUrl})`,
                ephemeral: true
            });

        } catch (error) {
            console.error('Error saat membuat armor:', error);
            return interaction.reply({
                content: '❌ Terjadi kesalahan saat membuat armor. Silakan coba lagi nanti.',
                ephemeral: true
            });
        }
    }
};
