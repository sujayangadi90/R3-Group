import express from 'express';
import Property from '../models/Property.js';
import Enquiry from '../models/Enquiry.js';
import { verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard', verifyAdmin, async (req, res) => {
  try {
    const [
      totalProperties,
      featuredProperties,
      readyProperties,
      underConstructionProperties,
      totalEnquiries,
      newEnquiries,
      siteVisitEnquiries,
      sellSubmissions,
      contactEnquiries,
      recentEnquiries,
      recentProperties,
    ] = await Promise.all([
      Property.countDocuments(),
      Property.countDocuments({ featured: true }),
      Property.countDocuments({ status: 'Ready to Move' }),
      Property.countDocuments({ status: 'Under Construction' }),
      Enquiry.countDocuments(),
      Enquiry.countDocuments({ status: 'New' }),
      Enquiry.countDocuments({ type: 'site_visit' }),
      Enquiry.countDocuments({ type: 'sell_property' }),
      Enquiry.countDocuments({ type: 'contact' }),
      Enquiry.find().sort({ createdAt: -1 }).limit(5).populate('propertyId', 'title slug'),
      Property.find().sort({ createdAt: -1 }).limit(5),
    ]);

    res.json({
      success: true,
      data: {
        totalProperties,
        featuredProperties,
        readyProperties,
        underConstructionProperties,
        totalEnquiries,
        newEnquiries,
        breakdown: {
          siteVisits: siteVisitEnquiries,
          sellSubmissions,
          contactEnquiries,
        },
        recentEnquiries,
        recentProperties,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
