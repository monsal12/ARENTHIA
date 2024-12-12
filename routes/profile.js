const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/user'); // Model User

const app = express();
const PORT = 3000; // Port untuk API

// Endpoint untuk mengambil data user
app.get('/api/users/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await User.findOne({ discordId: userId }); // Ambil berdasarkan ID Discord

        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json(user);
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Jalankan server API
app.listen(PORT, () => {
    console.log(`API is running on http://localhost:${PORT}`);
});
