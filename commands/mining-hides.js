const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const MaterialInventory = require('../models/MaterialInventory');
const hidesData = require('../Data/hides'); // Mengimpor data hides.js

const miningRoles = {
    T1: '1319281700336959529', // Ganti dengan Role ID untuk Tier 1
    T2: '1319281747107516416', // Ganti dengan Role ID untuk Tier 2
    T3: '1319281763545120800',
    T4: '1319281882189402133',
    T5: '1319281911092219935',
    T6: '1319281952557240340',
    T7: '1319281982513086464',
    T8: '1319282013097824339',
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
        .setName('mining-hide')
        .setDescription('Lakukan mining untuk mendapatkan hide!')
        .addStringOption(option =>
            option.setName('tier')
                .setDescription('Pilih tier hide yang ingin ditambang')
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
        const channelId = interaction.channel.id; // Mendapatkan ID Channel
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

        // Menunda balasan untuk memberi waktu kepada proses
        await interaction.deferReply();

        // Membuat Embed untuk memberi tahu semua orang bahwa mining sedang berlangsung
        const miningEmbed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('Mulai Mining!')
            .setDescription(`**${interaction.user.username}** telah mulai mining hide di **${tier}**! Waktu tersisa: **10 menit**.`)
            .addFields(
                { name: 'Tier', value: tier, inline: true },
                { name: 'Durasi Mining', value: '10 Menit', inline: true }
            )
            .setTimestamp();

        // Kirim embed ke channel agar semua orang bisa melihat
        const miningMessage = await interaction.channel.send({ embeds: [miningEmbed] });

        // Menambahkan hitung mundur
        let timeLeft = 600; // 600 detik (10 menit)
        const interval = setInterval(async () => {
            timeLeft -= 1;

            // Menghitung detik tersisa dalam format menit:detik
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            const timeString = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

            // Update embed dengan waktu tersisa
            const updatedEmbed = new EmbedBuilder(miningEmbed)
                .setDescription(`**${interaction.user.username}** telah mulai mining hide di **${tier}**! Waktu tersisa: **${timeString}**.`)
                .addFields(
                    { name: 'Tier', value: tier, inline: true },
                    { name: 'Durasi Mining', value: '10 Menit', inline: true }
                )
                .setTimestamp();

            await miningMessage.edit({ embeds: [updatedEmbed] });

            // Jika waktu selesai, hentikan interval dan berikan hasil mining
            if (timeLeft <= 0) {
                clearInterval(interval);

                const hideData = hidesData.Hide[tier]; // Ambil data hide berdasarkan tier
                const randomHideQuantity = Math.floor(Math.random() * (hideData.maxQuantity - hideData.minQuantity + 1)) + hideData.minQuantity;
                const randomChance = Math.floor(Math.random() * 100) + 1;

                // Jika mining berhasil (berdasarkan peluang)
                if (randomChance <= hideData.chance) {
                    // Tambahkan hide ke inventory pemain
                    const userInventory = await MaterialInventory.findOne({ userId });

                    if (!userInventory) {
                        return interaction.followUp({ content: 'Anda tidak memiliki inventory. Mining hide gagal.', ephemeral: true });
                    }

                    // Cari material hide di inventory
                    let materialInInventory = userInventory.materials.find(m => m.materialName === 'Hide' && m.tier === tier);

                    if (!materialInInventory) {
                        materialInInventory = { materialName: 'Hide', tier: tier, quantity: 0 };
                        userInventory.materials.push(materialInInventory); // Jika material belum ada, tambahkan
                    }

                    // Update jumlah hide di inventory
                    materialInInventory.quantity += randomHideQuantity;
                    await userInventory.save(); // Pastikan data disimpan

                    // Balas dengan hasil mining
                    await interaction.followUp({
                        content: `Selamat! Anda berhasil menambang ${randomHideQuantity} hide ${tier}!`,
                    });
                } else {
                    await interaction.followUp({ content: 'Sayang sekali, Anda gagal menambang hide. Coba lagi!', ephemeral: true });
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
