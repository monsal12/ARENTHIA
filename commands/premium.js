const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('premium')
        .setDescription('Menampilkan privilege premium di Arenithia.'),
    
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle('📜 PRIVILEGE BANGSAWAN [ PREMIUM ARENTHIA]')
            .setDescription('## Privilege Premium.. bisa pilih salah satu, atau beberapa')
            .addFields(
                {
                    name: 'A. Hirarki Bangsawan - Privilege otomatis',
                    value: 'Berdasarkan Level Premium',
                    inline: false
                },
                {
                    name: 'Ticket Common: 35k (<:Tier1:1295454918605537351>)',
                    value: `
                    - XP + 10%
                    - Gold + 10%
                    - Jabatan kebangsawanan inti kekaisaran [Margrave]
                    - Dapat mengangkat 2 orang menjadi keluarga bangsawan
                    - 2000 celes/minggu
                    - Semua privilege berlaku selama 30 hari`,
                    inline: false
                },
                {
                    name: 'Ticket Rare: 80k (<:Tier2:1295455125292322939>)',
                    value: `
                    - XP + 30%
                    - Gold + 30%
                    - Jabatan bangsawan inti kekaisaran [Elector]
                    - Dapat mengangkat 4 orang menjadi keluarga bangsawan
                    - 3000 celes/minggu
                    - Semua privilege berlaku selama 30 hari`,
                    inline: false
                },
                {
                    name: 'Ticket Mythic: 125k (<:T5:1295455329177305158>)',
                    value: `
                    - XP + 40%
                    - Gold + 40%
                    - Jabatan bangsawan inti kekaisaran [Archduke]
                    - Dapat mengangkat 6 orang menjadi keluarga bangsawan
                    - 4000 celes/minggu
                    - customisasi senjata dengan rarity ultra rare. Meliputi gambar visual, nama, dan alokasi 12 stat
                    - Semua privilege berlaku selama 30 hari`,
                    inline: false
                },
                {
                    name: 'Ticket Legendary: 250k (<:Tier6:1295455547528708177>)',
                    value: `
                    - XP + 60%
                    - Gold + 60%
                    - Jabatan bangsawan inti kekaisaran [High King]
                    - Dapat mengangkat 8 orang menjadi keluarga bangsawan
                    - customisasi senjata dengan rarity epic. Meliputi gambar visual, nama, dan alokasi 15 stat
                    - 5000 celes/minggu
                    - Semua privilege berlaku selama 30 hari`,
                    inline: false
                },
                {
                    name: 'Hirarki Bangsawan',
                    value: `
                    1. High King - Legendary Ticket Activate
                    2. Archduke – Mythic Ticket Activate
                    3. Elector – Rare Ticket Activate
                    4. Margrave – Common Ticket Activate
                    5. King – Peringkat bangsawan paling rendah, diberikan kepada pemimpin wilayah. (Tidak mendapatkan privilege premium)`,
                    inline: false
                },
                {
                    name: 'B. Hak Mengangkat Keluarga Bangsawan (opsional)',
                    value: 'Bangsawan berhak mengangkat anggota keluarga bangsawan sesuai dengan premium yang mereka aktifkan.',
                    inline: false
                },
                {
                    name: 'C. Hak Membuat Marga Bangsawan (opsional)',
                    value: 'Bangsawan memiliki hak untuk menciptakan nama marga bangsawan, dengan role khusus yang akan dibuat untuk mewakili marga tersebut.',
                    inline: false
                },
                {
                    name: 'D. Hak Membuat Role Custom (opsional)',
                    value: 'Bangsawan dapat meminta role custom sesuai dengan status atau gelar yang diinginkan.',
                    inline: false
                },
                {
                    name: 'F. Hak Membuat Istana Khusus (opsional)',
                    value: 'Bangsawan memiliki hak untuk membangun istana pribadi di dalam kekaisaran.',
                    inline: false
                },
                {
                    name: 'G. Penghormatan Khusus (aktif otomatis)',
                    value: 'Bangsawan berhak menerima penghormatan khusus dari warga biasa dan dari bangsawan dengan hirarki lebih rendah. Bangsawan bisa membuat laporan ke staff/kaisar jika ada tindakan yang dinilai menjatuhkan martabat Kebangsawanan nya.',
                    inline: false
                },
                {
                    name: 'H. Ketentuan Duel (aktif otomatis)',
                    value: 'Bangsawan berhak menolak tantangan duel dari kasta yang lebih rendah tanpa perlu roll leave.',
                    inline: false
                }
            )
            .setFooter({ text: 'Note: Semua privilege hilang setelah masa premium berakhir.' });

        await interaction.reply({ embeds: [embed] });
    }
};
