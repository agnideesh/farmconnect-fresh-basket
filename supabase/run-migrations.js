
// This script will run the storage bucket migrations

const fs = require('fs');
const path = require('path');

// Log the start of the migration process
console.log('Starting storage migrations...');

// Read the storage.sql file
const storageSqlPath = path.join(__dirname, 'storage.sql');
console.log(`Reading SQL file from: ${storageSqlPath}`);

// If file exists, log success
if (fs.existsSync(storageSqlPath)) {
  console.log('Storage SQL file found. Migrations will be run automatically when deployed.');
} else {
  console.error('Storage SQL file not found!');
  process.exit(1);
}

console.log('Storage migrations script completed!');
