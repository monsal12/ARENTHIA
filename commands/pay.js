const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pay')
        .setDescription('Menampilkan metode pembayaran dan QRIS.'),
    
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor('#32CD32')
            .setTitle('💳 Pembayaran')
            .setDescription('Silakan pilih metode pembayaran di bawah ini:')
            .addFields(
                {
                    name: 'QRIS',
                    value: 'Silakan pindai QRIS di bawah ini:',
                    inline: false
                },
                {
                    name: 'Nomor Rekening/VA',
                    value: '✅ **Dana**: 082274224264\n✅ **GoPay**: 082274224264\n✅ **Ovo**: 082274224264\n✅ **SeaBank**: 901856538410',
                    inline: false
                },
                {
                    name: 'Metode Pembayaran:',
                    value: '1. Dana\n2. GoPay\n3. Ovo\n3. SeaBank\n\nSilakan pilih salah satu untuk melakukan pembayaran.',
                    inline: false
                }
            )
            .setImage('https://media.discordapp.net/attachments/1256628479768657962/1297545053975220355/IMG_7595.png?ex=67165080&is=6714ff00&hm=97de0b51ce9efdc0770a041b3c9d1e0a2e2d4f663e23c4bac048d155e6070d45&=&format=webp&quality=lossless&width=403&height=568') // Ganti dengan URL gambar QRIS Anda
            .setFooter({ text: 'Pembayaran Anda sangat dihargai!' });

        await interaction.reply({ embeds: [embed] });
    }
};
