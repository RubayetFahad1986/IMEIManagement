export interface TourStep {
  target: string;
  title: string;
  content: string;
}

export const TOUR_STEPS: Record<string, TourStep[]> = {
  dashboard: [
    { target: ".bg-primary", title: "Business Health", content: "Monitor your overall business performance here at a glance." },
    { target: "header .relative", title: "Global Search", content: "Quickly find any invoice, product, or customer across the system." },
    { target: ".h-14.w-14", title: "Help & Guide", content: "Need help? Click here for contextual guidelines and tutorials." }
  ],
  pos: [
    { target: "input[placeholder*='IMEI']", title: "IMEI Scanning", content: "Scan or enter device IMEI to quickly add mobile phones to the sale." },
    { target: ".bg-slate-900.text-white", title: "Action Buttons", content: "Use these hotkeys or buttons to process and finish your sales." },
    { target: "table", title: "Items Table", content: "Review items, prices, and discounts before finalizing the invoice." }
  ],
  inventory: [
    { target: "button:contains('Add New')", title: "Add Product", content: "Manually add new products or stock to your inventory." },
    { target: "button:contains('Audit')", title: "Physical Audit", content: "Reconcile your physical stock with software records easily." }
  ],
  sales: [
    { target: "table", title: "Sales History", content: "Browse through all your past sales and invoices." },
    { target: ".rounded-xl.shadow-sm", title: "Filters", content: "Filter sales by date range, customer, or payment status." }
  ],
  purchases: [
    { target: "button:contains('Add New')", title: "New Purchase", content: "Record new stock purchases from your suppliers here." },
    { target: "table", title: "Purchase List", content: "Track your inventory intake and supplier payments." }
  ],
  accounting: [
    { target: ".grid", title: "Financial Overview", content: "View your cash flow, expenses, and pending dues." },
    { target: "button:contains('Expense')", title: "Record Expense", content: "Keep track of daily business expenses to maintain accurate ledgers." }
  ],
  contacts: [
    { target: "button:contains('Add')", title: "Add Contact", content: "Create new customer or supplier profiles here." },
    { target: "input[placeholder*='Search']", title: "Quick Filter", content: "Search for contacts by name or phone number instantly." }
  ],
  stolen: [
    { target: "input[name='imei']", title: "IMEI Check", content: "Enter IMEI to check if the device is reported stolen in the global database." }
  ],
  settings: [
    { target: ".space-y-6", title: "Configuration", content: "Manage your company profile, users, and system preferences here." }
  ]
};
