const fs = require('fs');
let content = fs.readFileSync('src/i18n/en.ts', 'utf-8');

// nutrition
content = content.replace(
  'articles: {',
  'articles: {\n      nutrition: {\n        title: "Nutrition for Joint Health",\n        summary: "Use anti-inflammatory spices like turmeric with black pepper, ginger, and garlic in daily meals.",\n        points: [\n          "Consume calcium-rich foods like milk, curd, or dark leafy greens.",\n          "Include nuts, seeds, or fatty fish for Omega-3 fatty acids.",\n          "Avoid excessive sugar and highly processed foods.",\n          "Stay hydrated with water throughout the day."\n        ]\n      },'
);

fs.writeFileSync('src/i18n/en.ts', content);
console.log('nutrition added successfully');
