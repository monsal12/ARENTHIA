const { SlashCommandBuilder } = require('discord.js');
const User = require('../models/user');

const elements = {
    flame: { emoji: '<:flame_custom:1293529213734883371>', name: 'Flame', roleId: '1294194965617840169' },
    volt: { emoji: '<:volt_custom:1293529328285384768>', name: 'Volt', roleId: '1294195011646394378' },
    wave: { emoji: '<:wave_custom:1293529607403733035>', name: 'Wave', roleId: '1294195062733017149' },
    frost: { emoji: '<:frost_custom:1293529396216598528>', name: 'Frost', roleId: '1294195206597378120' },
    gale: { emoji: '<:gale_custom:1293529685673775224>', name: 'Gale', roleId: '1294195206597378120' },
    bloom: { emoji: '<:bloom_custom:1293529474674982935>', name: 'Bloom', roleId: '1294195324239216692' },
    terra: { emoji: '<:terra_custom:1293529758298144789>', name: 'Terra', roleId: '1294195433303838800' },
    alloy: { emoji: '<:alloy_custom:1293529998879227990>', name: 'Alloy', roleId: '1294195476819611648' },
    light: { emoji: '<:light_custom:1293529911977578579>', name: 'Light', roleId: '1294195531039375381' },
    venom: { emoji: '<:venom_custom:1293529825872449587>', name: 'Venom', roleId: '1294195578149802026' },
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('register')
        .setDescription('Daftarkan karakter dan pilih elemen')
        .addStringOption(option =>
            option.setName('element')
                .setDescription('Pilih elemen untuk karaktermu')
                .setRequired(true)
                .addChoices(
                    { name: 'Flame', value: 'flame' },
                    { name: 'Volt', value: 'volt' },
                    { name: 'Wave', value: 'wave' },
                    { name: 'Frost', value: 'frost' },
                    { name: 'Gale', value: 'gale' },
                    { name: 'Bloom', value: 'bloom' },
                    { name: 'Terra', value: 'terra' },
                    { name: 'Alloy', value: 'alloy' },
                    { name: 'Light', value: 'light' },
                    { name: 'Venom', value: 'venom' }
                )),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });  // Defer the reply to avoid timeout issues
        const selectedElement = interaction.options.getString('element');
        const targetUser = interaction.user;
        const guild = interaction.guild;  
        const member = await guild.members.fetch(targetUser.id);

        try {
            let user = await User.findOne({ discordId: targetUser.id });
            
            if (!user) {
                user = new User({
                    discordId: targetUser.id,
                    username: targetUser.username,
                    level: 1,
                    experience: 0,
                    spyr: 5,  
                    element: selectedElement, 
                    health: { current: 100, max: 100 },
                    stamina: { current: 100, max: 100 },
                    mana: { current: 100, max: 100 },
                    stats: { strength: 10, intelligence: 10, ability: 10 },
                    celes: 100, 
                    exploreCooldown: Date.now(), 
                });

                // Mengurangi celes dari akun sistem
                const feeUser = await User.findOne({ discordId: '994553740864536596' }); // ID akun sistem
                if (feeUser) {
                    feeUser.celes -= 100; // Mengurangi 100 celes dari akun sistem
                    await feeUser.save();
                }

                await user.save();
            } else {
                return interaction.editReply({ content: 'Kamu sudah terdaftar!' });
            }

            const elementData = elements[selectedElement];
            const emoji = elementData.emoji;
            const elementName = elementData.name;
            const roleId = elementData.roleId;

            const role = guild.roles.cache.get(roleId);
            if (role) {
                // Check if the user already has the role
                if (member.roles.cache.has(roleId)) {
                    return interaction.editReply({ content: `Kamu sudah memiliki peran **${elementName}**!` });
                }

                await member.roles.add(role);
                return interaction.editReply({ 
                    content: `Selamat ${targetUser.username}, kamu telah memilih elemen **${emoji} ${elementName}** dan diberikan role yang sesuai!`
                });
            } else {
                return interaction.editReply({ content: `Peran dengan ID ${roleId} tidak ditemukan di server.` });
            }

        } catch (error) {
            console.error(error);
            return interaction.editReply({ content: '❌ Terjadi kesalahan saat registrasi. Pastikan bot memiliki izin untuk mengelola peran.' });
        }
    }
};
