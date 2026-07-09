const { getFestivalsInRange } = require('panchang-ts');

const festivals = getFestivalsInRange(new Date(2026, 0, 1), new Date(2026, 11, 31), { latitude: 22.7196, longitude: 75.8577 }, { timezone: 330 });
console.log(JSON.stringify(festivals.slice(0, 3), null, 2));

