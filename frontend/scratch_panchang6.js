const { getDailyPanchang } = require('panchang-ts');

const dt = new Date(2026, 7, 8, 12, 0, 0); 
const loc = { latitude: 22.7196, longitude: 75.8577 }; 
const options = { timezone: 330 }; 

const p = getDailyPanchang(dt, loc, options);

const sr = new Date(p.sunrise);
const ss = new Date(p.sunset);

console.log("Sunrise:", sr.toLocaleTimeString('en-IN', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit', hour12: false }));
console.log("Sunset:", ss.toLocaleTimeString('en-IN', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit', hour12: false }));

