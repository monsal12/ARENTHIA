const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const mongoose = require('mongoose');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const User = require('./models/user'); // Pastikan jalur ini sesuai dengan model User
const { createProfileEmbed } = require('./helpers/embed'); // Pastikan jalur ini sesuai
const cron = require('node-cron');

require('dotenv').config(); // Memastikan dotenv di-load

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Menghubungkan ke MongoDB
console.log('MONGO_URI:', process.env.MONGO_URI); // Log untuk debugging
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Terhubung ke MongoDB'))
    .catch((err) => console.error('Gagal terhubung ke MongoDB', err));

// Membaca command dari folder "commands"
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    // Memastikan command memiliki data yang valid
    if (!command.data || !command.data.name) {
        console.error(`Command ${file} tidak memiliki data yang valid.`);
        continue; // Lewati command ini
    }

    client.commands.set(command.data.name, command);
}

// Mendaftar semua commands ke Discord API
const commands = [];
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('Mendaftarkan perintah ke Discord API...');
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands },
        );
        console.log('Perintah berhasil didaftarkan!');
    } catch (error) {
        console.error('Gagal mendaftarkan perintah:', error);
    }
})();

// Event handler untuk interaksi command
client.on('interactionCreate', async interaction => {
    // Menangani perintah
    if (interaction.isCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Terjadi kesalahan saat menjalankan perintah ini.', ephemeral: true });
        }
    }

    // Menangani interaksi tombol
    if (interaction.isButton()) {
        const discordId = interaction.user.id;
        const user = await User.findOne({ discordId }); // Mencari pengguna di database

        // Jika pengguna belum terdaftar
        if (!user) {
            return interaction.reply({ content: 'Anda belum mendaftar karakter! Gunakan /register untuk membuatnya.', ephemeral: true });
        }

        // Jika tombol untuk melihat stats ditekan
        if (interaction.customId === 'view_stats') {
            const embed = createProfileEmbed(user, 'stats', interaction.user.displayAvatarURL()); // Menggunakan avatar Discord pengguna
            await interaction.update({ embeds: [embed], components: interaction.message.components });
        } 
        // Jika tombol untuk melihat inventory ditekan
        else if (interaction.customId === 'view_inventory') {
            const embed = createProfileEmbed(user, 'inventory', interaction.user.displayAvatarURL()); // Menggunakan avatar Discord pengguna
            await interaction.update({ embeds: [embed], components: interaction.message.components });
        }
    }
});

// Scheduler untuk mengurangi hunger dan thirst setiap 3 jam
cron.schedule('0 */3 * * *', async () => {
    const users = await User.find({});
    
    users.forEach(async (user) => {
        user.hunger = Math.max(0, user.hunger - 10); // Kurangi hunger 10%
        user.thirst = Math.max(0, user.thirst - 10); // Kurangi thirst 10%
        await user.save(); // Simpan perubahan
    });
    
    console.log("Hunger dan thirst telah dikurangi untuk semua pengguna");
});

// Login bot ke Discord
client.once('ready', () => {
    console.log(`Bot siap! Login sebagai ${client.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN); // Menggunakan DISCORD_TOKEN
