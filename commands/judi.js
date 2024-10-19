const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js'); // Import yang diperlukan
const User = require('../models/user'); // Model untuk data user di MongoDB
const SystemAccountId = '994553740864536596'; // Ganti dengan ID sistem yang sesuai

// Emoji untuk kartu
const cardEmojis = {
  '2': '2️⃣',
  '3': '3️⃣',
  '4': '4️⃣',
  '5': '5️⃣',
  '6': '6️⃣',
  '7': '7️⃣',
  '8': '8️⃣',
  '9': '9️⃣',
  '10': '🔟',
  'J': '🃏', // Joker
  'Q': '👸', // Queen
  'K': '🤴', // King
  'A': '🃏'  // Ace
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('blackjack')
    .setDescription('Mainkan permainan Blackjack')
    .addIntegerOption(option =>
      option.setName('celes')
        .setDescription('Jumlah celes yang dipertaruhkan')
        .setRequired(true)),

  async execute(interaction) {
    const bet = interaction.options.getInteger('celes');
    const userId = interaction.user.id;

    // Fetch user data
    const user = await User.findOne({ discordId: userId });

    // Verifikasi apakah user punya cukup celes
    if (user.celes < bet) {
      return interaction.reply({ content: 'Celes kamu tidak cukup!', ephemeral: true });
    }

    // Deduct the celes from user's account
    user.celes -= bet;
    await user.save();

    const dealerHand = [];
    const playerHand = [];
    
    // Menarik dua kartu untuk pemain dan dealer
    playerHand.push(drawCard(), drawCard());
    dealerHand.push(drawCard(), drawCard());

    // Hitung total awal
    const playerTotal = calculateTotal(playerHand);
    const dealerTotal = calculateTotal(dealerHand);
    
    // Menyiapkan embed dan tombol
    const gameEmbed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('Permainan Blackjack Dimulai!')
      .setDescription(`Kamu bertaruh **${bet} celes**!\n\n**Kartu kamu:** ${playerHand.map(card => cardEmojis[card]).join(', ')}\nTotal: **${playerTotal}**\n**Kartu dealer:** ${cardEmojis[dealerHand[0]]}, ❓`)
      .setFooter({ text: 'Ketik tombol di bawah untuk bermain!' });

    // Membuat tombol untuk Hit dan Stand
    const hitButton = new ButtonBuilder()
      .setCustomId('hit')
      .setLabel('Hit')
      .setStyle(ButtonStyle.Primary);

    const standButton = new ButtonBuilder()
      .setCustomId('stand')
      .setLabel('Stand')
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(hitButton, standButton);

    await interaction.reply({ embeds: [gameEmbed], components: [row] });

    // Menggunakan kolektor untuk interaksi lebih lanjut
    const filter = i => i.user.id === userId && (i.customId === 'hit' || i.customId === 'stand');
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 30000 }); // 30 detik untuk pilihan

    collector.on('collect', async i => {
      await i.deferUpdate();
      if (i.customId === 'hit') {
        playerHand.push(drawCard()); // Menarik kartu tambahan
        const newPlayerTotal = calculateTotal(playerHand);

        const hitEmbed = new EmbedBuilder()
          .setColor('#FFD700')
          .setTitle('Kamu Menarik Kartu!')
          .setDescription(`Kartu kamu sekarang: ${playerHand.map(card => cardEmojis[card]).join(', ')}\nTotal: **${newPlayerTotal}**`)
          .setFooter({ text: 'Ketik tombol di bawah untuk bermain!' });

        await i.followUp({ embeds: [hitEmbed] });

        // Cek jika pemain bust
        if (newPlayerTotal > 21) {
          collector.stop('bust'); // Hentikan permainan jika bust
        }
      } else if (i.customId === 'stand') {
        collector.stop('stand'); // Hentikan permainan jika pemain memilih stand
      }
    });

    collector.on('end', async (collected, reason) => {
      if (reason === 'bust') {
        await interaction.followUp({ content: `Kamu bust! Total kartu kamu melebihi 21. Kamu kehilangan **${bet} celes**!`, ephemeral: true });
        return;
      } else if (reason === 'stand') {
        // Dealer main setelah pemain
        let dealerTotal = calculateTotal(dealerHand);
        while (dealerTotal < 17) {
          dealerHand.push(drawCard());
          dealerTotal = calculateTotal(dealerHand);
        }

        const finalEmbed = new EmbedBuilder()
          .setColor('#FFD700')
          .setTitle('Permainan Selesai!')
          .setDescription(`**Kartu kamu:** ${playerHand.map(card => cardEmojis[card]).join(', ')} (Total: ${calculateTotal(playerHand)})\n**Kartu dealer:** ${dealerHand.map(card => cardEmojis[card]).join(', ')} (Total: ${dealerTotal})`);

        let resultMessage = '';

        const playerFinalTotal = calculateTotal(playerHand);
        let winnings = 0; // Menyimpan jumlah kemenangan

        if (dealerTotal > 21 || playerFinalTotal > dealerTotal) {
          resultMessage = `Selamat! Kamu menang dan mendapatkan **${bet * 2} celes**! 🎉`;
          winnings = bet * 2; // Menang
          user.celes += winnings; // Tambah kemenangan ke celes
        } else if (playerFinalTotal < dealerTotal) {
          resultMessage = `Sayang sekali, kamu kalah. Kamu kehilangan **${bet} celes**. 😢`;
        } else {
          resultMessage = `Ini seri! Tidak ada yang menang atau kalah.`;
          user.celes += bet; // Kembali taruhan
        }

        await user.save();
        await interaction.followUp({ embeds: [finalEmbed.setDescription(finalEmbed.data.description + '\n' + resultMessage)] });

        // Menampilkan berapa banyak celes yang didapat oleh pemain
        if (winnings > 0) {
          await interaction.followUp({ content: `Kamu mendapatkan **${winnings} celes** dari permainan ini!`, ephemeral: true });
        }

        // Update celes sistem jika pemain menang
        if (resultMessage.includes('menang')) {
          await updateSystemCeles(bet);
        }
      }
    });
  },
};

// Fungsi untuk menggambar kartu
function drawCard() {
  const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']; // Peringkat kartu
  return ranks[Math.floor(Math.random() * ranks.length)]; // Mengambil peringkat kartu acak
}

// Fungsi untuk menghitung total nilai kartu
function calculateTotal(hand) {
  let total = 0;
  let aceCount = 0;

  hand.forEach(card => {
    if (['J', 'Q', 'K'].includes(card)) {
      total += 10; // Kartu bernilai 10
    } else if (card === 'A') {
      total += 11; // Anggap A sebagai 11 untuk sekarang
      aceCount++;
    } else {
      total += parseInt(card); // Kartu bernilai sesuai angkanya
    }
  });

  // Mengurangi 10 untuk setiap A jika total lebih dari 21
  while (total > 21 && aceCount > 0) {
    total -= 10;
    aceCount--;
  }

  return total;
}

// Fungsi untuk memperbarui celes sistem
async function updateSystemCeles(bet) {
  const systemAccount = await User.findOne({ discordId: SystemAccountId });
  if (systemAccount) {
    systemAccount.celes += bet * 0.05; // Ambil 5% dari taruhan
    await systemAccount.save();
  }
}
