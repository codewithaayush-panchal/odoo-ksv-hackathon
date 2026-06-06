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
    poNumber: "PO-2025-0068",
    createdAt: "21 may, 2025",
    invoiceDate: "22 may 2025",
    dueDate: "21 june 2025",
    paymentTerms: "Net 30 Days",
    fromOrg: "your Organization Name",
    fromAddress: "123 business park, ahmedabad\nGSTIN:25383438AFB",
    fromEmail: "logistics@vendorbridge.com",
    toOrg: "Infra supplies pvt ltd",
    toAddress: "456, industrial estate, surat\nGSTIN: 343434DB4523",
    toVatId: "GSTIN: 343434DB4523",
    subtotal: 169500,
    cgst: 15255, // 9%
    sgst: 15255, // 9%
    total: 200010,
    status: "Pending Payment",
    items: [
      { desc: "Ergonomic chair", partNo: "Part #EC-25", qty: 25, price: 3500, total: 87500 },
      { desc: "Tech Core LTD", partNo: "Part #TC-10", qty: 10, price: 8200, total: 82000 }
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
