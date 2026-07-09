const { getDailyPanchang } = require('panchang-ts');

const dt = new Date('2026-08-08T00:00:00Z');
const loc = { latitude: 22.7196, longitude: 75.8577 }; // Indore
const options = { timezone: 330 }; // IST is 330 minutes

const result = getDailyPanchang(dt, loc, options);
console.log("Sunrise:", result.sunrise);
console.log("Sunset:", result.sunset);

const sr = new Date(result.sunrise);
console.log("Local time (Node default):", sr.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false }));
