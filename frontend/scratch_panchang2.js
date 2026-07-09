const { getDailyPanchang } = require('panchang-ts');
// Date object
const dt = new Date('2026-07-09T00:00:00Z');
// Coordinates for Delhi
const lat = 28.6139;
const lon = 77.2090;
const tz = 5.5;

console.log(JSON.stringify(getDailyPanchang(dt, lat, lon, tz), null, 2));
