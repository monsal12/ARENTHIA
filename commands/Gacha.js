const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const gacha = require('../Data/gachaPool');
const Weapon = require('../models/weapon');
const User = require('../models/user');
const Inventory = require('../models/inventory');

const systemAccountId = '994553740864536596'; // Discord ID akun sistem

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
        const totalCost = jumlahGacha * 800;

        if (!user || user.celes < totalCost) {
            return interaction.reply('⚠️ Kamu tidak memiliki cukup celes untuk melakukan gacha.');
        }

        try {
            await interaction.deferReply(); // Tunda balasan

            const obtainedWeapons = []; // Menyimpan senjata yang diperoleh
            let gachaRateBoost = 1 + (jumlahGacha * 0.1); // Meningkatkan rate senjata

            // Lakukan gacha sesuai jumlah yang diminta
            for (let i = 0; i < jumlahGacha; i++) {
                const randomWeapon = gacha.pullRandomWeapon(gachaRateBoost); // Menggunakan fungsi gacha dengan rate boost

                if (!randomWeapon) {
                    return interaction.editReply('⚠️ Tidak ada senjata yang dapat ditarik. Silakan coba lagi.'); // Validasi randomWeapon
                }

                const uniqueCode = `WPN${Math.floor(1000 + Math.random() * 9000)}`;

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

            user.celes -= totalCost;
            await user.save();

            let inventory = await Inventory.findOne({ userId: userId });
            if (!inventory) {
                inventory = new Inventory({ userId: userId, weapons: [] });
            }

            obtainedWeapons.forEach(weapon => {
                inventory.weapons.push(weapon._id);
            });

            await inventory.save();

            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle(`🎉 Kamu mendapatkan senjata!`)
                .setDescription(`Berikut senjata yang kamu peroleh:`)
                .setFooter({ text: `Total gacha: ${jumlahGacha}` });

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
