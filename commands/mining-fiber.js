const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const MaterialInventory = require('../models/MaterialInventory');
const fibersData = require('../Data/fibers'); // Mengimpor data fibers.js

const miningRoles = {
    T1: '1319283528147664937', // Ganti dengan Role ID untuk Tier 1
    T2: '1319283601153458196', // Ganti dengan Role ID untuk Tier 2
    T3: '1319283663854370856',
    T4: '1319283729952407562',
    T5: '1319283788500570152',
    T6: '1319283904611352656',
    T7: '1319284020831322142',
    T8: '1319284083024597032',
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
        .setName('mining-fiber')
        .setDescription('Lakukan mining untuk mendapatkan fiber!')
        .addStringOption(option =>
            option.setName('tier')
                .setDescription('Pilih tier fiber yang ingin ditambang')
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
        const roleRequired = miningRoles[tier];
        if (!user.roles.cache.has(roleRequired)) {
            return interaction.reply({ content: `Anda perlu memiliki role **${roleRequired}** untuk menambang di channel ini.`, ephemeral: true });
        }

        // Ambil data fiber berdasarkan tier
        const fiberData = fibersData.Fiber[tier];
        const randomFiberQuantity = Math.floor(Math.random() * (fiberData.maxQuantity - fiberData.minQuantity + 1)) + fiberData.minQuantity;
        const randomChance = Math.floor(Math.random() * 100) + 1;

        // Jika mining berhasil (berdasarkan peluang)
        if (randomChance <= fiberData.chance) {
            const userInventory = await MaterialInventory.findOne({ userId });

            if (!userInventory) {
                return interaction.reply({ content: 'Anda tidak memiliki inventory. Mining fiber gagal.', ephemeral: true });
            }

            // Cari material fiber di inventory
            let materialInInventory = userInventory.materials.find(m => m.materialName === 'Fiber' && m.tier === tier);

            if (!materialInInventory) {
                materialInInventory = { materialName: 'Fiber', tier: tier, quantity: 0 };
                userInventory.materials.push(materialInInventory); // Jika material belum ada, tambahkan
            }

            // Update jumlah fiber di inventory
            materialInInventory.quantity += randomFiberQuantity;
            await userInventory.save(); // Pastikan data disimpan

            return interaction.reply({
                content: `Selamat! Anda berhasil menambang ${randomFiberQuantity} fiber ${tier}!`,
            });
        } else {
            return interaction.reply({ content: 'Sayang sekali, Anda gagal menambang fiber. Coba lagi!', ephemeral: true });
        }
    }
};
