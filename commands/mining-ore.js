const { SlashCommandBuilder } = require('discord.js');
const MaterialInventory = require('../models/MaterialInventory');
const oresData = require('../Data/ores'); // Mengimpor data ores.js

const miningRoles = {
    T1: '1319249144644112415',
    T2: '1319254456034004992',
    T3: '1319254578679775233',
    T4: '1319254709063909376',
    T5: '1319254798788464712',
    T6: '1319254848973176864',
    T7: '1319254914639335454',
    T8: '1319254968766562365',
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
        .setName('mining-ore')
        .setDescription('Lakukan mining untuk mendapatkan ore!')
        .addStringOption(option =>
            option.setName('tier')
                .setDescription('Pilih tier ore yang ingin ditambang')
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

        // Memastikan pemain berada di channel yang benar
        if (interaction.channel.id !== channelIds[tier]) {
            return interaction.reply({ content: `Anda harus berada di channel mining ${tier} untuk menambang!`, ephemeral: true });
        }

        // Memastikan pengguna memiliki role yang sesuai
        const roleRequired = miningRoles[tier];
        if (!user.roles.cache.has(roleRequired)) {
            return interaction.reply({ content: `Anda perlu memiliki role **${roleRequired}** untuk menambang di channel ini.`, ephemeral: true });
        }

        // Ambil data ore berdasarkan tier
        const oreData = oresData.Ore[tier];
        const randomOreQuantity = Math.floor(Math.random() * (oreData.maxQuantity - oreData.minQuantity + 1)) + oreData.minQuantity;
        const randomChance = Math.floor(Math.random() * 100) + 1;

        // Jika mining berhasil
        if (randomChance <= oreData.chance) {
            const userInventory = await MaterialInventory.findOne({ userId });

            if (!userInventory) {
                return interaction.reply({ content: 'Anda tidak memiliki inventory. Mining gagal.', ephemeral: true });
            }

            let materialInInventory = userInventory.materials.find(m => m.materialName === 'Ore' && m.tier === tier);

            if (!materialInInventory) {
                materialInInventory = { materialName: 'Ore', tier: tier, quantity: 0 };
                userInventory.materials.push(materialInInventory);
            }

            materialInInventory.quantity += randomOreQuantity;
            await userInventory.save();

            return interaction.reply({
                content: `Selamat! Anda berhasil menambang ${randomOreQuantity} ${tier} Ore!`,
            });
        } else {
            return interaction.reply({ content: 'Sayang sekali, Anda gagal menambang. Coba lagi!', ephemeral: true });
        }
    }
};
