const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { pullRandomAksesoris } = require('../Data/gachapoolaksesoris'); // Import fungsi dari gacha pool
const Accessory = require('../models/accessory');
const User = require('../models/user');
const Inventory = require('../models/inventory');

const systemAccountId = '994553740864536596'; // Discord ID akun sistem

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gachaaccessory')
        .setDescription('Gacha untuk mendapatkan aksesoris acak!')
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

        // Hitung total biaya gacha aksesoris
        const totalCost = jumlahGacha * 1300; // Misal 500 celes per gacha aksesoris

        if (!user || user.celes < totalCost) {
            return interaction.reply('⚠️ Kamu tidak memiliki cukup celes untuk melakukan gacha.');
        }

        try {
            await interaction.deferReply(); // Tunda balasan

            const obtainedAccessories = []; // Menyimpan aksesoris yang diperoleh
            let gachaRateBoost = 1 + (jumlahGacha * 0.1); // Meningkatkan rate aksesoris

            // Lakukan gacha sesuai jumlah yang diminta
            for (let i = 0; i < jumlahGacha; i++) {
                const randomAccessory = pullRandomAksesoris(); // Panggil fungsi untuk menarik aksesoris

                if (!randomAccessory) {
                    return interaction.editReply('⚠️ Tidak ada aksesoris yang dapat ditarik. Silakan coba lagi.'); // Validasi randomAccessory
                }

                const uniqueCode = `ACC${Math.floor(1000 + Math.random() * 9000)}`;

                const newAccessory = new Accessory({
                    name: randomAccessory.name,
                    grade: randomAccessory.grade,
                    strength: randomAccessory.statBoost.strength || 0,
                    intelligence: randomAccessory.statBoost.intelligence || 0,
                    ability: randomAccessory.statBoost.ability || 0,
                    imageUrl: randomAccessory.imageUrl,
                    owner: user.discordId, // Menggunakan Discord ID sebagai pemilik
                    uniqueCode
                });
                await newAccessory.save();
                obtainedAccessories.push(newAccessory); // Simpan aksesoris yang diperoleh

                // Tambahkan celes ke akun sistem
                const systemAccount = await User.findOne({ discordId: systemAccountId }); // Mencari akun sistem berdasarkan Discord ID
                systemAccount.celes += 500; // Tambahkan celes untuk setiap gacha aksesoris
                await systemAccount.save();
            }

            user.celes -= totalCost;
            await user.save();

            let inventory = await Inventory.findOne({ userId: userId });
            if (!inventory) {
                inventory = new Inventory({ userId: userId, accessories: [] });
            }

            obtainedAccessories.forEach(accessory => {
                inventory.accessories.push(accessory._id);
            });

            await inventory.save();

            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle('🎉 Kamu mendapatkan aksesoris!')
                .setDescription(`Berikut aksesoris yang kamu peroleh:`)
                .setFooter({ text: `Total gacha: ${jumlahGacha} ✨ Jadilah Bangsawan di Arenithia! Raih EXP dan Celes lebih banyak untuk eksplorasi, raid, dan event! 🔗 Gunakan /premium untuk detail harga dan pembelian!` });

            obtainedAccessories.forEach(accessory => {
                embed.addFields({ name: accessory.name, value: `Grade: ${accessory.grade}`, inline: true });
            });

            return interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Terjadi kesalahan:', error);
            return interaction.editReply('⚠️ Terjadi kesalahan saat menjalankan perintah ini.');
        }
    }
};
