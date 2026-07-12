const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { sendResponse } = require('../utils/response');

router.get('/suppliers', protect, (req, res) => {
  const suppliers = [
    {
      id: 'sup-01',
      name: 'Apex Metals Corp',
      sector: 'Raw Materials',
      country: 'Germany',
      esgScore: 84,
      auditStatus: 'compliant',
      lastAuditDate: '2026-04-12'
    },
    {
      id: 'sup-02',
      name: 'Beta Packing Systems',
      sector: 'Logistics & Supply',
      country: 'China',
      esgScore: 68,
      auditStatus: 'under_review',
      lastAuditDate: '2026-06-20'
    },
    {
      id: 'sup-03',
      name: 'CleanChem LLC',
      sector: 'Chemicals',
      country: 'USA',
      esgScore: 92,
      auditStatus: 'compliant',
      lastAuditDate: '2026-01-15'
    },
    {
      id: 'sup-04',
      name: 'Delta Energy Services',
      sector: 'Utilities',
      country: 'India',
      esgScore: 55,
      auditStatus: 'non_compliant',
      lastAuditDate: '2026-05-30'
    }
  ];

  return sendResponse(res, 200, true, 'Suppliers ESG records retrieved successfully', suppliers);
});

module.exports = router;
