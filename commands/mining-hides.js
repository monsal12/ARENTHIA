const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const MaterialInventory = require('../models/MaterialInventory');
const hidesData = require('../Data/hides'); // Mengimpor data hides.js

const miningRoles = {
    T1: '1319281700336959529',
    T2: '1319281747107516416',
    T3: '1319281763545120800',
    T4: '1319281882189402133',
    T5: '1319281911092219935',
    T6: '1319281952557240340',
    T7: '1319281982513086464',
    T8: '1319282013097824339',
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
        .setName('mining-hide')
        .setDescription('Lakukan mining untuk mendapatkan hide!')
        .addStringOption(option =>
            option.setName('tier')
                .setDescription('Pilih tier hide yang ingin ditambang')
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
                return interaction.reply({ content: `Anda harus berada di channel mining ${tier} untuk menambang!`, ephemeral: true });
            }

            // Validasi role
            const roleRequired = miningRoles[tier];
            if (!user.roles.cache.has(roleRequired)) {
                return interaction.reply({ content: `Anda perlu memiliki role **${roleRequired}** untuk menambang di channel ini.`, ephemeral: true });
            }

            // Ambil data hide berdasarkan tier
            const hideData = hidesData.Hide[tier];
            const randomHideQuantity = Math.floor(Math.random() * (hideData.maxQuantity - hideData.minQuantity + 1)) + hideData.minQuantity;
            const randomChance = Math.floor(Math.random() * 100) + 1;

            // Jika mining berhasil
            if (randomChance <= hideData.chance) {
                const userInventory = await MaterialInventory.findOne({ userId });

                if (!userInventory) {
                    throw new Error('Anda tidak memiliki inventory. Mining gagal.');
                }

                // Cari material hide di inventory
                let materialInInventory = userInventory.materials.find(m => m.materialName === 'Hide' && m.tier === tier);

                if (!materialInInventory) {
                    materialInInventory = { materialName: 'Hide', tier: tier, quantity: 0 };
                    userInventory.materials.push(materialInInventory);
                }

                // Tambahkan hide ke inventory
                materialInInventory.quantity += randomHideQuantity;
                await userInventory.save();

                await interaction.reply({
                    content: `Selamat! Anda berhasil menambang ${randomHideQuantity} hide ${tier}!`,
                });
            } else {
                await interaction.reply({ content: 'Sayang sekali, Anda gagal menambang hide. Coba lagi!', ephemeral: true });
            }

            // Pencabutan role setelah selesai
            if (user.roles.cache.has(roleRequired)) {
                await user.roles.remove(roleRequired);
            }
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: `Terjadi kesalahan: ${error.message}`, ephemeral: true });
        }
    },
};
