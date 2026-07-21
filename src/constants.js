export const drawerWidth = 240;

export const navItems = [
  { text: 'Items', link: '/items' },
  { text: 'Customers', link: '/customers' },
  { text: 'Suppliers', link: '/suppliers' },
  { text: 'Sales', link: '/sales' },
  { text: 'Purchases', link: '/purchases' },
  { text: 'Payments', link: '/payments' },
  { text: 'Receipts', link: '/receipts' },
];

export const itemHeaders = [
  { label: 'Item Name', key: 'itemName',width: "60%" },
  { label: 'Price', key: 'price',width: "20%" },
  { label: 'Actions', key: 'actions',width: "20" }
];

export const customerHeaders = [
  { label: 'Customer Name', key: 'customerName', width: '60%' },
  { label: 'Email', key: 'email', width: '25%' },
  { label: 'Mobile', key: 'mobile', width: '15%' },
  { label: 'City', key: 'city', width: '15%' },
    { label: 'Actions', key: 'actions',width: "20" }
];

export const supplierHeaders = [
  { label: 'Supplier Name', key: 'supplierName', width: '60%' },
  { label: 'Email', key: 'email', width: '25%' },
  { label: 'Mobile', key: 'mobile', width: '15%' },
  { label: 'City', key: 'city', width: '15%' },
  { label: 'Actions', key: 'actions', width: '20' }
];

export const salesHeaders = [
  { label: 'Item Name', key: 'itemName', width: '20%' },
  { label: 'Customer Name', key: 'customerName', width: '20%' },
  { label: 'Quantity', key: 'quantity', width: '20%' },
  { label: 'Price', key: 'price', width: '20%' },
  { label: 'Sale Date', key: 'saleDate', width: '20%' },
  { label: 'Paid Status', key: 'paidStatus', width: '20%' },
  { label: 'Actions', key: 'actions', width: '20%' }
];
export const DEFAULT_ROWS = [
  {
    type: 'SERVICE',
    itemCode: 'S21',
    itemName: 'SPECIAL PERMIT',
    barcode: '',
    category: 'Services',
    unit: 'Units',
    hsn: '996601',
    showInInvoice: 'Sales',
    purchaseAccount: 'Hire',
    sales: 'Hire',
  },
  {
    type: 'SERVICE',
    itemCode: 'S20',
    itemName: 'CRYSTA OUTSTATION (MIN 225 KMS)',
    barcode: '',
    category: 'Services',
    unit: 'Days',
    hsn: '996601',
    showInInvoice: 'Sales',
    purchaseAccount: 'Hire',
    sales: 'Hire',
  },
];