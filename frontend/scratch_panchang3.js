const { getDailyPanchang } = require('panchang-ts');

const dt = new Date('2026-07-09T00:00:00Z');
const loc = { latitude: 28.6139, longitude: 77.2090 };
const options = { timezone: 330 }; // IST is 330 minutes

const result = getDailyPanchang(dt, loc, options);
console.log(JSON.stringify(result, null, 2));
