const { EmbedBuilder } = require('discord.js');
const { levelUpExperience } = require('./leveling'); 

// Function to create a progress bar with emojis
function createBar(current, max, length = 10, colorFilled = '🟩', colorEmpty = '⬛') {
    const filledLength = Math.max(0, Math.round((current / max) * length)); // Ensure not negative
    const emptyLength = Math.max(0, length - filledLength); // Ensure not negative

    const filledBar = colorFilled.repeat(filledLength); 
    const emptyBar = colorEmpty.repeat(emptyLength);    

    return filledBar + emptyBar;  
}

// Creating profile embed with decorations
function createProfileEmbed(user, viewType, avatarURL) {
    const embed = new EmbedBuilder()
        .setTitle(`✨ ${user.username}'s Epic Profile ✨`)
        .setColor('#00FF9D')  // Use a vibrant green-blue color
        .setThumbnail(avatarURL)  // Show user avatar
        .setFooter({ text: '✨ Jadilah Bangsawan di Arenithia! Raih EXP dan Celes lebih banyak untuk eksplorasi, raid, dan event! 🔗 Gunakan /premium untuk detail harga dan pembelian!', iconURL: 'https://some-url.com/footer-icon.png' }) // Add footer icon
        .setTimestamp()
        .setDescription('💼 **Karakter Stats**');

    if (viewType === 'stats') {
        embed.addFields(
            { name: '🧙‍♂️ **Level**', value: `${user.level}`, inline: true },
            { name: '💠 **Spyr Points**', value: `${user.spyr}`, inline: true },
            { name: '**Element**', value: `${user.element}`, inline: true },
            { name: '\u200B', value: '\u200B' }, 
            { 
                name: '🧭 **Experience**', 
                value: `${user.experience} / ${levelUpExperience(user.level)} \n` +
                       createBar(user.experience, levelUpExperience(user.level), 10, '🟢', '⬜'), 
                inline: false 
            },
            { 
                name: '❤️ **Health**', 
                value: `${user.health.current} / ${user.health.max} \n${createBar(user.health.current, user.health.max, 10, '🟩', '🟥')}`, 
                inline: false 
            },
            { 
                name: '🔮 **Mana**', 
                value: `${user.mana.current} / ${user.mana.max} \n${createBar(user.mana.current, user.mana.max, 10, '🟦', '⬛')}`, 
                inline: false 
            },
            { 
                name: '⚡ **Stamina**', 
                value: `${user.stamina.current} / ${user.stamina.max} \n${createBar(user.stamina.current, user.stamina.max, 10, '🟨', '⬛')}`, 
                inline: false 
            },
            { name: '💪 **Strength**', value: `${user.stats.strength}`, inline: true },
            { name: '🧠 **Intelligence**', value: `${user.stats.intelligence}`, inline: true },
            { name: '🎯 **Skills**', value: `${user.skills.join(', ') || 'No skills yet!'}`, inline: false },
            { name: '💫 **Ability**', value: `${user.stats.ability}`, inline: true }
        );
    }

    return embed;
}

// Exporting the function for use in other files
module.exports = { createProfileEmbed };
