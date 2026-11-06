import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Property from '../models/Property.js';
import Enquiry from '../models/Enquiry.js';
import User from '../models/User.js';
import { initialProperties, initialEnquiries } from './seedData.js';

dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/r3_group_real_estate';

export const seedDatabase = async (force = false) => {
  try {
    // 1. Ensure default Admin User exists
    const defaultUsername = (process.env.ADMIN_USERNAME || 'admin').toLowerCase();
    const defaultPassword = process.env.ADMIN_PASSWORD || 'ramesh';

    const existingAdmin = await User.findOne({ username: defaultUsername });
    if (!existingAdmin) {
      await User.create({
        username: defaultUsername,
        password: defaultPassword,
        name: 'R3 Group Administrator',
        email: 'admin@r3group.in',
        role: 'Super Admin',
        status: 'Active',
        isPrimaryAdmin: true,
      });
      console.log(`[Database Seed] Default admin user '${defaultUsername}' initialized.`);
    }

    // 2. Properties
    const propertyCount = await Property.countDocuments();
    if (propertyCount > 0 && !force) {
      console.log(`[Database Seed] Database already contains ${propertyCount} properties.`);
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
      await seedDatabase(false);
      await mongoose.disconnect();
      console.log('[MongoDB] Disconnected after seeding.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[MongoDB] Connection error:', err);
      process.exit(1);
    });
}
