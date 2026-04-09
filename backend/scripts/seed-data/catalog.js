const categories = [
  { name: 'Laptops', slug: 'laptops', icon: 'laptop', description: 'Performance laptops, ultrabooks, and creator machines.', displayOrder: 1 },
  { name: 'Smartphones', slug: 'smartphones', icon: 'phone', description: 'Flagship phones, value picks, and premium Android devices.', displayOrder: 2 },
  { name: 'Audio', slug: 'audio', icon: 'headphones', description: 'Headphones, speakers, and wireless audio for work and play.', displayOrder: 3 },
  { name: 'Gaming', slug: 'gaming', icon: 'controller', description: 'Consoles and gear for immersive gaming setups.', displayOrder: 4 },
  { name: 'Accessories', slug: 'accessories', icon: 'bolt', description: 'Chargers, storage, peripherals, and desk essentials.', displayOrder: 5 },
  { name: 'Smart Home', slug: 'smart-home', icon: 'home', description: 'Connected displays and smart speakers for modern homes.', displayOrder: 6 },
  { name: 'Wearables', slug: 'wearables', icon: 'watch', description: 'Smartwatches and wearables built for daily use.', displayOrder: 7 },
];

const { productsPart1 } = require('./catalog-part1');
const { productsPart2 } = require('./catalog-part2');

module.exports = {
  categories,
  products: [...productsPart1, ...productsPart2],
};
