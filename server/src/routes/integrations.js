import express from 'express';
import Enquiry from '../models/Enquiry.js';
import Property from '../models/Property.js';
import User from '../models/User.js';
import LeadSourceMaster from '../models/LeadSourceMaster.js';

const router = express.Router();

/**
 * Ensures the "Magicbricks" lead source exists in LeadSourceMaster
 * so it appears cleanly in CRM filters and dropdowns.
 */
const ensureMagicbricksLeadSource = async () => {
  const existing = await LeadSourceMaster.findOne({
    name: { $regex: '^Magicbricks$', $options: 'i' },
  });
  if (!existing) {
    await LeadSourceMaster.create({
      name: 'Magicbricks',
      category: 'Property Portals',
      isActive: true,
      sortOrder: 99,
    });
  }
};

/**
 * Finds the next active Sales Rep assigned to a property using round-robin.
 */
const getRoundRobinSalesRep = async (propertyId) => {
  const salesReps = await User.find({
    role: 'Sales Rep',
    status: 'Active',
    assignedProperties: propertyId,
  })
    .select('_id name')
    .sort({ _id: 1 });

  if (salesReps.length === 0) {
    return { assignedTo: null, assignedToName: '' };
  }

  let nextIndex = 0;
  if (salesReps.length > 1) {
    const repIds = salesReps.map((r) => r._id);
    const lastEnquiry = await Enquiry.findOne({
      propertyId,
      assignedTo: { $in: repIds },
    })
      .select('assignedTo')
      .sort({ createdAt: -1 });

    if (lastEnquiry && lastEnquiry.assignedTo) {
      const lastIdx = salesReps.findIndex(
        (r) => String(r._id) === String(lastEnquiry.assignedTo)
      );
      if (lastIdx !== -1) {
        nextIndex = (lastIdx + 1) % salesReps.length;
      }
    }
  }

  return {
    assignedTo: salesReps[nextIndex]._id,
    assignedToName: salesReps[nextIndex].name,
  };
};

/**
 * Extracts and normalizes Magicbricks lead fields from query params or body.
 */
const extractMagicbricksPayload = (params) => {
  const pick = (...keys) => {
    for (const key of keys) {
      const val = params[key];
      if (val !== undefined && val !== null && String(val).trim() !== '') {
        return String(val).trim();
      }
    }
    return '';
  };

  return {
    name: pick('name', 'buyer_name', 'cname', 'lead_name') || 'Magicbricks Lead',
    phone: pick('phone', 'mobile', 'phone_no', 'contact_no', 'cmobile'),
    email: pick('email', 'email_id', 'cemail'),
    propertyTitle: pick('property', 'project', 'propertyTitle', 'proj_name', 'listing_name'),
    location: pick('location', 'locality', 'city'),
    budget: pick('budget', 'price'),
    propertyType: pick('property_type', 'bhk', 'configuration'),
    message: pick('message', 'remarks', 'comment', 'query', 'description'),
    externalLeadId: pick('lead_id', 'mb_lead_id', 'id'),
  };
};

/**
 * Handler for Magicbricks Push Integration (GET primary, POST also supported).
 * Endpoint: /api/integrations/magicbricks
 */
const handleMagicbricksPush = async (req, res) => {
  try {
    const configuredKey = process.env.MAGICBRICKS_API_KEY;
    if (!configuredKey) {
      return res.status(500).json({
        success: false,
        message: 'Magicbricks integration is not configured on the server.',
      });
    }

    const providedKey =
      req.query.api_key ||
      req.query.apiKey ||
      req.query.key ||
      req.headers['x-api-key'] ||
      (req.body && (req.body.api_key || req.body.apiKey));

    if (!providedKey || providedKey !== configuredKey) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Invalid or missing API key.',
      });
    }

    const mergedParams = { ...(req.body || {}), ...(req.query || {}) };
    const payload = extractMagicbricksPayload(mergedParams);

    if (!payload.phone) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameter: phone.',
      });
    }

    // Deduplicate if externalLeadId was already synced
    if (payload.externalLeadId) {
      const existingLead = await Enquiry.findOne({
        leadSource: 'Magicbricks',
        externalLeadId: payload.externalLeadId,
      });
      if (existingLead) {
        return res.status(200).json({
          success: true,
          message: 'Lead already synced.',
          leadId: existingLead._id,
        });
      }
    }

    // Attempt to match property by title if provided
    let propertyId = null;
    let finalPropertyTitle = payload.propertyTitle;
    let assignedTo = null;
    let assignedToName = '';

    if (payload.propertyTitle) {
      const escapedTitle = payload.propertyTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const matchedProperty = await Property.findOne({
        title: { $regex: `^${escapedTitle}$`, $options: 'i' },
      });
      if (matchedProperty) {
        propertyId = matchedProperty._id;
        finalPropertyTitle = matchedProperty.title;
        const assignment = await getRoundRobinSalesRep(matchedProperty._id);
        assignedTo = assignment.assignedTo;
        assignedToName = assignment.assignedToName;
      }
    }

    const detailParts = [];
    if (payload.message) detailParts.push(payload.message);
    if (payload.location) detailParts.push(`Location: ${payload.location}`);
    if (payload.propertyType) detailParts.push(`Configuration: ${payload.propertyType}`);
    if (payload.budget) detailParts.push(`Budget: ${payload.budget}`);
    if (payload.externalLeadId) detailParts.push(`MB Lead ID: ${payload.externalLeadId}`);

    await ensureMagicbricksLeadSource();

    const enquiry = new Enquiry({
      type: 'general',
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      subject: finalPropertyTitle
        ? `Magicbricks Lead - ${finalPropertyTitle}`
        : 'Magicbricks Property Lead',
      message: detailParts.join(' | '),
      propertyId,
      propertyTitle: finalPropertyTitle,
      status: 'New',
      temperature: 'Warm',
      assignedTo,
      assignedToName,
      leadSource: 'Magicbricks',
      externalLeadId: payload.externalLeadId,
    });

    const savedEnquiry = await enquiry.save();

    return res.status(200).json({
      success: true,
      message: 'Magicbricks lead received successfully.',
      leadId: savedEnquiry._id,
    });
  } catch (error) {
    console.error('[Magicbricks Integration Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error',
    });
  }
};

router.get('/magicbricks', handleMagicbricksPush);
router.post('/magicbricks', handleMagicbricksPush);

export default router;
