const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const gachaArmor = require('../Data/gachaArmorPool'); // Pool armor
const Armor = require('../models/armor'); // Model armor
const User = require('../models/user'); // Model pengguna
const Inventory = require('../models/inventory'); // Model inventory

const systemAccountId = '994553740864536596'; // Discord ID akun sistem

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gachaarmor')
        .setDescription('Gacha untuk mendapatkan armor acak!')
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
        const totalCost = jumlahGacha * 800;

        if (!user || user.celes < totalCost) {
            return interaction.reply('⚠️ Kamu tidak memiliki cukup celes untuk melakukan gacha.');
        }

        try {
            await interaction.deferReply(); // Tunda balasan

            const obtainedArmors = []; // Menyimpan armor yang diperoleh
            let pityCounter = 0; // Menghitung pity
            let gachaRateBoost = 1 + (jumlahGacha * 0.1); // Meningkatkan rate armor

            // Lakukan gacha sesuai jumlah yang diminta
            for (let i = 0; i < jumlahGacha; i++) {
                const randomArmor = gachaArmor.pullRandomArmor(gachaRateBoost, pityCounter); // Menggunakan fungsi gacha dengan rate boost dan pity counter

                // Cek jika armor yang ditarik adalah null
                if (!randomArmor) {
                    return interaction.editReply('⚠️ Terjadi kesalahan saat menarik armor. Coba lagi nanti.');
                }

                const uniqueCode = `ARM${Math.floor(1000 + Math.random() * 9000)}`;

                const newArmor = new Armor({
                    name: randomArmor.name,
                    grade: randomArmor.grade,
                    strength: randomArmor.statBoost.strength || 0,
                    intelligence: randomArmor.statBoost.intelligence || 0,
                    ability: randomArmor.statBoost.ability || 0,
                    imageUrl: randomArmor.imageUrl,
                    owner: user.discordId, // Menggunakan Discord ID sebagai pemilik
                    uniqueCode
                });

                await newArmor.save(); // Simpan armor baru ke database
                obtainedArmors.push(newArmor); // Simpan armor yang diperoleh

                // Tambahkan celes ke akun sistem
                const systemAccount = await User.findOne({ discordId: systemAccountId }); // Mencari akun sistem berdasarkan Discord ID
                systemAccount.celes += 800; // Tambahkan celes untuk setiap gacha
                await systemAccount.save(); // Simpan perubahan ke akun sistem

                // Perbarui pity counter
                pityCounter++;
                if (pityCounter >= 10) {
                    pityCounter = 0; // Reset pity setelah mencapai batas
                    // Tarik armor spesial jika pity tertrigger
                    const specialArmor = gachaArmor.pullSpecialArmor(); // Pastikan Anda sudah memiliki fungsi ini
                    if (specialArmor) {
                        obtainedArmors.push(specialArmor);
                    }
                }
            }

            user.celes -= totalCost; // Kurangi celes pengguna sesuai biaya gacha
            await user.save(); // Simpan perubahan ke pengguna

            let inventory = await Inventory.findOne({ userId: userId }); // Cari inventory pengguna
            if (!inventory) {
                inventory = new Inventory({ userId: userId, weapons: [], armors: [] }); // Buat inventory baru jika belum ada
            }

            obtainedArmors.forEach(armor => {
                inventory.armors.push(armor._id); // Simpan armor di inventory
            });

            await inventory.save(); // Simpan inventory

            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle(`🎉 Kamu mendapatkan armor!`)
                .setDescription(`Berikut armor yang kamu peroleh:`)
                .setFooter({ text: `Total gacha: ${jumlahGacha} ✨ Jadilah Bangsawan di Arenithia! Raih EXP dan Celes lebih banyak untuk eksplorasi, raid, dan event! 🔗 Gunakan /premium untuk detail harga dan pembelian!` });

            obtainedArmors.forEach(armor => {
                embed.addFields({ name: armor.name, value: `Grade: ${armor.grade}`, inline: true });
            });

            return interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Terjadi kesalahan:', error);
            return interaction.editReply('⚠️ Terjadi kesalahan saat menjalankan perintah ini.');
        }
    }
};
