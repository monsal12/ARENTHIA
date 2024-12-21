const gachaPool = [


            { 
                "name": "Ghostly Rapier", 
                "grade": "rare", 
                "statBoost": { 
                    "strength": 2, 
                    "intelligence": 4, 
                    "ability": 0 
                }, 
                "imageUrl": "https://media.discordapp.net/attachments/1302888987987283998/1302889284763648010/IMG_9067.jpg?ex=6729c1b4&is=67287034&hm=3e621f3110c000ca21af317cffbf24fa12c95b77448e3a74b177735ab7df8560&=&format=webp&width=498&height=498", 
                "rate": 0.5 
            }

    
];
const totalRate = gachaPool.reduce((sum, weapon) => sum + weapon.rate, 0);
gachaPool.forEach(weapon => {
    weapon.normalizedRate = weapon.rate / totalRate;
});

// Helper function to pull a random weapon based on normalized rates
function pullRandomWeapon() {
    const roll = Math.random();
    let cumulativeRate = 0;

    for (const weapon of gachaPool) {
        cumulativeRate += weapon.normalizedRate;
        if (roll < cumulativeRate) {
            console.log(`You pulled: ${weapon.name} (${weapon.grade})`);
            return weapon;
        }
    }

    throw new Error("No weapon was selected.");
}

module.exports = { pullRandomWeapon };
