const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const MaterialInventory = require('../models/MaterialInventory');
const woodsData = require('../Data/woods'); // Mengimpor data woods.js

const woodRoles = {
    T1: '1319281124857610262', // Ganti dengan Role ID untuk Tier 1
    T2: '1319281183338663977', // Ganti dengan Role ID untuk Tier 2
    T3: '1319281265324851240',
    T4: '1319281322664919122',
    T5: '1319281420270702625',
    T6: '1319281475841036288',
    T7: '1319281486095974491',
    T8: '1319281576219246715',
};

const channelIds = {
    T1: '1319247272323579946', // Ganti dengan Channel ID mining-tier1
    T2: '1319247295048323122', // Ganti dengan Channel ID mining-tier2
    T3: '1319247323125121054',
    T4: '1319247341047386112',
    T5: '1319247362073559051',
    T6: '1319247407372042251',
    T7: '1319247447746412586',
    T8: '1319247485155409920',
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mining-wood')
        .setDescription('Lakukan mining untuk mendapatkan kayu!')
        .addStringOption(option =>
            option.setName('tier')
                .setDescription('Pilih tier kayu yang ingin ditambang')
                .setRequired(true)
                .addChoices(
                    ...["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8"].map(tier => ({
                        name: tier,
                        value: tier
                    }))
                )),

    async execute(interaction) {
        const userId = interaction.user.id;
        const tier = interaction.options.getString('tier');
        const user = interaction.guild.members.cache.get(userId);

        // Memastikan pemain berada di channel yang benar untuk mining
        if (interaction.channel.id !== channelIds[tier]) {
            return interaction.reply({ content: `Anda harus berada di channel mining ${tier} untuk menambang!`, ephemeral: true });
        }

        // Memastikan pengguna memiliki role yang sesuai untuk mining
        const roleRequired = woodRoles[tier];
        if (!user.roles.cache.has(roleRequired)) {
            return interaction.reply({ content: `Anda perlu memiliki role **${roleRequired}** untuk menambang di channel ini.`, ephemeral: true });
        }

        // Ambil data kayu berdasarkan tier
        const woodData = woodsData.Wood[tier];
        const randomWoodQuantity = Math.floor(Math.random() * (woodData.maxQuantity - woodData.minQuantity + 1)) + woodData.minQuantity;
        const randomChance = Math.floor(Math.random() * 100) + 1;

        // Jika mining berhasil (berdasarkan peluang)
        if (randomChance <= woodData.chance) {
            const userInventory = await MaterialInventory.findOne({ userId });

            if (!userInventory) {
                return interaction.reply({ content: 'Anda tidak memiliki inventory. Mining gagal.', ephemeral: true });
            }

            let materialInInventory = userInventory.materials.find(m => m.materialName === 'Wood' && m.tier === tier);

            // Jika material tidak ada di inventory, buat baru
            if (!materialInInventory) {
                materialInInventory = { materialName: 'Wood', tier: tier, quantity: 0 };
                userInventory.materials.push(materialInInventory);
            }

            // Tambah jumlah kayu
            materialInInventory.quantity += randomWoodQuantity;
            await userInventory.save();

            return interaction.reply({
                content: `Selamat! Anda berhasil menambang ${randomWoodQuantity} ${tier} Wood!`,
            });
        } else {
            return interaction.reply({ content: 'Sayang sekali, Anda gagal menambang kayu. Coba lagi!', ephemeral: true });
        }
    }
};
