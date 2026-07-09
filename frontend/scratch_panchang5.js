const { getDailyPanchang } = require('panchang-ts');

// Create a date at local noon
const dt = new Date(2026, 7, 8, 12, 0, 0); // Month is 0-indexed, so 7 is August.
const loc = { latitude: 22.7196, longitude: 75.8577 }; // Indore
const options = { timezone: 330 }; 

const result = getDailyPanchang(dt, loc, options);
console.log("Sunrise UTC string:", result.sunrise);

const sr = new Date(result.sunrise);
console.log("Sunrise hours UTC:", sr.getUTCHours(), sr.getUTCMinutes());
console.log("Sunrise hours Local:", sr.getHours(), sr.getMinutes());

