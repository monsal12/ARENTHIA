const { EmbedBuilder } = require('discord.js');

// Fungsi untuk membuat embed pertarungan
function createBattleEmbed(user, monster) {
    const embed = new EmbedBuilder()
        .setTitle(`Pertarungan Melawan ${monster.name}`)
        .setColor('#ff0000')
        .addFields(
            { name: 'Profil Karakter', value: `${user.username}`, inline: true },
            { name: 'Kesehatan', value: `${user.health.current} / ${user.health.max}`, inline: true },
            { name: 'Kesehatan Monster', value: `${monster.health}`, inline: true },
            { name: 'Mana', value: `${user.mana.current} / ${user.mana.max}`, inline: true },
            { name: 'Stamina', value: `${user.stamina.current} / ${user.stamina.max}`, inline: true },
            { name: 'Attack Monster', value: `${monster.attack}`, inline: true },
            { name: 'Defense Monster', value: `${monster.defense}`, inline: true },
        )
        .setImage(monster.image) // Gambar monster
        .setFooter({ text: 'Pilih aksi untuk bertarung!' });

    return embed;
}

// Mengekspor fungsi untuk digunakan di file lain
module.exports = { createBattleEmbed };
