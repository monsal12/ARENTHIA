const { SlashCommandBuilder } = require('discord.js');
const Weapon = require('../models/weapon');
const gacha = require('../Data/gachaPool'); // Import gacha pool

module.exports = {
    data: new SlashCommandBuilder()
        .setName('takeweapon')
        .setDescription('Ambil senjata langsung dari gacha pool.')
        .addStringOption(option => {
            const weaponOptions = option
                .setName('weapon_name')
                .setDescription('Pilih senjata yang ingin diambil')
                .setRequired(true);
            
            // Menambahkan pilihan senjata dari gachaPool
            Object.values(gacha).forEach(weapon => {
                weaponOptions.addChoices({ name: weapon.name, value: weapon.name });
            });

            return weaponOptions;
        }),
        
    async execute(interaction) {
        const weaponName = interaction.options.getString('weapon_name');
        const adminRoleId = '1246365106846044262'; // Ganti dengan role ID admin Anda

        // Cek jika user memiliki role admin
        if (!interaction.member.roles.cache.has(adminRoleId)) {
            return interaction.reply('⚠️ Kamu tidak memiliki izin untuk menggunakan perintah ini.');
        }

        // Temukan senjata di gacha pool
        const weaponData = Object.values(gacha).find(weapon => weapon.name.toLowerCase() === weaponName.toLowerCase());
        if (!weaponData) {
            return interaction.reply('⚠️ Senjata tidak ditemukan di gacha pool.');
        }

        // Buat kode unik untuk senjata tersebut
        const uniqueCode = `WPN${Math.floor(Math.random() * 10000)}`;

        // Buat instance senjata baru untuk user
        const newWeapon = new Weapon({
            name: weaponData.name,
            owner: interaction.user.id, // Set owner ke admin yang menjalankan command
            uniqueCode: uniqueCode,
            strength: weaponData.strength,
            intelligence: weaponData.intelligence,
            ability: weaponData.ability,
            grade: weaponData.grade,
            imageUrl: weaponData.imageUrl,
        });

        // Simpan senjata baru ke database
        await newWeapon.save();

        // Balas interaksi dengan pesan sukses
        return interaction.reply(`✅ Kamu berhasil mengambil senjata **${weaponData.name}**! (Kode Unik: ${uniqueCode}). Senjata telah ditambahkan ke inventory.`);
    }
};
