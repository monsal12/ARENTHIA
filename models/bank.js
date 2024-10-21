const mongoose = require('mongoose');

const bankSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    managerId: { type: String, required: true },
    celes: { type: Number, default: 0 }, // To store the total celes in the bank
    deposits: [{ userId: String, amount: Number }] // To track deposits by user
});

module.exports = mongoose.model('Bank', bankSchema);
