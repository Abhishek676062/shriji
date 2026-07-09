const { getDailyPanchang } = require('panchang-ts');

// Check Aug 28, 2026
const dt = new Date(2026, 7, 28, 12, 0, 0); 
const loc = { latitude: 22.7196, longitude: 75.8577 }; 
const options = { timezone: 330 }; 

const p = getDailyPanchang(dt, loc, options);
console.log(JSON.stringify(p.festivals, null, 2));

