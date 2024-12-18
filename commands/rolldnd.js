const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js'); // Perbarui import ini

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roll')
    .setDescription('Roll a dice!')
    .addIntegerOption(option =>
      option.setName('sides')
        .setDescription('Number of sides on the dice')
        .setRequired(true)
    ),

  async execute(interaction) {
    const sides = interaction.options.getInteger('sides');

    // Membuat embed dengan GIF animasi
    const embed = new EmbedBuilder() // Ganti MessageEmbed dengan EmbedBuilder
      .setTitle('Rolling the Dice...')
      .setDescription('🎲 The dice is rolling...')
      .setImage('https://media.tenor.com/images/10967561348791957467/tenor.gif') // GIF animasi dadu
      .setColor('#00FF00');

    const loadingMessage = await interaction.reply({
      embeds: [embed],
      ephemeral: false
    });

    // Menunggu beberapa detik untuk memberi efek "loading"
    setTimeout(async () => {
      const result = Math.floor(Math.random() * sides) + 1;

      // Update embed dengan hasil dice roll
      embed.setTitle('Dice Roll Result!')
        .setDescription(`You rolled a **${result}** on a ${sides}-sided dice! 🎲`)
        .setImage('https://media1.tenor.com/m/mDSa8CcMd9sAAAAd/encounter-party-encounterparty.gif'); // GIF hasil dadu

      await loadingMessage.edit({ embeds: [embed] });
    }, 3000); // Delay selama 3 detik untuk memberikan efek animasi
  },
};
