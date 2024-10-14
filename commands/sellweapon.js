const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../models/user');
const Weapon = require('../models/weapon');
const Inventory = require('../models/inventory');

const systemAccountId = '994553740864536596'; // Discord ID akun sistem

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sellweapon')
        .setDescription('Menjual senjata dan mendapatkan celes!')
        .addStringOption(option =>
            option.setName('weapon_id')
                .setDescription('ID senjata yang ingin dijual')
                .setRequired(true)),
    async execute(interaction) {
        const userId = interaction.user.id; // ID pengguna Discord
        const weaponId = interaction.options.getString('weapon_id'); // Mendapatkan ID senjata yang ingin dijual

        const user = await User.findOne({ discordId: userId }); // Mencari pengguna berdasarkan Discord ID
        if (!user) {
            return interaction.reply('⚠️ Pengguna tidak ditemukan.');
        }

        // Ubah pencarian senjata berdasarkan uniqueCode
        const weapon = await Weapon.findOne({ uniqueCode: weaponId }); // Mencari senjata berdasarkan uniqueCode
        if (!weapon) {
            return interaction.reply('⚠️ Senjata tidak ditemukan.');
        }

        // Mencari inventory pengguna
        const inventory = await Inventory.findOne({ userId: userId });
        if (!inventory || !inventory.weapons.includes(weapon._id.toString())) {
            return interaction.reply('⚠️ Kamu tidak memiliki senjata ini dalam inventori.');
        }

        try {
            await interaction.deferReply(); // Tunda balasan

            // Hapus senjata dari database
            await Weapon.deleteOne({ uniqueCode: weaponId }); // Menghapus berdasarkan uniqueCode

            // Tambahkan celes ke akun pengguna
            user.celes += 300; // Tambahkan 300 celes untuk pengguna yang menjual senjata
            await user.save();

            // Kurangi celes dari akun sistem
            const systemAccount = await User.findOne({ discordId: systemAccountId }); // Mencari akun sistem berdasarkan Discord ID
            if (!systemAccount) {
                return interaction.editReply('⚠️ Akun sistem tidak ditemukan.');
            }

            systemAccount.celes -= 300; // Kurangi celes untuk akun sistem
            await systemAccount.save();

            // Kurangi senjata dari inventori pengguna
            inventory.weapons = inventory.weapons.filter(id => id.toString() !== weapon._id.toString());
            await inventory.save();

            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle(`💰 Senjata Terjual!`)
                .setDescription(`Kamu berhasil menjual senjata **${weapon.name}** dan mendapatkan 300 celes!`)
                .addFields(
                    { name: 'Total Celes Kamu', value: `${user.celes}`, inline: true },
                    { name: 'Senjata yang Dijual', value: `${weapon.name}`, inline: true }
                );

            return interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Terjadi kesalahan:', error);
            return interaction.editReply('⚠️ Terjadi kesalahan saat menjalankan perintah ini.');
        }
    }
};
