const { getFestivalsInRange } = require('panchang-ts');

const festivals = getFestivalsInRange(new Date(2026, 0, 1), new Date(2026, 11, 31), { latitude: 22.7196, longitude: 75.8577 }, { timezone: 330 });
const rakshaBandhan = festivals.find(f => f.festival.name.toLowerCase().includes('raksha'));
console.log("Raksha Bandhan:", rakshaBandhan);

