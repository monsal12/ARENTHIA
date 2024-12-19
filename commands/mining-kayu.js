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
        const channelId = interaction.channel.id;
        const user = interaction.guild.members.cache.get(userId);

        console.log("Tier yang dipilih:", tier);

        // Memastikan pemain berada di channel yang benar untuk mining
        if (interaction.channel.id !== channelIds[tier]) {
            return interaction.reply({ content: `Anda harus berada di channel mining ${tier} untuk menambang!`, ephemeral: true });
        }

        // Memastikan pengguna memiliki role yang sesuai untuk mining
        const roleRequired = woodRoles[tier];
        if (!user.roles.cache.has(roleRequired)) {
            return interaction.reply({ content: `Anda perlu memiliki role **${roleRequired}** untuk menambang di channel ini.`, ephemeral: true });
        }

        // Menunda balasan untuk memberi waktu kepada proses
        await interaction.deferReply();

        // Membuat Embed untuk memberi tahu semua orang bahwa mining sedang berlangsung
        const miningEmbed = new EmbedBuilder()
            .setColor('#8B4513')
            .setTitle('Mulai Mining Kayu!')
            .setDescription(`**${interaction.user.username}** telah mulai mining kayu di **${tier}**! Waktu tersisa: **10 menit**.`)
            .addFields(
                { name: 'Tier', value: tier, inline: true },
                { name: 'Durasi Mining', value: '10 Menit', inline: true }
            )
            .setTimestamp();

        // Kirim embed ke channel agar semua orang bisa melihat
        const miningMessage = await interaction.channel.send({ embeds: [miningEmbed] });

        // Mengatur waktu mining menjadi 10 menit
        let timeLeft = 600; // 600 detik (10 menit)
        const interval = setInterval(async () => {
            timeLeft -= 1;

            // Menghitung waktu tersisa dalam format menit:detik
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            const timeString = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

            // Update embed dengan waktu tersisa
            const updatedEmbed = new EmbedBuilder(miningEmbed)
                .setDescription(`**${interaction.user.username}** telah mulai mining kayu di **${tier}**! Waktu tersisa: **${timeString}**.`)
                .addFields(
                    { name: 'Tier', value: tier, inline: true },
                    { name: 'Durasi Mining', value: '10 Menit', inline: true }
                )
                .setTimestamp();

            await miningMessage.edit({ embeds: [updatedEmbed] });

            // Jika waktu selesai, hentikan interval dan berikan hasil mining
            if (timeLeft <= 0) {
                clearInterval(interval);

                const woodData = woodsData.Wood[tier];  // Pastikan tier data ada
                const randomWoodQuantity = Math.floor(Math.random() * (woodData.maxQuantity - woodData.minQuantity + 1)) + woodData.minQuantity;
                const randomChance = Math.floor(Math.random() * 100) + 1;

                // Jika mining berhasil (berdasarkan peluang)
                if (randomChance <= woodData.chance) {
                    // Tambahkan kayu ke inventory pemain
                    const userInventory = await MaterialInventory.findOne({ userId });

                    if (!userInventory) {
                        return interaction.followUp({ content: 'Anda tidak memiliki inventory. Mining gagal.', ephemeral: true });
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

                    // Balas dengan hasil mining
                    await interaction.followUp({
                        content: `Selamat! Anda berhasil menambang ${randomWoodQuantity} ${tier} Wood!`,
                    });
                } else {
                    await interaction.followUp({ content: 'Sayang sekali, Anda gagal menambang. Coba lagi!', ephemeral: true });
                }

                // Cabut role mining setelah selesai
                await user.roles.remove(roleRequired);
            }
        }, 1000); // Update setiap detik (1000 ms)

        // Setelah mining selesai, cabut role mining
        setTimeout(async () => {
            await user.roles.remove(roleRequired);
        }, 600000); // Setelah 10 menit (600000 ms)
    }
};
