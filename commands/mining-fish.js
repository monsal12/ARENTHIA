const { SlashCommandBuilder } = require('discord.js');
const MaterialInventory = require('../models/MaterialInventory');
const fishesData = require('../Data/fishes'); // Mengimpor data fishes.js

const fishingRoles = {
    T1: '1319282658395820062',
    T2: '1319282770005983253',
    T3: '1319282845457322046',
    T4: '1319282895285915738',
    T5: '1319283003910000680',
    T6: '1319283066619035688',
    T7: '1319283123090886758',
    T8: '1319283191500242965',
};

const channelIds = {
    T1: '1319247272323579946',
    T2: '1319247295048323122',
    T3: '1319247323125121054',
    T4: '1319247341047386112',
    T5: '1319247362073559051',
    T6: '1319247407372042251',
    T7: '1319247447746412586',
    T8: '1319247485155409920',
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fishing')
        .setDescription('Lakukan fishing untuk mendapatkan ikan!')
        .addStringOption(option =>
            option.setName('tier')
                .setDescription('Pilih tier ikan yang ingin ditangkap')
                .setRequired(true)
                .addChoices(
                    ...["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8"].map(tier => ({
                        name: tier,
                        value: tier,
                    }))
                )),

    async execute(interaction) {
        try {
            const userId = interaction.user.id;
            const tier = interaction.options.getString('tier');
            const user = interaction.guild.members.cache.get(userId);

            // Validasi channel
            if (interaction.channel.id !== channelIds[tier]) {
                return interaction.reply({
                    content: `Anda harus berada di channel fishing ${tier} untuk memancing!`,
                    ephemeral: true,
                });
            }

            // Validasi role
            const roleRequired = fishingRoles[tier];
            if (!user.roles.cache.has(roleRequired)) {
                return interaction.reply({
                    content: `Anda perlu memiliki role **${roleRequired}** untuk memancing di channel ini.`,
                    ephemeral: true,
                });
            }

            // Ambil data ikan berdasarkan tier
            const fishData = fishesData.Fish[tier];
            const randomFishQuantity = Math.floor(
                Math.random() * (fishData.maxQuantity - fishData.minQuantity + 1)
            ) + fishData.minQuantity;
            const randomChance = Math.floor(Math.random() * 100) + 1;

            // Jika fishing berhasil
            if (randomChance <= fishData.chance) {
                const userInventory = await MaterialInventory.findOne({ userId });

                if (!userInventory) {
                    throw new Error('Anda tidak memiliki inventory. Fishing gagal.');
                }

                // Cari material fish di inventory
                let materialInInventory = userInventory.materials.find(
                    m => m.materialName === 'Fish' && m.tier === tier
                );

                if (!materialInInventory) {
                    materialInInventory = { materialName: 'Fish', tier: tier, quantity: 0 };
                    userInventory.materials.push(materialInInventory);
                }

                // Update jumlah ikan di inventory
                materialInInventory.quantity += randomFishQuantity;
                await userInventory.save();

                await interaction.reply({
                    content: `Selamat! Anda berhasil memancing ${randomFishQuantity} Fish ${tier}!`,
                });
            } else {
                await interaction.reply({
                    content: 'Sayang sekali, Anda gagal memancing ikan. Coba lagi!',
                    ephemeral: true,
                });
            }

            // Pencabutan role setelah selesai memancing
            if (user.roles.cache.has(roleRequired)) {
                await user.roles.remove(roleRequired);
            }
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: `Terjadi kesalahan: ${error.message}`,
                ephemeral: true,
            });
        }
    },
};
