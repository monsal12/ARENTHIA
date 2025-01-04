const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bundle')
        .setDescription('Menampilkan privilege premium di Arenithia.'),
    
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle('📜 Bundle Arenthia')
            .setDescription('## Privilege sama dengan Premium.. Tapi bakal habis setelah habis premiumnya ya..')
            .addFields(
                {
                    name: 'A. Hirarki Bangsawan - Privilege otomatis',
                    value: 'Berdasarkan Level Premium',
                    inline: false
                },
                {
                    name: '5k',
                    value: `
                    - 3 hari prem (common)
                    - celes 800
                    - uncommon eq/pet`,
                    inline: false
                },
                {
                    name: '10k',
                    value: `
                    - 7 hari prem (common)
                    - 2000
                    - Uncommon eq/pet`,
                    inline: false
                },
                {
                    name: '15k',
                    value: `
                    - 10 hari (common)
                    - 2800 celes
                    - Uncommon eq/pet`,
                    inline: false
                },
                {
                    name: '30k',
                    value: `
                    - 1 minggu rare
                    - 3000 celes
                    Common eq/pet`,
                    inline: false
                },
                {
                    name: '35k',
                    value: `
                            - 1 Minggu Rare
                            - 3500 celes
                            - Common eq/pet`,
                    inline: false
                },
                {
                    name: '50k',
                    value: `
                            - 1 minggu mythic
                            - 6000 celes
                            - rare eq/pet`,
                    inline: false
                },
                {
                    name: '60k',
                    value: `
                            - 1 Minggu mythic
                            - 7000 celes
                            - rare eq/pet`,
                    inline: false
                },
                {
                    name: '70k',
                    value: `
                            - 10 hari mythic
                            - 8000 celes
                            - rare eq/pet`,
                    inline: false
                },
                {
                    name: '85k',
                    value: `
                            -2 minggu mythic
                            - 9000 celes
                            - Ultra Rare eq/pet`,
                    inline: false
                },
                {
                    name: '100K',
                    value: `
                            - 20 hari mythic
                            - 10000 celes
                            - Ultra rare eq/pet`,
                    inline: false
                }
            )
            .setFooter({ text: 'Note: Semua privilege hilang setelah masa premium berakhir.' });

        await interaction.reply({ embeds: [embed] });
    }
};
