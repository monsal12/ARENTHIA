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
            .setDescription(`**${interaction.user.username}** telah mulai mining fiber di **${tier}**! Waktu tersisa: **10 menit**.`)
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
                .setDescription(`**${interaction.user.username}** telah mulai mining fiber di **${tier}**! Waktu tersisa: **${timeString}**.`)
                .addFields(
                    { name: 'Tier', value: tier, inline: true },
                    { name: 'Durasi Mining', value: '10 Menit', inline: true }
                )
                .setTimestamp();

            await miningMessage.edit({ embeds: [updatedEmbed] });

            // Jika waktu selesai, hentikan interval dan berikan hasil mining
            if (timeLeft <= 0) {
                clearInterval(interval);

                const fiberData = fibersData.Fiber[tier]; // Ambil data fiber berdasarkan tier
                const randomFiberQuantity = Math.floor(Math.random() * (fiberData.maxQuantity - fiberData.minQuantity + 1)) + fiberData.minQuantity;
                const randomChance = Math.floor(Math.random() * 100) + 1;

                // Jika mining berhasil (berdasarkan peluang)
                if (randomChance <= fiberData.chance) {
                    // Tambahkan fiber ke inventory pemain
                    const userInventory = await MaterialInventory.findOne({ userId });

                    if (!userInventory) {
                        return interaction.followUp({ content: 'Anda tidak memiliki inventory. Mining fiber gagal.', ephemeral: true });
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

                    // Balas dengan hasil mining
                    await interaction.followUp({
                        content: `Selamat! Anda berhasil menambang ${randomFiberQuantity} fiber ${tier}!`,
                    });
                } else {
                    await interaction.followUp({ content: 'Sayang sekali, Anda gagal menambang fiber. Coba lagi!', ephemeral: true });
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
