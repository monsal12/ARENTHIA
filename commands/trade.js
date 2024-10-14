const { SlashCommandBuilder } = require('discord.js');
const Inventory = require('../models/inventory');
const Weapon = require('../models/weapon');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('trade')
        .setDescription('Trade weapon with another user')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('User to trade with')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('weapon_id')
                .setDescription('Unique code of the weapon to trade')
                .setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply(); // Menunda respons

        const targetUser = interaction.options.getUser('target');
        const weaponCode = interaction.options.getString('weapon_id');
        const userId = interaction.user.id;

        try {
            const weapon = await Weapon.findOne({ uniqueCode: weaponCode });
            if (!weapon) {
                return await interaction.editReply('⚠️ Senjata tidak ditemukan.');
            }

            const userInventory = await Inventory.findOne({ userId });
            if (!userInventory) {
                return await interaction.editReply('⚠️ Kamu tidak memiliki inventory.');
            }

            const weaponIndex = userInventory.weapons.indexOf(weapon._id);
            if (weaponIndex === -1) {
                return await interaction.editReply('⚠️ Kamu tidak memiliki senjata ini di inventory.');
            }

            const targetInventory = await Inventory.findOne({ userId: targetUser.id });
            if (!targetInventory) {
                return await interaction.editReply('⚠️ Target tidak memiliki inventory.');
            }

            // Check if the target user is in the same server and can receive DMs
            const targetMember = await interaction.guild.members.fetch(targetUser.id);
            if (!targetMember) {
                return await interaction.editReply('⚠️ Target tidak dapat menerima permintaan trade saat ini.');
            }

            // Attempt to send DM to the target user
            try {
                await targetUser.send(`📦 Kamu menerima permintaan trade dari ${interaction.user.username}.\n\n**Senjata:** ${weapon.name}\n**Grade:** ${weapon.grade}\n**Code:** ${weapon.uniqueCode}\n\nGunakan command \`/accept ${interaction.user.id} ${weapon.uniqueCode}\` untuk menerima trade.`);
            } catch (error) {
                return await interaction.editReply('⚠️ Target tidak dapat dihubungi melalui DM.');
            }

            return await interaction.editReply(`✅ Permintaan trade telah dikirim ke ${targetUser.username}.`);
        } catch (error) {
            console.error('Terjadi kesalahan:', error);
            await interaction.editReply('⚠️ Terjadi kesalahan saat menjalankan perintah ini.');
        }
    }
};
