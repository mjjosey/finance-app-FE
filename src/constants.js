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
  { label: 'Actions', key: 'actions',width: "20" },
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