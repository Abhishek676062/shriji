const { getFestivalsInRange } = require('panchang-ts');
const festivals = getFestivalsInRange(new Date(2026, 0, 1), new Date(2026, 11, 31), { latitude: 22.7196, longitude: 75.8577 }, { timezone: 330 });
const major = festivals.filter(f => f.festival.type === 'major');
console.log(major.map(f => `${f.date.toISOString().split('T')[0]} - ${f.festival.name}`).join('\n'));
