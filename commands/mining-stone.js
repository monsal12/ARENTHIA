const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const MaterialInventory = require('../models/MaterialInventory');
const stonesData = require('../Data/stones'); // Mengimpor data stones.js

const miningRoles = {
    T1: '1319280201225732147',
    T2: '1319280354301050961',
    T3: '1319280450480640042',
    T4: '1319280516943314964',
    T5: '1319280600791908403',
    T6: '1319280660627587072',
    T7: '1319280717565268001',
    T8: '1319280731222183997',
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

async function validateUser(interaction, tier) {
    const userId = interaction.user.id;
    const user = interaction.guild.members.cache.get(userId);

    // Validasi channel
    if (interaction.channel.id !== channelIds[tier]) {
        throw new Error(`Anda harus berada di channel mining ${tier} untuk menambang!`);
    }

    // Validasi role
    const roleRequired = miningRoles[tier];
    if (!user.roles.cache.has(roleRequired)) {
        throw new Error(`Anda perlu memiliki role **${roleRequired}** untuk menambang di channel ini.`);
    }

    return user;
}

async function updateInventory(userId, tier, quantity) {
    const userInventory = await MaterialInventory.findOne({ userId });

    if (!userInventory) {
        throw new Error('Anda tidak memiliki inventory. Mining gagal.');
    }

    let materialInInventory = userInventory.materials.find(m => m.materialName === 'Stone' && m.tier === tier);

    if (!materialInInventory) {
        materialInInventory = { materialName: 'Stone', tier: tier, quantity: 0 };
        userInventory.materials.push(materialInInventory);
    }

    materialInInventory.quantity += quantity;
    await userInventory.save();
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mining-stone')
        .setDescription('Lakukan mining untuk mendapatkan stone!')
        .addStringOption(option =>
            option.setName('tier')
                .setDescription('Pilih tier stone yang ingin ditambang')
                .setRequired(true)
                .addChoices(
                    ...["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8"].map(tier => ({
                        name: tier,
                        value: tier
                    }))
                )),

    async execute(interaction) {
        const tier = interaction.options.getString('tier');

        try {
            const user = await validateUser(interaction, tier);
            await interaction.deferReply();

            // Ambil data stone berdasarkan tier
            const stoneData = stonesData.Stone[tier];
            const randomStoneQuantity = Math.floor(Math.random() * (stoneData.maxQuantity - stoneData.minQuantity + 1)) + stoneData.minQuantity;
            const randomChance = Math.floor(Math.random() * 100) + 1;

            // Jika mining berhasil (berdasarkan peluang)
            if (randomChance <= stoneData.chance) {
                await updateInventory(interaction.user.id, tier, randomStoneQuantity);
                await interaction.followUp({
                    content: `Selamat! Anda berhasil menambang ${randomStoneQuantity} Stone ${tier}!`,
                });
            } else {
                await interaction.followUp({ content: 'Sayang sekali, Anda gagal menambang stone. Coba lagi!', ephemeral: true });
            }

            // Cabut role setelah mining selesai
            await user.roles.remove(miningRoles[tier]);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: error.message, ephemeral: true });
        }
    }
};
