const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const MaterialInventory = require('../models/MaterialInventory');
const oresData = require('../Data/ores'); // Mengimpor data ores.js

const miningRoles = {
    T1: '1319249144644112415', // Ganti dengan Role ID untuk Tier 1
    T2: '1319254456034004992', // Ganti dengan Role ID untuk Tier 2
    T3: '1319254578679775233',
    T4: '1319254709063909376',
    T5: '1319254798788464712',
    T6: '1319254848973176864',
    T7: '1319254914639335454',
    T8: '1319254968766562365',
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
            .setDescription(`**${interaction.user.username}** telah mulai mining di **${tier}**! Waktu tersisa: **10 menit**.`)
            .addFields(
                { name: 'Tier', value: tier, inline: true },
                { name: 'Durasi Mining', value: '10 Menit', inline: true }
            )
            .setTimestamp();

        // Kirim embed ke channel agar semua orang bisa melihat
        const miningMessage = await interaction.channel.send({ embeds: [miningEmbed] });

        // Menambahkan hitung mundur
        let timeLeft = 600; // 10 menit = 600 detik
        const interval = setInterval(async () => {
            timeLeft -= 1;

            // Menghitung detik tersisa dalam format menit:detik
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            const timeString = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

            // Update embed dengan waktu tersisa
            const updatedEmbed = new EmbedBuilder(miningEmbed)
                .setDescription(`**${interaction.user.username}** telah mulai mining di **${tier}**! Waktu tersisa: **${timeString}**.`)
                .addFields(
                    { name: 'Tier', value: tier, inline: true },
                    { name: 'Durasi Mining', value: '10 Menit', inline: true }
                )
                .setTimestamp();

            await miningMessage.edit({ embeds: [updatedEmbed] });

            // Jika waktu selesai, hentikan interval dan berikan hasil mining
            if (timeLeft <= 0) {
                clearInterval(interval);

                const oreData = oresData.Ore[tier];
                const randomOreQuantity = Math.floor(Math.random() * 8) + 1; // Kisaran 1-8 ore
                const randomChance = Math.floor(Math.random() * 100) + 1;

                // Jika mining berhasil (berdasarkan peluang)
                if (randomChance <= oreData.chance) {
                    // Tambahkan ore ke inventory pemain
                    const userInventory = await MaterialInventory.findOne({ userId });

                    if (!userInventory) {
                        return interaction.followUp({ content: 'Anda tidak memiliki inventory. Mining gagal.', ephemeral: true });
                    }

                    let materialInInventory = userInventory.materials.find(m => m.materialName === 'Ore' && m.tier === tier);

                    if (!materialInInventory) {
                        materialInInventory = { materialName: 'Ore', tier: tier, quantity: 0 };
                        userInventory.materials.push(materialInInventory);
                    }

                    materialInInventory.quantity += randomOreQuantity;
                    await userInventory.save();

                    // Balas dengan hasil mining
                    await interaction.followUp({
                        content: `Selamat! Anda berhasil menambang ${randomOreQuantity} ${tier} Ore!`,
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
        }, 600000); // Setelah 10 menit (600 detik)
    }
};
