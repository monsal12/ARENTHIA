const { SlashCommandBuilder } = require('@discordjs/builders');
const crypto = require('crypto');
const Pet = require('../models/pet');
const InventoryPet = require('../models/InventoryPet');

// Role ID yang dapat mengakses perintah ini
const roleId = '1246365106846044262';  // Ganti dengan Role ID yang diinginkan

module.exports = {
  data: new SlashCommandBuilder()
    .setName('createpet')
    .setDescription('Create a new pet and add it to your inventory')
    .addStringOption(option =>
      option.setName('name')
        .setDescription('The name of the pet')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('species')
        .setDescription('The species of the pet')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('image')
        .setDescription('URL of the pet image')
        .setRequired(false))
    .addIntegerOption(option =>
      option.setName('health')
        .setDescription('Bonus health for the pet')
        .setRequired(true)
        .setMinValue(0))
    .addIntegerOption(option =>
      option.setName('mana')
        .setDescription('Bonus mana for the pet')
        .setRequired(true)
        .setMinValue(0))
    .addIntegerOption(option =>
      option.setName('stamina')
        .setDescription('Bonus stamina for the pet')
        .setRequired(true)
        .setMinValue(0)),

  async execute(interaction) {
    const { user, options } = interaction;
    const member = await interaction.guild.members.fetch(user.id);

    // Check if user has the required role
    if (!member.roles.cache.has(roleId)) {
      return interaction.reply({
        content: 'You do not have the permission to use this command.',
        ephemeral: true
      });
    }

    // Get pet details from the options
    const petName = options.getString('name');
    const petSpecies = options.getString('species');
    const petImage = options.getString('image') || 'default-image-url';
    const petHealth = options.getInteger('health');
    const petMana = options.getInteger('mana');
    const petStamina = options.getInteger('stamina');

    try {
      // Create pet
      const newPet = new Pet({
        name: petName,
        species: petSpecies,
        image: petImage,
        owner: user.id,
        bonusStats: {
          health: petHealth,
          mana: petMana,
          stamina: petStamina
        }
      });

      // Generate unique code for the pet
      newPet.uniqueCode = crypto.randomBytes(6).toString('hex');
      await newPet.save();

      // Add pet to user's inventory
      let inventory = await InventoryPet.findOne({ user: user.id });
      if (!inventory) {
        inventory = new InventoryPet({
          user: user.id,
          pets: [{ pet: newPet._id, uniqueCode: newPet.uniqueCode }]
        });
        await inventory.save();
      } else {
        inventory.pets.push({ pet: newPet._id, uniqueCode: newPet.uniqueCode });
        await inventory.save();
      }

      // Send success message
      interaction.reply({
        content: `Successfully created pet **${petName}**! It has been added to your inventory. Use /equip to equip the pet and gain its stat bonuses.`,
        ephemeral: true
      });

    } catch (error) {
      console.error(error);
      interaction.reply({
        content: 'There was an error creating the pet. Please try again later.',
        ephemeral: true
      });
    }
  }
};
