// models/currency.js
const { Schema, model } = require('mongoose');

const currencySchema = new Schema({
    discordId: String,
    balance: { type: Number, default: 0 }
});

module.exports = model('Currency', currencySchema);
