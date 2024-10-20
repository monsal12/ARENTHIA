const gachaPoolAksesoris = [
    { 
        name: "Moonlight Pendant", 
        grade: "Common", 
        statBoost: { 
            strength: 2, 
            intelligence: 3, 
            ability: 1 
        }, 
        imageUrl: "https://media.discordapp.net/attachments/1256628479768657962/1297552882647826483/IMG_8804.jpg?ex=671657ca&is=6715064a&hm=004efb8202676b80ac1976d64443daa186e255c99ccebfe46ae2252f47eb4416&=&format=webp&width=569&height=569", // Ganti dengan URL gambar yang sesuai
        rate: 0.6 
    },
    { 
        name: "Sapphire Ring", 
        grade: "Rare", 
        statBoost: { 
            strength: 0, 
            intelligence: 6, 
            ability: 4 
        }, 
        imageUrl: "https://media.discordapp.net/attachments/1256628479768657962/1297552882907877376/IMG_8805.jpg?ex=671657ca&is=6715064a&hm=d0e3eaf4ad790a9e88b4ebce8e456142405d4eaa194c6f5d7b416299a107d938&=&format=webp&width=569&height=569", 
        rate: 0.3 
    },
    { 
        name: "Golden Crown", 
        grade: "Epic", 
        statBoost: { 
            strength: 5, 
            intelligence: 8, 
            ability: 6 
        }, 
        imageUrl: "https://media.discordapp.net/attachments/1256628479768657962/1297552883130044436/IMG_8806.jpg?ex=671657ca&is=6715064a&hm=163db20002b6e16d4cea61aad9db1bd043a3170c230fe01e958715db183d862b&=&format=webp&width=427&height=569", 
        rate: 0.1 
    }
];

// Helper function to pull a random accessory based on rates
function pullRandomAksesoris() {
    const roll = Math.random();
    let cumulativeRate = 0;

    for (const aksesoris of gachaPoolAksesoris) {
        cumulativeRate += aksesoris.rate;
        if (roll < cumulativeRate) {
            return aksesoris;
        }
    }
}

module.exports = { pullRandomAksesoris }; // Pastikan diekspor
