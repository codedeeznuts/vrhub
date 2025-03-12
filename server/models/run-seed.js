const seedData = require('./seed-data');

console.log('Starting database seeding process...');

seedData()
  .then(() => {
    console.log('Database seeding completed successfully');
    process.exit(0);
  })
  .catch(err => {
    console.error('Database seeding failed:', err);
    process.exit(1);
  }); 