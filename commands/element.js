const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('elements')
        .setDescription('Lihat daftar elemen dan detailnya'),
    async execute(interaction) {
        // Menggunakan deferReply untuk memberi tahu pengguna bahwa proses sedang berjalan
        await interaction.deferReply();

        const embed = new EmbedBuilder()
            .setColor('#f1c40f')
            .setTitle('Daftar Elemen')
            .setDescription('Setiap elemen memiliki tipe dan kelemahan tersendiri.')
            .addFields(
                { name: '#1 | Flame <:flame_custom:1293529213734883371>', value: 'Tipe: Damage\nKelemahan: Light, Wave, Terra\nElemen Flame memungkinkan penggunanya untuk menggunakan kekuatan dari efek panas yang intens, seperti api, dan bahkan magma.', inline: false },
                { name: '#2 | Volt <:volt_custom:1293529328285384768>', value: 'Tipe: Damage + Defense\nKelemahan: Terra\nVolt memungkinkan penggunanya untuk menggunakan kekuatan dari arus listrik dan petir.\nEfektivitas serangan dan pertahanannya rata-rata, tapi sulit untuk dilawan selain oleh Terra.', inline: false },
                { name: '#3 | Wave <:wave_custom:1293529607403733035>', value: 'Tipe: Damage\nKelemahan: Volt, Frost, Bloom\nWave memungkinkan penggunanya untuk mengontrol kelembapan dan cairan lainnya.', inline: false },
                { name: '#4 | Frost <:frost_custom:1293529396216598528>', value: 'Tipe: Defense + Heal\nKelemahan: Flame, Light, Alloy\nFrost memungkinkan penggunanya untuk mengontrol efek dingin yang sangat rendah, es, dan pembekuan.', inline: false },
                { name: '#5 | Gale <:gale_custom:1293529685673775224>', value: 'Tipe: Damage + Heal\nKelemahan: Flame, Volt, Frost\nGale memungkinkan penggunanya untuk mengontrol kekuatan angin dan cuaca.', inline: false },
                { name: '#6 | Bloom <:bloom_custom:1293529474674982935>', value: 'Tipe: Defense + Heal\nKelemahan: Flame, Frost, Flame, Venom\nBloom memungkinkan penggunanya untuk menggunakan kekuatan alam dan flora.', inline: false },
                { name: '#7 | Terra <:terra_custom:1293529758298144789>', value: 'Tipe: Defense\nKelemahan: Wave, Frost, Bloom, Alloy\nTerra memungkinkan penggunanya untuk mengontrol pasir, batu, dan tanah.', inline: false },
                { name: '#8 | Alloy <:alloy_custom:1293529998879227990>', value: 'Tipe: Damage + Defense\nKelemahan: Flame, Terra\nAlloy memungkinkan penggunanya untuk menggunakan kekuatan dari logam dan mineral.', inline: false },
                { name: '#9 | Light <:light_custom:1293529911977578579>', value: 'Tipe: Heal\nKelemahan: Bloom, Alloy\nLight memungkinkan penggunanya untuk menggunakan kekuatan sinar cahaya.', inline: false },
                { name: '#10 | Venom <:venom_custom:1293529825872449587>', value: 'Tipe: Damage\nKelemahan: Light, Frost, Terra\nVenom memungkinkan penggunanya untuk meniru efek racun dan toksin.', inline: false }
            );

        // Mengedit respons untuk mengirim embed
        await interaction.editReply({ embeds: [embed] });
    }
};
