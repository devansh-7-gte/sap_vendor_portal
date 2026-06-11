/** Seed / initial demo data for the RFQ feature domain. */
export const INITIAL_RFQS = [
  {
    id: 'RFQ-2026-809',
    description: 'Procurement of High-Tensile Fasteners (Grade 8.8)',
    companyCode: '1000',
    purchasingOrg: '1000',
    purchasingGroup: '001',
    rfqType: 'AN',
    createdDate: '2026-06-01',
    deadlineDate: '2026-06-15',
    currency: 'INR',
    incoterms: 'EXW',
    paymentTerms: 'NET 30 Days',
    deliveryLocation: 'Plant 1000 (Mumbai)',
    notes: 'Ensure material is compliant with DIN 933 hexagonal head standards.',
    status: 'Bidding Open',
    items: [
      { line: 10, materialCode: 'FAST-HEX-M12-050', description: 'Hexagonal Bolt M12 x 50mm Grade 8.8', quantity: 10000, uom: 'EA', targetPrice: 15.50, plant: '1000', deliveryDate: '2026-06-30' },
      { line: 20, materialCode: 'FAST-WASHER-M12', description: 'Plain Washer M12 Medium Carbon Steel', quantity: 10000, uom: 'EA', targetPrice: 2.20, plant: '1000', deliveryDate: '2026-06-30' },
      { line: 30, materialCode: 'FAST-NUT-M12', description: 'Hexagonal Nut M12 Grade 8', quantity: 10000, uom: 'EA', targetPrice: 4.80, plant: '1000', deliveryDate: '2026-06-30' }
    ],
    invitedVendors: [
      { id: 'VND-4001', name: 'Apex Fasteners', status: 'Quoted', rating: 92 },
      { id: 'VND-4002', name: 'Quality Steel Corp', status: 'Quoted', rating: 88 }
    ],
    bids: [
      {
        vendorId: 'VND-4001',
        vendorName: 'Apex Fasteners',
        unitPrices: { 10: 14.80, 20: 2.10, 30: 4.60 },
        deliveryLeadTimeDays: 5,
        gstRate: '18%',
        freight: 1200,
        moq: 100,
        validityDate: '2026-07-15',
        technicalScore: 85,
        vendorRating: 92,
        submittedAt: '2026-06-02T11:00:00Z'
      },
      {
        vendorId: 'VND-4002',
        vendorName: 'Quality Steel Corp',
        unitPrices: { 10: 16.00, 20: 1.90, 30: 4.50 },
        deliveryLeadTimeDays: 10,
        gstRate: '12%',
        freight: 800,
        moq: 50,
        validityDate: '2026-07-20',
        technicalScore: 90,
        vendorRating: 88,
        submittedAt: '2026-06-03T10:00:00Z'
      }
    ]
  },
  {
    id: 'RFQ-2026-810',
    description: 'Yearly Contract: SS316 Flanges for Valve Piping',
    companyCode: '1000',
    purchasingOrg: '1000',
    purchasingGroup: '002',
    rfqType: 'AN',
    createdDate: '2026-05-28',
    deadlineDate: '2026-06-10',
    currency: 'INR',
    incoterms: 'CIF',
    paymentTerms: 'NET 45 Days',
    deliveryLocation: 'Plant 2000 (Chennai)',
    notes: 'Flanges must hold ASME B16.5 material certification.',
    status: 'Bidding Open',
    items: [
      { line: 10, materialCode: 'PIP-FLG-SS316-04', description: 'Weld Neck Flange 4 inch Class 150 SS316', quantity: 250, uom: 'EA', targetPrice: 2450.00, plant: '2000', deliveryDate: '2026-07-15' },
      { line: 20, materialCode: 'PIP-FLG-SS316-02', description: 'Slip On Flange 2 inch Class 150 SS316', quantity: 500, uom: 'EA', targetPrice: 1120.00, plant: '2000', deliveryDate: '2026-07-15' }
    ],
    invitedVendors: [
      { id: 'VND-4001', name: 'Apex Fasteners', status: 'Quoted', rating: 92 },
      { id: 'VND-4002', name: 'Quality Steel Corp', status: 'Pending', rating: 88 }
    ],
    bids: [
      {
        vendorId: 'VND-4001',
        vendorName: 'Apex Fasteners',
        unitPrices: { 10: 2390.00, 20: 1090.00 },
        deliveryLeadTimeDays: 7,
        gstRate: '18%',
        freight: 2500,
        moq: 10,
        validityDate: '2026-07-10',
        technicalScore: 88,
        vendorRating: 92,
        submittedAt: '2026-05-29T14:30:00Z'
      }
    ]
  },
  {
    id: 'RFQ-2026-801',
    description: 'Standard Gasket Kits - Maintenance Division',
    companyCode: '1000',
    purchasingOrg: '1000',
    purchasingGroup: '001',
    rfqType: 'AN',
    createdDate: '2026-05-10',
    deadlineDate: '2026-05-25',
    currency: 'INR',
    incoterms: 'FOB',
    paymentTerms: 'NET 30 Days',
    deliveryLocation: 'Plant 1000 (Mumbai)',
    notes: 'Standard graphite filler gaskets for maintenance cycles.',
    status: 'Closed',
    items: [
      { line: 10, materialCode: 'MECH-GASK-001', description: 'Spiral Wound Gasket 3 inch SS316/Graphite', quantity: 1200, uom: 'EA', targetPrice: 320.00, plant: '1000', deliveryDate: '2026-06-10' }
    ],
    invitedVendors: [
      { id: 'VND-4001', name: 'Apex Fasteners', status: 'Quoted', rating: 92 }
    ],
    bids: [
      {
        vendorId: 'VND-4001',
        vendorName: 'Apex Fasteners',
        unitPrices: { 10: 310.00 },
        deliveryLeadTimeDays: 3,
        gstRate: '18%',
        freight: 500,
        moq: 100,
        validityDate: '2026-06-30',
        technicalScore: 82,
        vendorRating: 92,
        submittedAt: '2026-05-12T09:00:00Z'
      }
    ]
  }
];
