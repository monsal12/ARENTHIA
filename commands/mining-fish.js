const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const MaterialInventory = require('../models/MaterialInventory');
const fishesData = require('../Data/fishes'); // Mengimpor data fishes.js

const fishingRoles = {
    T1: '1319282658395820062', // Ganti dengan Role ID untuk Tier 1
    T2: '1319282770005983253', // Ganti dengan Role ID untuk Tier 2
    T3: '1319282845457322046',
    T4: '1319282895285915738',
    T5: '1319283003910000680',
    T6: '1319283066619035688',
    T7: '1319283123090886758',
    T8: '1319283191500242965',
};

const channelIds = {
    T1: '1319247272323579946', // Ganti dengan Channel ID fishing-tier1
    T2: '1319247295048323122', // Ganti dengan Channel ID fishing-tier2
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
                        value: tier
                    }))
                )),

    async execute(interaction) {
        const userId = interaction.user.id;
        const tier = interaction.options.getString('tier');
        const channelId = interaction.channel.id; // Mendapatkan ID Channel
        const user = interaction.guild.members.cache.get(userId);

        // Memastikan pemain berada di channel yang benar untuk fishing
        if (interaction.channel.id !== channelIds[tier]) {
            return interaction.reply({ content: `Anda harus berada di channel fishing ${tier} untuk memancing!`, ephemeral: true });
        }

        // Memastikan pengguna memiliki role yang sesuai untuk fishing
        const roleRequired = fishingRoles[tier];
        if (!user.roles.cache.has(roleRequired)) {
            return interaction.reply({ content: `Anda perlu memiliki role **${roleRequired}** untuk memancing di channel ini.`, ephemeral: true });
        }

        // Menunda balasan untuk memberi waktu kepada proses
        await interaction.deferReply();

        // Membuat Embed untuk memberi tahu semua orang bahwa fishing sedang berlangsung
        const fishingEmbed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('Mulai Fishing!')
            .setDescription(`**${interaction.user.username}** telah mulai memancing ikan di **${tier}**! Waktu tersisa: **10 menit**.`)
            .addFields(
                { name: 'Tier', value: tier, inline: true },
                { name: 'Durasi Fishing', value: '10 Menit', inline: true }
            )
            .setTimestamp();

        // Kirim embed ke channel agar semua orang bisa melihat
        const fishingMessage = await interaction.channel.send({ embeds: [fishingEmbed] });

        // Menambahkan hitung mundur
        let timeLeft = 600; // 600 detik (10 menit)
        const interval = setInterval(async () => {
            timeLeft -= 1;

            // Menghitung detik tersisa dalam format menit:detik
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            const timeString = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

            // Update embed dengan waktu tersisa
            const updatedEmbed = new EmbedBuilder(fishingEmbed)
                .setDescription(`**${interaction.user.username}** telah mulai memancing ikan di **${tier}**! Waktu tersisa: **${timeString}**.`)
                .addFields(
                    { name: 'Tier', value: tier, inline: true },
                    { name: 'Durasi Fishing', value: '10 Menit', inline: true }
                )
                .setTimestamp();

            await fishingMessage.edit({ embeds: [updatedEmbed] });

            // Jika waktu selesai, hentikan interval dan berikan hasil fishing
            if (timeLeft <= 0) {
                clearInterval(interval);

                const fishData = fishesData.Fish[tier]; // Ambil data fish berdasarkan tier
                const randomFishQuantity = Math.floor(Math.random() * (fishData.maxQuantity - fishData.minQuantity + 1)) + fishData.minQuantity;
                const randomChance = Math.floor(Math.random() * 100) + 1;

                console.log(`Mengambil data untuk Fish: ${JSON.stringify(fishData)}`); // Debugging

                // Jika fishing berhasil (berdasarkan peluang)
                if (randomChance <= fishData.chance) {
                    console.log(`Fishing berhasil! Menambah ${randomFishQuantity} Fish ke inventory.`); // Debugging

                    // Tambahkan fish ke inventory pemain
                    const userInventory = await MaterialInventory.findOne({ userId });

                    if (!userInventory) {
                        return interaction.followUp({ content: 'Anda tidak memiliki inventory. Fishing gagal.', ephemeral: true });
                    }

                    // Cari material fish di inventory
                    let materialInInventory = userInventory.materials.find(m => m.materialName === 'Fish' && m.tier === tier);

                    if (!materialInInventory) {
                        console.log(`Material Fish belum ada di inventory. Menambahkannya.`); // Debugging
                        materialInInventory = { materialName: 'Fish', tier: tier, quantity: 0 };
                        userInventory.materials.push(materialInInventory); // Jika material belum ada, tambahkan
                    }

                    // Update jumlah fish di inventory
                    materialInInventory.quantity += randomFishQuantity;

                    // Simpan perubahan inventory
                    try {
                        await userInventory.save(); // Pastikan data disimpan
                        console.log(`Inventory berhasil diperbarui dengan ${randomFishQuantity} Fish.`); // Debugging
                    } catch (error) {
                        console.error('Error saat menyimpan inventory:', error);
                    }

                    // Balas dengan hasil fishing
                    await interaction.followUp({
                        content: `Selamat! Anda berhasil memancing ${randomFishQuantity} Fish ${tier}!`,
                    });
                } else {
                    await interaction.followUp({ content: 'Sayang sekali, Anda gagal memancing ikan. Coba lagi!', ephemeral: true });
                }

                // Cabut role fishing setelah selesai
                await user.roles.remove(roleRequired);
            }
        }, 1000); // Update setiap detik (1000 ms)

        // Setelah fishing selesai, cabut role fishing
        setTimeout(async () => {
            await user.roles.remove(roleRequired);
        }, 600000); // Setelah 10 menit (600000 ms)
    }
};
