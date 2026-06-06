// VendorBridge Mock Data and State Management (Stitch Alignment)

const DEFAULT_VENDORS = [
  {
    id: "VND-INFRA",
    name: "Infra Supplies Pvt ltd",
    category: "Constructions",
    gst: "27AABCS1429Bz0",
    email: "sales@infrasupplies.com",
    phone: "XYZ Number",
    rating: 4.5,
    status: "Active",
    performance: 92,
    address: "New Delhi, India"
  },
  {
    id: "VND-TECHCORE",
    name: "Tech Core LTD",
    category: "IT",
    gst: "27AABCS1429Bz0",
    email: "contact@techcore.com",
    phone: "XYZ Number",
    rating: 4.2,
    status: "Active",
    performance: 96,
    address: "Mumbai, India"
  },
  {
    id: "VND-FASTLOG",
    name: "FastLog Transport",
    category: "logistics",
    gst: "27AABCS1429Bz0",
    email: "shipping@fastlog.com",
    phone: "XYZ Number",
    rating: 3.8,
    status: "Blocked",
    performance: 88,
    address: "Bangalore, India"
  },
  {
    id: "VND-OFFICENEED",
    name: "Office Need Co.",
    category: "furniture",
    gst: "27AABCS1429Bz0",
    email: "orders@officeneed.com",
    phone: "XYZ Number",
    rating: 3.8,
    status: "Pending",
    performance: 85,
    address: "Chennai, India"
  }
];

const DEFAULT_RFQS = [
  {
    id: "RFQ-2024-089",
    title: "office furniture procurement q2",
    description: "Ergonomic chairs and standing desks for 3rd floor",
    deadline: "15 June 2025",
    status: "Comparing",
    createdAt: "2026-06-01",
    client: "Global Tech Solutions Inc.",
    totalValue: 185400,
    items: [
      { name: "Ergonomic chair", qty: 25, unit: "NOS" },
      { name: "Standing desks", qty: 10, unit: "NOS" }
    ],
    assignedVendors: ["VND-INFRA", "VND-TECHCORE", "VND-OFFICENEED"],
    attachment: "furniture_specs.pdf"
  }
];

const DEFAULT_QUOTATIONS = [
  {
    id: "QUO-X892-GTS",
    rfqId: "RFQ-2024-089",
    vendorId: "VND-INFRA",
    vendorName: "Infra Supplies Pvt ltd",
    pricePerUnit: 7416,
    deliveryDays: 10,
    rating: 4.5,
    paymentTerms: "30 days",
    warranty: "12 Months",
    notes: "Lowest bid representing complete turn-key supply, certified deployment, and includes full service warranty.",
    status: "Selected",
    submittedAt: "2026-06-02",
    lineItems: [
      { name: "Ergonomic chair (x25)", price: 75000 },
      { name: "Standing desks (x10)", price: 82119 }
    ],
    comparisonItems: {
      "Grand Total": { Infra: 185400, TechCore: 200010, OfficeNeed: 214800 },
      "GST %": { Infra: 18, TechCore: 18, OfficeNeed: 18 },
      "Delivery (days)": { Infra: 10, TechCore: 14, OfficeNeed: 7 },
      "Vendor Rating": { Infra: "4.5/5", TechCore: "4.2/5", OfficeNeed: "3.8/5" },
      "Payment terms": { Infra: "30 days", TechCore: "30 days", OfficeNeed: "15 days" }
    }
  }
];

const DEFAULT_PO = [
  {
    id: "PO-8842-VB-2023",
    rfqId: "RFQ-2024-089",
    quotationId: "QUO-X892-GTS",
    vendorId: "VND-INFRA",
    poNumber: "PO #8842-VB-2023",
    createdAt: "Oct 24, 2023",
    invoiceDate: "Oct 25, 2023",
    dueDate: "Nov 24, 2023",
    paymentTerms: "Net 30 Days",
    fromOrg: "VendorBridge Logistics Corp.",
    fromAddress: "451 Procurement Way, Suite 200, Austin, TX 78701, USA",
    fromEmail: "logistics@vendorbridge.com",
    toOrg: "Infra Supplies Pvt ltd",
    toAddress: "New Delhi, India",
    toVatId: "VAT ID: US88392011",
    subtotal: 157119,
    cgst: 14140.50, // 9%
    sgst: 14140.50, // 9%
    total: 185400,
    status: "Pending Payment",
    items: [
      { desc: "Ergonomic chair", partNo: "Part #EC-25", qty: 25, price: 3000, total: 75000 },
      { desc: "Standing desks", partNo: "Part #SD-10", qty: 10, price: 8211.90, total: 82119 }
    ],
    shipmentInstructions: "Freight to be handled via BlueStar Logistics. Delivery window: 09:00 - 16:00 Mon-Fri. Warehouse Gate 4."
  }
];

const DEFAULT_ACTIVITIES = [
  {
    id: "ACT-101",
    timestamp: "Oct 12, 10:45 AM",
    user: "Sarah Mitchell",
    action: "Submitted RFQ L1",
    details: "Urgent requirement for Q4 maintenance cycle."
  },
  {
    id: "ACT-102",
    timestamp: "Oct 13, 02:15 PM",
    user: "Marcus Chen",
    action: "Approved (L1 Review)",
    details: "Budget verified. Terms are compliant with master agreement."
  }
];

// State Manager
window.VBState = {
  getData: function(key, defaultValue) {
    const data = localStorage.getItem('stitch_vb_' + key);
    return data ? JSON.parse(data) : defaultValue;
  },
  
  setData: function(key, value) {
    localStorage.setItem('stitch_vb_' + key, JSON.stringify(value));
    window.dispatchEvent(new Event('vb-state-change'));
  },

  resetAll: function() {
    localStorage.clear();
    this.init();
    window.location.reload();
  },

  init: function() {
    if (!localStorage.getItem('stitch_vb_vendors')) {
      this.setData('vendors', DEFAULT_VENDORS);
    }
    if (!localStorage.getItem('stitch_vb_rfqs')) {
      this.setData('rfqs', DEFAULT_RFQS);
    }
    if (!localStorage.getItem('stitch_vb_quotations')) {
      this.setData('quotations', DEFAULT_QUOTATIONS);
    }
    if (!localStorage.getItem('stitch_vb_pos')) {
      this.setData('pos', DEFAULT_PO);
    }
    if (!localStorage.getItem('stitch_vb_activities')) {
      this.setData('activities', DEFAULT_ACTIVITIES);
    }
    if (!localStorage.getItem('stitch_vb_logged_in')) {
      localStorage.setItem('stitch_vb_logged_in', 'false');
    }
    if (!localStorage.getItem('stitch_vb_current_role')) {
      localStorage.setItem('stitch_vb_current_role', 'Procurement Officer');
    }
    if (!localStorage.getItem('stitch_vb_user_name')) {
      localStorage.setItem('stitch_vb_user_name', 'Jessica Davis');
    }
  }
};

window.VBState.init();
