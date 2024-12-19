const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js');
const MaterialInventory = require('../models/MaterialInventory'); // Model inventory material

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addmaterial')
    .setDescription('Menambah material ke inventory')
    .addStringOption(option =>
      option.setName('material')
        .setDescription('Nama material yang ingin ditambahkan')
        .setRequired(true)
        .addChoices(
          { name: 'Batu Olahan', value: 'Batu Olahan' },
          { name: 'Batangan Logam', value: 'Batangan Logam' },
          { name: 'Ikan Olahan', value: 'Ikan Olahan' },
          { name: 'Kulit Jadi', value: 'Kulit Jadi' },
          { name: 'Papan', value: 'Papan' },
          { name: 'Kain', value: 'Kain' }
        )
    )
    .addStringOption(option =>
      option.setName('tier')
        .setDescription('Tier material (T1 - T8)')
        .setRequired(true)
        .addChoices(
          { name: 'T1', value: 'T1' },
          { name: 'T2', value: 'T2' },
          { name: 'T3', value: 'T3' },
          { name: 'T4', value: 'T4' },
          { name: 'T5', value: 'T5' },
          { name: 'T6', value: 'T6' },
          { name: 'T7', value: 'T7' },
          { name: 'T8', value: 'T8' }
        )
    )
    .addIntegerOption(option =>
      option.setName('quantity')
        .setDescription('Jumlah material yang ingin ditambahkan')
        .setRequired(true)
    ),

  async execute(interaction) {
    const materialName = interaction.options.getString('material');
    const tier = interaction.options.getString('tier');
    const quantity = interaction.options.getInteger('quantity');

    const userId = interaction.user.id;
    const roleId = '1246365106846044262'; // ID role yang diizinkan menambah material

    // Cek apakah pengguna memiliki role yang sesuai
    if (!interaction.member.roles.cache.has(roleId)) {
      return interaction.reply({ content: 'Anda tidak memiliki izin untuk menambah material.', ephemeral: true });
    }

    // Cek apakah pengguna sudah memiliki inventory
    let userInventory = await MaterialInventory.findOne({ userId });

    if (!userInventory) {
      // Jika inventory belum ada, buat baru
      userInventory = new MaterialInventory({
        userId,
        materials: []
      });
    }

    // Cari material dalam inventory pengguna
    const existingMaterial = userInventory.materials.find(m => m.materialName === materialName && m.tier === tier);

    if (existingMaterial) {
      // Jika material sudah ada, tambahkan jumlahnya
      existingMaterial.quantity += quantity;
    } else {
      // Jika material belum ada, tambahkan material baru
      userInventory.materials.push({
        materialName,
        tier,
        quantity
      });
    }

    try {
      // Simpan perubahan inventory
      await userInventory.save();
      return interaction.reply({ content: `Material ${materialName} tier ${tier} sebanyak ${quantity} berhasil ditambahkan!`, ephemeral: true });
    } catch (error) {
      console.error(error);
      return interaction.reply({ content: 'Terjadi kesalahan saat menambahkan material ke inventory.', ephemeral: true });
    }
  },
};
