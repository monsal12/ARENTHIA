const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../models/user');
const Inventory = require('../models/inventory');
const Weapon = require('../models/weapon');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('equip')
        .setDescription('Equip a weapon')
        .addStringOption(option =>
            option.setName('weapon_id')
                .setDescription('The unique code of the weapon to equip')
                .setRequired(true)),
    async execute(interaction) {
        const userId = interaction.user.id;
        const weaponCode = interaction.options.getString('weapon_id');

        try {
            // Cari user dari User model
            const user = await User.findOne({ discordId: userId });
            if (!user) {
                return interaction.reply('⚠️ User not found.');
            }

            // Cari inventory pengguna dari Inventory model
            const inventory = await Inventory.findOne({ userId: userId }).populate('weapons');
            if (!inventory) {
                return interaction.reply('⚠️ You don\'t have an inventory.');
            }

            // Cari senjata berdasarkan kode unik
            const weapon = await Weapon.findOne({ uniqueCode: weaponCode });
            if (!weapon) {
                return interaction.reply('⚠️ Weapon not found.');
            }

            // Periksa apakah senjata ada di inventory pengguna
            const weaponInInventory = inventory.weapons.some(w => String(w._id) === String(weapon._id));
            if (!weaponInInventory) {
                return interaction.reply('⚠️ You do not own this weapon.');
            }

            // Jika pengguna sudah memakai senjata lain, hapus stats senjata yang sekarang
            if (user.equippedWeapon) {
                const currentlyEquippedWeapon = await Weapon.findById(user.equippedWeapon);
                if (currentlyEquippedWeapon) {
                    user.stats.strength -= currentlyEquippedWeapon.strength;
                    user.stats.intelligence -= currentlyEquippedWeapon.intelligence;
                    user.stats.ability -= currentlyEquippedWeapon.ability;
                }
            }

            // Pasang senjata baru dan tambahkan stats senjata baru
            user.equippedWeapon = weapon._id;
            user.stats.strength += weapon.strength;
            user.stats.intelligence += weapon.intelligence;
            user.stats.ability += weapon.ability;

            // Simpan perubahan di User model
            await user.save();

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle(`✅ Successfully equipped **${weapon.name}**!`)
                .setDescription(`Your stats have been updated:\n- Strength: ${user.stats.strength}\n- Intelligence: ${user.stats.intelligence}\n- Ability: ${user.stats.ability}`);

            return interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error equipping weapon:', error);
            return interaction.reply('⚠️ An error occurred while equipping the weapon.');
        }
    }
};
