const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const gacha = require('../Data/gachaPool'); // Pastikan gacha pool diatur dengan benar
const Weapon = require('../models/weapon');
const User = require('../models/user');
const Inventory = require('../models/inventory');

const systemAccountId = '994553740864536596'; // Discord ID akun sistem

async function generateUniqueCode() {
    let uniqueCode;
    let exists = true;

    while (exists) {
        uniqueCode = `WPN${Math.floor(1000 + Math.random() * 9000)}`;
        // Cek apakah kode unik sudah ada
        const existingWeapon = await Weapon.findOne({ uniqueCode });
        exists = !!existingWeapon; // Jika weapon ada, teruskan loop
    }

    return uniqueCode;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gacha')
        .setDescription('Gacha untuk mendapatkan senjata acak!')
        .addIntegerOption(option =>
            option.setName('jumlah')
                .setDescription('Jumlah gacha yang ingin dilakukan (1-10)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(10)),
    async execute(interaction) {
        const userId = interaction.user.id; // ID pengguna Discord
        const user = await User.findOne({ discordId: userId }); // Cari pengguna berdasarkan Discord ID
        const jumlahGacha = interaction.options.getInteger('jumlah');

        // Hitung total biaya gacha
        const totalCost = jumlahGacha * 800; // Biaya per gacha

        // Cek apakah pengguna memiliki cukup celes
        if (!user || user.celes < totalCost) {
            return interaction.reply('⚠️ Kamu tidak memiliki cukup celes untuk melakukan gacha.');
        }

        try {
            await interaction.deferReply(); // Tunda balasan

            const obtainedWeapons = []; // Menyimpan senjata yang diperoleh
            let gachaRateBoost = 1 + (jumlahGacha * 0.1); // Meningkatkan rate senjata

            // Lakukan gacha sesuai jumlah yang diminta
            for (let i = 0; i < jumlahGacha; i++) {
                const randomWeapon = gacha.pullRandomWeapon(); // Mendapatkan senjata acak

                if (!randomWeapon) {
                    return interaction.editReply('⚠️ Tidak ada senjata yang dapat ditarik. Silakan coba lagi.'); // Validasi randomWeapon
                }

                const uniqueCode = await generateUniqueCode(); // Mendapatkan kode unik

                // Membuat senjata baru
                const newWeapon = new Weapon({
                    name: randomWeapon.name,
                    grade: randomWeapon.grade,
                    strength: randomWeapon.statBoost.strength || 0,
                    intelligence: randomWeapon.statBoost.intelligence || 0,
                    ability: randomWeapon.statBoost.ability || 0,
                    imageUrl: randomWeapon.imageUrl,
                    owner: user.discordId, // Menggunakan Discord ID sebagai pemilik
                    uniqueCode
                });
                await newWeapon.save();
                obtainedWeapons.push(newWeapon); // Simpan senjata yang diperoleh

                // Tambahkan celes ke akun sistem
                const systemAccount = await User.findOne({ discordId: systemAccountId }); // Mencari akun sistem berdasarkan Discord ID
                systemAccount.celes += 800; // Tambahkan celes untuk setiap gacha
                await systemAccount.save();
            }

            // Kurangi celes dari pengguna
            user.celes -= totalCost;
            await user.save();

            // Update inventory
            let inventory = await Inventory.findOne({ userId: userId });
            if (!inventory) {
                inventory = new Inventory({ userId: userId, weapons: [] });
            }

            obtainedWeapons.forEach(weapon => {
                inventory.weapons.push(weapon._id);
            });

            await inventory.save();

            // Membuat embed untuk menampilkan senjata yang diperoleh
            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle('🎉 Kamu mendapatkan senjata!')
                .setDescription('Berikut senjata yang kamu peroleh:')
                .setFooter({ text: `Total gacha: ${jumlahGacha} ✨ Jadilah Bangsawan di Arenithia! Raih EXP dan Celes lebih banyak untuk eksplorasi, raid, dan event! 🔗 Gunakan /premium untuk detail harga dan pembelian!` });

            obtainedWeapons.forEach(weapon => {
                embed.addFields({ name: weapon.name, value: `Grade: ${weapon.grade}`, inline: true });
            });

            return interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Terjadi kesalahan:', error);
            return interaction.editReply('⚠️ Terjadi kesalahan saat menjalankan perintah ini.');
        }
    }
};
