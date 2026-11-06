import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Property from '../models/Property.js';
import Enquiry from '../models/Enquiry.js';
import { initialProperties, initialEnquiries } from './seedData.js';

dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/r3_group_real_estate';

export const seedDatabase = async (force = false) => {
  try {
    const propertyCount = await Property.countDocuments();
    if (propertyCount > 0 && !force) {
      console.log(`[Database Seed] Database already contains ${propertyCount} properties. Skipping seed.`);
      return;
    }

    console.log('[Database Seed] Seeding initial properties and enquiries...');
    if (force) {
      await Property.deleteMany({});
      await Enquiry.deleteMany({});
    }

    const insertedProperties = await Property.insertMany(initialProperties);
    console.log(`[Database Seed] Successfully seeded ${insertedProperties.length} luxury properties!`);

    // Link first enquiry to first property
    if (insertedProperties.length > 0) {
      initialEnquiries[0].propertyId = insertedProperties[0]._id;
    }

    const insertedEnquiries = await Enquiry.insertMany(initialEnquiries);
    console.log(`[Database Seed] Successfully seeded ${insertedEnquiries.length} sample enquiries!`);
  } catch (error) {
    console.error('[Database Seed] Error during seeding:', error.message);
  }
};

// If run directly from CLI
if (process.argv[1]?.endsWith('seed.js')) {
  mongoose
    .connect(uri)
    .then(async () => {
      console.log(`[MongoDB] Connected for direct seeding.`);
      await seedDatabase(true);
      await mongoose.disconnect();
      console.log('[MongoDB] Disconnected after seeding.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[MongoDB] Connection error:', err);
      process.exit(1);
    });
}
