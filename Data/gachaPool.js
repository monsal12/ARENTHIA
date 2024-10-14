const gachaPool = [
    {
        name: "pedang segede gaban",
        grade: "Common",
        statBoost: {
            strength: 5,
            intelligence: 0,
            ability: 0
    },
    imageUrl: "https://media.discordapp.net/attachments/1256628479768657962/1294967166277255240/IMG_8614.jpg?ex=670cefa7&is=670b9e27&hm=c65d5b52ee2dfaa42ef925ea97e23ca17a5b2972aef13814565bbbba032b2b90&=&format=webp&width=424&height=585",
    rate: 0.6
    },
    {
        name: "pedang aga gedean dikit",
        grade: "Common",
        statBoost: {
            strength: 4,
            intelligence: 1,
            ability: 0
        },
        imageUrl: "https://media.discordapp.net/attachments/1256628479768657962/1294967175618232381/IMG_8615.jpg?ex=670ee9e9&is=670d9869&hm=ac841055699925e0fc66792651d8e8a9bffb934e6ce1f1aa9c8dbf35a8eada69&=&format=webp&width=585&height=585",
        rate: 0.6
    },
    {
        name: "pisau jaman purba",
        grade: "Common",
        statBoost: {
            strength: 3,
            intelligence: 0,
            ability: 2
    },
        imageUrl: "https://media.discordapp.net/attachments/1256628479768657962/1294967185315467294/IMG_8616.jpg?ex=670cefac&is=670b9e2c&hm=b8dd1ae2494e0ca5f2f626c75341f2bb74efade69275af4c35e2f5546add3372&=&format=webp&width=585&height=585",
        rate: 0.6
    },
    {
        name: "golok jaman batu",
        grade: "Common",
        statBoost: {
            strength: 2,
            intelligence: 1,
            ability: 2
    },
        imageUrl: "https://media.discordapp.net/attachments/1256628479768657962/1294967197717889034/IMG_8617.jpg?ex=670cefaf&is=670b9e2f&hm=004f923ef98f6989e8278daf9cdf59b29de37f6fba52915600cd941620727f3a&=&format=webp&width=439&height=585",
        rate: 0.6
    },
    { 
        name: "Epic Axe", 
        grade: "Epic", 
        statBoost: { 
            strength: 15, 
            intelligence: 0, 
            ability: 0 
        }, 
        imageUrl: "https://media.discordapp.net/attachments/1294275510473588806/1294275637862989876/image_acgryVsv_1728649662908_raw.jpg?ex=670a6b9e&is=67091a1e&hm=2476e596c02116b47154f595120e7b81f5545018c2a9e0d8e28a789e3b456456&=&format=webp&width=569&height=569", 
        rate: 0.4
    },
    { 
        name: "Legendary Staff", 
        grade: "Legendary", 
        statBoost: { 
            strength: 0, 
            intelligence: 20, 
            ability: 0 
        }, 
        imageUrl: "https://media.discordapp.net/attachments/1294275510473588806/1294275685560356874/IMG_8557.jpg?ex=670a6ba9&is=67091a29&hm=de6e1550b90a543b9a440b28b3555632eec11cad99b97a5a0ba6be0091dc0215&=&format=webp&width=320&height=569", 
        rate: 0.2
    },
]

// Helper function to pull a random weapon based on rates
function pullRandomWeapon() {
    const roll = Math.random();
    let cumulativeRate = 0;

    for (const weapon of gachaPool) {
        cumulativeRate += weapon.rate;
        if (roll < cumulativeRate) {
            return weapon;
        }
    }
}

module.exports = { pullRandomWeapon };
