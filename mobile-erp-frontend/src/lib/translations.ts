export type Language = 'en' | 'bn' | 'ar' | 'hi';

export interface Translations {
  [key: string]: {
    [key in Language]: string;
  };
}

export const translations: Translations = {
  // Groups
  general: { en: 'General', bn: 'সাধারণ', ar: 'عام', hi: 'सामान्य' },
  transactions: { en: 'Transactions', bn: 'লেনদেন', ar: 'المعاملات', hi: 'लेनদেন' },
  people: { en: 'People', bn: 'ব্যক্তি', ar: 'الأشخاص', hi: 'लोग' },
  security: { en: 'Security', bn: 'নিরাপত্তা', ar: 'الأমন', hi: 'সুরক্ষা' },
  system: { en: 'System', bn: 'সিস্টেম', ar: 'النظام', hi: 'সিস্টেম' },
  accounting: { en: 'Accounting', bn: 'অ্যাকাউন্টিং', ar: 'المحাসبة', hi: 'লেখাঙ্কন' },

  // Menu Items
  dashboard: { en: 'Dashboard', bn: 'ড্যাশবোর্ড', ar: 'لوحة القيادة', hi: 'ড্যাশোর্ড' },
  pos_sale: { en: 'POS / Sale', bn: 'পস / বিক্রয়', ar: 'نقطة البيع / البيع', hi: 'पीओएस / बिक्री' },
  master_product_list: { en: 'Master Product List', bn: 'মাস্টার প্রোডাক্ট লিস্ট', ar: 'قائمة المنتجات الرئيسية', hi: 'মাস্টার উৎপাদ সূচी' },
  inventory: { en: 'Inventory', bn: 'ইনভেন্টরি', ar: 'المخزون', hi: 'ইন্বেন্টरी' },
  branch_transfers: { en: 'Branch Transfers', bn: 'ব্রাঞ্চ ট্রান্সফার', ar: 'تحويلات الفروع', hi: 'শাখা স্থানান্তরণ' },
  sales_history: { en: 'Sales History', bn: 'বিক্রয় ইতিহাস', ar: 'سجل المبيعات', hi: 'বিক্রী ইতিহাস' },
  sales_returns: { en: 'Sales Returns', bn: 'বিক্রয় ফেরত', ar: 'مرتجعات المبيعات', hi: 'বিক্রী বাপসী' },
  purchases: { en: 'Purchases', bn: 'ক্রয়', ar: 'المشتريات', hi: 'খरीদाরী' },
  purchase_returns: { en: 'Purchase Returns', bn: 'ক্রয় ফেরত', ar: 'مرتجعات المشتريات', hi: 'খरीদ বাপসী' },
  daily_transactions: { en: 'Daily Transactions', bn: 'দৈনিক লেনদেন', ar: 'المعاملات اليومية', hi: 'দৈনিক লেনদেন' },
  general_ledger: { en: 'General Ledger', bn: 'জেনারেল লেজার', ar: 'دفتر الأستاذ العام', hi: 'সামান্য বহी' },
  contact_ledger: { en: 'Contact Ledger', bn: 'কন্টাক্ট লেজার', ar: 'دفتر جهات الاتصال', hi: 'সংপর্ক বহी' },
  due_management: { en: 'Due Management', bn: 'বাকি ম্যানেজমেন্ট', ar: 'إدارة الديون', hi: 'বकाया প্রবন্ধন' },
  expenses: { en: 'Expenses', bn: 'খরচ', ar: 'المصاريف', hi: 'খર્ચ' },
  chart_of_accounts: { en: 'Chart of Accounts', bn: 'হিসাবের তালিকা', ar: 'شجرة الحسابات', hi: 'খাতোঁ কা চার্ট' },
  contacts: { en: 'Contacts', bn: 'কন্টাক্টস', ar: 'جهات الاتصال', hi: 'সংপর্ক' },
  staff: { en: 'Staff', bn: 'স্টাফ', ar: 'الموظفون', hi: 'কর্মচারী' },
  user_management: { en: 'User Management', bn: 'ইউজার ম্যানেজমেন্ট', ar: 'إدارة المستخدمين', hi: 'উপয়োগকর্তা প্রবন্ধন' },
  stolen_registry: { en: 'Stolen Registry', bn: 'চুরি রেজিস্ট্রি', ar: 'سجل المسروقات', hi: 'চोरी কী রেজিস্ট্রি' },
  subscription_management: { en: 'Subscription Management', bn: 'সাবস্ক্রিপশন ম্যানেজমেন্ট', ar: 'إدارة الاشتراكات', hi: 'সদস্যতা প্রবন্ধন' },
  reports: { en: 'Reports', bn: 'রিপোর্ট', ar: 'التقارير', hi: 'রিপোর্ট' },
  settings: { en: 'Settings', bn: 'সেটিংস', ar: 'الإعدادات', hi: 'सेटिंग्स' },
  reseller_management: { en: 'Reseller Management', bn: 'রিসেলার ম্যানেজমেন্ট', ar: 'إدارة الموزعين', hi: 'रीसेलर प्रबंधन' },
  document_sequences: { en: 'Document Sequences', bn: 'ডকুমেন্ট সিকোয়েন্স', ar: 'تسلسلات المستندات', hi: 'डॉक्यूमेंट अनुक्रम' },
  sample_data_seeder: { en: 'Sample Data Seeder', bn: 'স্যাম্পল ডাটা সিডার', ar: 'مغذي بيانات العينة', hi: 'নমুনা ডেটा ফীডার' },
  company_settings: { en: 'Company Settings', bn: 'কোম্পানি সেটিংস', ar: 'إعدادات الشركة', hi: 'কংপনী সেটিংগস' },

  // Dashboard Metrics
  todays_sales: { en: "Today's Sales", bn: 'আজকের বিক্রয়', ar: 'مبيعات اليوم', hi: 'আজ কী বিক্রী' },
  todays_purchase: { en: "Today's Purchase", bn: 'আজকের ক্রয়', ar: 'مشتريات اليوم', hi: 'আজ কী খরীদ' },
  operational_profit: { en: 'Operational Profit', bn: 'অপারেশনাল লাভ', ar: 'الربح التشغيلي', hi: 'পরিচালন লাভ' },
  todays_expenses: { en: "Today's Expenses", bn: 'আজকের খরচ', ar: 'مصاريف اليوم', hi: 'আজ কে খরচ' },
  cash_received: { en: 'Cash Received', bn: 'নগদ গ্রহণ', ar: 'النقد المستلم', hi: 'নকদ প্রাপ্ত' },
  total_payments: { en: 'Total Payments', bn: 'মোট পেমেন্ট', ar: 'إجمالي المدفوعات', hi: 'কুল ভগতান' },
  stock_value: { en: 'Stock Value', bn: 'স্টক ভ্যালু', ar: 'قيمة المخزون', hi: 'স্টক মূল্য' },
  active_customers: { en: 'Active Customers', bn: 'সক্রিয় গ্রাহক', ar: 'العملاء النشطون', hi: 'সক্রীয় গ্রাহক' },

  // Dashboard UI
  intelligence_console: { en: 'Intelligence Console', bn: 'ইন্টেলিজেন্স কনসোল', ar: 'لوحة التحكم الذكية', hi: 'ইন্টেলিজেন্স কংপনী' },
  realtime_metrics_live: { en: 'Real-time Metrics Live', bn: 'রিয়েল-টাইম মেট্রিক্স লাইভ', ar: 'مقاييس مباشرة في الوقت الفعلي', hi: 'রীয়েল-টাইম মেট্রিক্স লাইভ' },
  date_range: { en: 'Date Range', bn: 'তারিখের পরিসীমা', ar: 'نطاق التاريخ', hi: 'দিনাঙ্ক সীমা' },
  load_data: { en: 'Load Data', bn: 'ডাটা লোড করুন', ar: 'تحميل البيانات', hi: 'ডেটा লোড করেঁ' },
  sales_trend: { en: 'Sales Trend', bn: 'বিক্রয় ট্রেন্ড', ar: 'اتجاه المبيعات', hi: 'বিক্রী রুঝান' },
  revenue_mapping: { en: 'Revenue mapping for the period', bn: 'সময়ের জন্য রাজস্ব ম্যাপিং', ar: 'رسم خرائط الإيرادات للفترة', hi: 'অবধী কে লিয়ে রাজস্ব মানচিত্রণ' },
  liquid_reserves: { en: 'Liquid Reserves', bn: 'তরল রিজার্ভ', ar: 'الاحتياطيات السائلة', hi: 'তরল ভণ্ডার' },
  cash_bank_balances: { en: 'Available cash & bank balances', bn: 'উপলব্ধ নগদ এবং ব্যাংক ব্যালেন্স', ar: 'الأرصدة النقدية والمصرفية المتاحة', hi: 'উপলব্ধ নকদ ঔর ব্যাংক শেষ' },
  net_reserves: { en: 'Net Reserves', bn: 'নিট রিজার্ভ', ar: 'صافي الاحتياطيات', hi: 'শুদ্ধ ভণ্ডার' },
  safe_for_purchase: { en: 'Safe for new stock purchase', bn: 'নতুন স্টক ক্রয়ের জন্য নিরাপদ', ar: 'آمن لشراء مخزون جديد', hi: 'নয়ा স্টক খরীদনে কে লিয়ে সুরক্ষীত' },
  stock_by_brand: { en: 'Stock by Brand', bn: 'ব্র্যান্ড অনুযায়ী স্টক', ar: 'المخزون حسب العلامة التجارية', hi: 'ব্র্যান্ড দ্বারা স্টক' },
  value_distribution: { en: 'Value distribution map', bn: 'ভ্যালু ডিস্ট্রিবিউশন ম্যাপ', ar: 'خريطة توزيع القيمة', hi: 'মূল্য বিতরণ মানচিত্র' },
  recent_activity: { en: 'Recent Activity', bn: 'সাম্প্রতিক কার্যকলাপ', ar: 'النشاط الأخير', hi: 'হাল কী গতিবিধী' },
  latest_financial_events: { en: 'Latest 5 financial events', bn: 'সর্বশেষ ৫টি আর্থিক ইভেন্ট', ar: 'آخر 5 أحداث مالية', hi: 'নবীনতম 5 বিত্তীয় কার্যক্রম' },
  transaction: { en: 'Transaction', bn: 'লেনদেন', ar: 'المعاملة', hi: 'লেনদেন' },
  partner: { en: 'Partner', bn: 'পার্টনার', ar: 'الشريك', hi: 'সাথী' },
  no_recent_transactions: { en: 'No recent transactions found', bn: 'কোন সাম্প্রতিক লেনদেন পাওয়া যায়নি', ar: 'لم يتم العثور على معاملات أخيرة', hi: 'কোঈ হালিয়া লেনদেন নহীং মিলা' },
  stock_audit_console: { en: 'Stock Audit Console', bn: 'স্টক অডিট কনসোল', ar: 'لوحة تدقيق المخزون', hi: 'স্টক অডিট কংপনী' },
  detailed_item_list: { en: 'Detailed list of all items currently in stock', bn: 'বর্তমানে স্টকে থাকা সমস্ত আইটেমের বিস্তারিত তালিকা', ar: 'قائمة مفصلة بجميع العناصر الموجودة حاليًا في المخزون', hi: 'বর্তমানে স্টোকে থাকা সমস্ত আইটেমদের বিস্তারিত সূচী' },
  total_units: { en: 'Total Units', bn: 'মোট ইউনিট', ar: 'إجمالي الوحدات', hi: 'কুল ইকাঈয়াঁ' },
  net_asset_value: { en: 'Net Asset Value', bn: 'নিট সম্পদ মূল্য', ar: 'صافي قيمة الأصول', hi: 'শুদ্ধ সংপত্তী মূল্য' },
  close_audit: { en: 'Close Audit', bn: 'অডিট বন্ধ করুন', ar: 'إغلاق التدقيق', hi: 'অডিট বন্ধ করেঁ' },
  inventory_in: { en: 'Inventory In', bn: 'ইনভেন্টরি ইন', ar: 'المخزون الوارد', hi: 'ইন্বেন্টরী ইন' },
  net_earnings: { en: 'Net Earnings', bn: 'নিট আয়', ar: 'صافي الأرباح', hi: 'শুদ্ধ কমাঈ' },
  total_inflow: { en: 'Total Inflow', bn: 'মোট ইনফ্লো', ar: 'إجمالي التدفق الوارد', hi: 'কুল প্রবাহ' },
  total_outflow: { en: 'Total Outflow', bn: 'মোট আউটফ্লো', ar: 'إجمالي التدفق الخارج', hi: 'কুল বহিঃপ্রবাহ' },
  live_inventory: { en: 'Live Inventory', bn: 'লাইভ ইনভেন্টরি', ar: 'المخزون المباشر', hi: 'লাইভ ইনভেন্টরী' },
  total_database: { en: 'Total Database', bn: 'মোট ডাটাবেস', ar: 'إجمالي قاعدة البيانات', hi: 'কুল ডাটाবেস' },

  // Expenses
  voucher_no: { en: 'Voucher No', bn: 'ভাউচার নং', ar: 'رقم القسيمة', hi: 'বাউচার সংখ্যা' },
  expense_list: { en: 'Expense List', bn: 'খরচের তালিকা', ar: 'قائمة المصاريف', hi: 'খর্চ সূচী' },
  new_expense: { en: 'New Expense', bn: 'নতুন খরচ', ar: 'مصروف جديد', hi: 'নয়ा খর্চ' },
  recent_expenses: { en: 'Recent Expenses', bn: 'সাম্প্রতিক খরচ', ar: 'المصاريف الأخيرة', hi: 'হাল কে খর্চ' },
  edit_expense_voucher: { en: 'Edit Expense Voucher', bn: 'খরচ ভাউচার সম্পাদনা', ar: 'تعديل قسيمة المصاريف', hi: 'খর্চ বাউচার সংপাদীত করেঁ' },
  new_expense_voucher: { en: 'New Expense Voucher', bn: 'নতুন খরচ ভাউচার', ar: 'قسيمة مصاريف جديدة', hi: 'নয়ा খর্চ বাউচার' },
  payment_source: { en: 'Payment Source', bn: 'পেমেন্ট উৎস', ar: 'مصدر الدفع', hi: 'ভগতান স্রোত' },
  expense_category: { en: 'Expense Category', bn: 'খরচের ক্যাটাগরি', ar: 'فئة المصاريف', hi: 'খর্চ শ্রেণী' },
  add_row: { en: 'Add Row', bn: 'রো যোগ করুন', ar: 'إضافة صف', hi: 'পংক্তি জোড়েঁ' },
  save_expense: { en: 'Save Expense', bn: 'খরচ সংরক্ষণ করুন', ar: 'حفظ المصروف', hi: 'খর্চ সহেজেন' },
  update_expense: { en: 'Update Expense', bn: 'খরচ আপডেট করুন', ar: 'تحديث المصروف', hi: 'খর্চ আপডেট করেঁ' },
  search_voucher_placeholder: { en: 'Search voucher or remarks...', bn: 'ভাউচার বা মন্তব্য খুঁজুন...', ar: 'البحث عن القسيمة أو الملاحظات...', hi: 'বাউচার ইয়া টিপ্পণী খোজেন...' },

  // Inventory
  asset_management: { en: 'Asset Management', bn: 'সম্পদ ব্যবস্থাপনা', ar: 'إدارة الأصول', hi: 'সংপত্তী প্রবন্ধন' },
  monitor_assets_help: { en: 'Monitor and manage the lifecycle of your mobile device assets.', bn: 'আপনার মোবাইল ডিভাইস সম্পদের জীবনচক্র পর্যবেক্ষণ ও পরিচালনা করুন।', ar: 'مراقبة وإدارة دورة حياة أصول أجهزة المحمول الخاصة بك.', hi: 'আপনে মোবাইল ডিভাইস সংপত্তীয়োং কে জীবনচক্র কী নিগরানী ঔর প্রবন্ধন করেঁ।' },
  clear: { en: 'Clear', bn: 'পরিষ্কার করুন', ar: 'مسح', hi: 'সাফ করেঁ' },
  total_assets: { en: 'Total Assets', bn: 'মোট সম্পদ', ar: 'إجمالي الأصول', hi: 'কুল সংপত্তী' },
  in_stock: { en: 'In Stock', bn: 'স্টকে আছে', ar: 'في المخزن', hi: 'স্টক মেঁ' },
  sold_items: { en: 'Sold Items', bn: 'বিক্রিত পণ্য', ar: 'العناصر المباعة', hi: 'বেচী গয়ী বস্তুঁএ' },
  compromised: { en: 'Compromised', bn: 'ক্ষতিগ্রস্ত', ar: 'متضرر', hi: 'সংঝৌতা কিয়া' },
  asset_records: { en: 'Asset Records', bn: 'সম্পদ রেকর্ড', ar: 'سجلات الأصول', hi: 'সংপত্তী রেকর্ড' },
  live_view_assets: { en: 'Live view of all registered devices in your system.', bn: 'আপনার সিস্টেমের সমস্ত নিবন্ধিত ডিভাইসের লাইভ ভিউ।', ar: 'عرض مباشر لجميع الأجهزة المسجلة في نظامك.', hi: 'আপকে সিস্টেম মেঁ সভি পঞ্জীকৃত উপকরণোং কা লাইভ দৃশ্য।' },
  showing_assets: { en: 'Showing {0} of {1} assets', bn: '{0} এর {1} সম্পদ দেখানো হচ্ছে', ar: 'عرض {0} من {1} من الأصول', hi: '{1} মেঁ সে {0} সংপত্তিয়াঁ দিখাঈ যা রহী হেঁ' },
  device_identity: { en: 'Device Identity', bn: 'ডিভাইস পরিচিতি', ar: 'هوية الجهاز', hi: 'ডিভাইস পহচান' },
  cost_value: { en: 'Cost Value', bn: 'ক্রয় মূল্য', ar: 'قيمة التكلفة', hi: 'লাগত মূল্য' },
  sale_price: { en: 'Sale Price', bn: 'বিক্রয় মূল্য', ar: 'সعر البيع', hi: 'বিক্রী মূল্য' },
  warranty: { en: 'Warranty', bn: 'ওয়ারেন্টি', ar: 'الضمان', hi: 'বারান্টী' },
  audit: { en: 'Audit', bn: 'অডিট', ar: 'تدقيق', hi: 'লেখাপরীক্ষা' },
  out_of_stock: { en: 'OUT OF STOCK', bn: 'স্টক শেষ', ar: 'نفد من المخزن', hi: 'স্টক মেঁ নহীং' },
  ready: { en: 'READY', bn: 'প্রস্তুত', ar: 'جاهز', hi: 'তৈয়ার' },
  no_activity_logged: { en: 'No activity logged', bn: 'কোন কার্যকলাপ লগ করা হয়নি', ar: 'لم يتم تسجيل أي نشاط', hi: 'কোঈ গতিবিধী লগ নহীং কী গয়ী' },
  asset_profile: { en: 'Asset Profile', bn: 'সম্পদ প্রোফাইল', ar: 'ملف تعريف الأصل', hi: 'সংপত্তী প্রোফাইল' },
  hardware_identity: { en: 'Hardware Identity', bn: 'হার্ডওয়্যার পরিচিতি', ar: 'هوية الأجهزة', hi: 'হার্ডবেয়ার পহচান' },
  specifications: { en: 'Specifications', bn: 'স্পেসিফিকেশন', ar: 'المواصفات', hi: 'বিনির্দেশোঁ' },
  memory: { en: 'Memory', bn: 'মেমরি', ar: 'الذاكرة', hi: 'মেমোরী' },
  storage: { en: 'Storage', bn: 'স্টোরেজ', ar: 'التخزين', hi: 'স্টোরেজ' },
  condition: { en: 'Condition', bn: 'অবস্থা', ar: 'الحالة', hi: 'স্থিতী' },
  warranty_end: { en: 'Warranty End', bn: 'ওয়ারেন্টি শেষ', ar: 'نهاية الضمان', hi: 'বারান্টী সংাপ্ত' },
  stock_status: { en: 'Stock Status', bn: 'স্টক স্ট্যাটাস', ar: 'حالة المخزون', hi: 'স্টক স্থিতী' },
  available: { en: 'AVAILABLE', bn: 'উপলব্ধ', ar: 'متاح', hi: 'উপলব্ধ' },
  sold: { en: 'SOLD', bn: 'বিক্রিত', ar: 'تم البيع', hi: 'বিক গয়া' },
  acquisition_detail: { en: 'Acquisition Detail', bn: 'অধিগ্রহণের বিস্তারিত', ar: 'تفاصيل الاستحواذ', hi: 'অধিগ্রহণ বিবরণ' },
  close_profile: { en: 'Close Profile', bn: 'প্রোফাইল বন্ধ করুন', ar: 'إغلاق الملف الشخصي', hi: 'প্রোফাইল বন্ধ করেঁ' },
  report_incident: { en: 'Report Incident', bn: 'ঘটনা রিপোর্ট করুন', ar: 'الإبلاغ عن حادث', hi: 'ঘটনা কী রিপোর্ট করেঁ' },
  mark_compromised_help: { en: 'Mark this asset as compromised to adjust stock levels.', bn: 'স্টক লেভেল সমন্বয় করতে এই সম্পদটিকে ক্ষতিগ্রস্ত হিসেবে চিহ্নিত করুন।', ar: 'حدد هذا الأصل كمتضرر لتعديل مستويات المخزون.', hi: 'স্টক স্তরোঁ কো সংায়োজীত করার কে লিয়ে ইস সংপত্তী কো সংঝৌতা কে রূপ মেঁ চিহ্নীত করেঁ।' },
  target_asset: { en: 'Target Asset', bn: 'টার্গেট সম্পদ', ar: 'الأصل المستهدف', hi: 'লক্ষীত সংপত্তী' },
  incident_categorization: { en: 'Incident Categorization', bn: 'ঘটনার শ্রেণীকরণ', ar: 'تصنيف الحوادث', hi: 'ঘটনা বর্গীকরণ' },
  physical_damage: { en: 'Physical Damage', bn: 'শারীরিক ক্ষতি', ar: 'ضرر مادي', hi: 'শারীরিক ক্ষতি' },
  lost_missing: { en: 'Lost / Missing', bn: 'হারিয়ে গেছে / নিখোঁজ', ar: 'مفقود / ضائع', hi: 'খো গয়া / গায়ব' },
  stolen: { en: 'Stolen', bn: 'চুরি হয়েছে', ar: 'مسروق', hi: 'চोरी হো গয়া' },
  defective: { en: 'DOA / Defective', bn: 'ত্রুটিপূর্ণ', ar: 'معيب', hi: 'দোষপূর্ণ' },
  incident_report_detail: { en: 'Incident Report Detail', bn: 'ঘটনার রিপোর্ট বিস্তারিত', ar: 'تفاصيل تقرير الحادث', hi: 'ঘটনা রিপোর্ট বিবরণ' },
  discard: { en: 'Discard', bn: 'বাতিল করুন', ar: 'تجاهل', hi: 'খারীজ করেঁ' },
  confirm: { en: 'Confirm', bn: 'নিশ্চিত করুন', ar: 'تأكيد', hi: 'পুষ্টি করেঁ' },
  confirm_loss: { en: 'Confirm Loss', bn: 'ক্ষতি নিশ্চিত করুন', ar: 'تأكيد الخسارة', hi: 'নুকসান কী পুষ্টি করেঁ' },

  // Help & Guidelines
  help_guide: { en: 'Help Guide', bn: 'সাহায্য গাইড', ar: 'دليل المساعدة', hi: 'সহায়তা গাইড' },
  dashboard_help: { 
    en: 'Quick view of your business health. Monitor sales and stock levels.', 
    bn: 'আপনার ব্যবসার স্বাস্থ্যের দ্রুত দৃশ্য। বিক্রয় এবং স্টক লেভেল পর্যবেক্ষণ করুন।', 
    ar: 'نظرة سريعة على صحة عملك. مراقبة المبيعات ومستويات المخزون.', 
    hi: 'আপকে ব্যবসায় কে স্বাস্থ্য কা ত্বरीत দৃশ্য। বিক্রী ঔর স্টক স্তর কী নিগরানী করেঁ।' 
  },
  pos_help: { 
    en: 'Process sales here. Use F2 to search, F8 to finish. Scan IMEI for mobile phones.', 
    bn: 'এখানে বিক্রয় প্রক্রিয়া সম্পন্ন করুন। অনুসন্ধানের জন্য F2, শেষ করার জন্য F8 ব্যবহার করুন। মোবাইলের জন্য IMEI স্ক্যান করুন।', 
    ar: 'معالجة المبيعات هنا. استخدم F2 للبحث، F8 للإنهاء. امسح IMEI للهواتف المحمولة.', 
    hi: 'য়হাঁ বিক্রী কী প্রক্তিয়া করেঁ। খোজনে কে লিয়ে F2, সংাপ্ত করার কে লিয়ে F8 কা উপয়োগ করেঁ। মোবাইল ফোন কে লিয়ে IMEI স্ক্যান করেঁ।' 
  },
  inventory_help: { 
    en: 'View all stock. Use Physical Audit to reconcile software stock with floor stock.', 
    bn: 'সমস্ত স্টক দেখুন। সফটওয়্যার স্টকের সাথে ফ্লোর স্টক মিলানোর জন্য ফিজিক্যাল অডিট ব্যবহার করুন।', 
    ar: 'عرض كل المخزون. استخدم التدقيق الفعلي لمطابقة مخزون البرنامج مع مخزون المتجر.', 
    hi: 'সভি স্টক দেখেঁ। সফ্টবেয়ার স্টক কো ফ্লোর স্টক কে সাথ মিলানে কে লিয়ে ভৌতিক অডিট কা উপয়োগ করেঁ।' 
  },
  sales_help: {
    en: 'Track and manage your sales history. View invoices and handle returns efficiently.',
    bn: 'আপনার বিক্রয় ইতিহাস ট্র্যাক এবং পরিচালনা করুন। ইনভয়েস দেখুন এবং দক্ষতার সাথে রিটার্ন পরিচালনা করুন।',
    ar: 'تتبع وإدارة سجل مبيعاتك. عرض الفواتير والتعامل مع المرتجعات بكفاءة.',
    hi: 'আপনে বিক্রী ইতিহাস কো ট্র্যাক ঔর প্রবন্ধীত করেঁ। চালান দেখেঁ ঔর রিটার্ন কো কুশলতাপুর্বক সংভালেঁ।'
  },
  purchases_help: {
    en: 'Manage supplier purchases and stock intake. Track pending orders and returns.',
    bn: 'সরবরাহকারী ক্রয় এবং স্টক গ্রহণ পরিচালনা করুন। মুলতুবি অর্ডার এবং রিটার্ন ট্র্যাক করুন।',
    ar: 'إدارة مشتريات الموردين واستلام المخزون. تتبع الطلبات المعلقة والمرتجعات.',
    hi: 'আপূর্তিকর্তা খরীদ ঔর স্টক সেবন কা প্রবন্ধন করেঁ। লন্বীত অর্ডার ঔর রিটার্ন কো ট্র্যাক করেঁ।'
  },
  accounting_help: {
    en: 'Monitor financial health. View ledgers, manage dues, and track expenses here.',
    bn: 'আর্থিক অবস্থা পর্যবেক্ষণ করুন। এখানে লেজার দেখুন, বকেয়া পরিচালনা করুন এবং খরচ ট্র্যাক করুন।',
    ar: 'مراقبة الصحة المالية. عرض دفاتر الأستاذ وإدارة الديون وتتبع المصاريف هنا.',
    hi: 'বিত্তীয় স্বাস্থ্য কী নিগরানী করেঁ। য়হাঁ বহীখাতা দেখেঁ, বকায়া প্রবন্ধীত করেঁ ঔর খর্চোং কো ট্র্যাক করেঁ।'
  },
  contacts_help: {
    en: 'Manage your customers and suppliers. View their history and balances easily.',
    bn: 'আপনার গ্রাহক এবং সরবরাহকারীদের পরিচালনা করুন। সহজেই তাদের ইতিহাস এবং ব্যালেন্স দেখুন।',
    ar: 'إدارة عملائك ومورديك. عرض سجلهم وأرصدتهم بسهولة.',
    hi: 'আপনে গ্রাহকোং ঔর আপূর্তিকর্তাওং কো প্রবন্ধীত করেঁ। উনকা ইতিহাস ঔর শেষ রাশি আসানী সে দেখেঁ।'
  },
  stolen_help: {
    en: 'Check IMEI against stolen registry to ensure device legitimacy before purchase.',
    bn: 'ক্রয় করার আগে ডিভাইসের বৈধতা নিশ্চিত করতে চুরি হওয়া রেজিস্ট্রির সাথে IMEI যাচাই করুন।',
    ar: 'تحقق من IMEI مقابل سجل المسروقات لضمان شرعية الجهاز قبل الشراء.',
    hi: 'খরীদনে সে পহলে ডিভাইস কী বৈধতা সুনিশ্চীত করার কে লিয়ে চোরী কী রেজিস্ট্রী কে খিলাফ IMEI কী জাঁচ করেঁ।'
  },
  settings_help: {
    en: 'Configure company details, user roles, and system preferences for your business.',
    bn: 'আপনার ব্যবসার জন্য কোম্পানির বিবরণ, ব্যবহারকারীর ভূমিকা এবং সিস্টেম পছন্দগুলি কনফিগার করুন।',
    ar: 'تكوين تفاصيل الشركة وأدوار المستخدمين وتفضيلات النظام لعملك.',
    hi: 'আপনে ব্যবসায় কে লিয়ে কংপনী বিবরণ, উপয়োগকর্তা ভূমিকাএঁ ঔর সিস্টেম প্রাথমিকেতাএঁ কনফিগুর করেঁ।'
  },
  animated_demo: { en: 'Animated Demo', bn: 'অ্যানিমেটেড ডেমো', ar: 'عرض توضيحي متحرك', hi: 'এনিমেশড ডেমো' },
  how_to_use: { en: 'How to use', bn: 'কিভাবে ব্যবহার করবেন', ar: 'كيفية الاستخدام', hi: 'কৈসে উপয়োগ করেঁ' },
  contextual_guideline: { en: 'Contextual Guideline', bn: 'প্রাসঙ্গিক গাইডলাইন', ar: 'إرشادات سياقية', hi: 'প্রাসঙ্গিক দিশানির্দেশ' },


  // Common Labels
  name: { en: 'Name', bn: 'নাম', ar: 'الاسم', hi: 'নাম' },
  phone: { en: 'Phone', bn: 'ফোন', ar: 'الهاتف', hi: 'ফোন' },
  email: { en: 'Email', bn: 'ইমেইল', ar: 'البريد الإلكتروني', hi: 'ইমেল' },
  address: { en: 'Address', bn: 'ঠিকানা', ar: 'العنوان', hi: 'পতা' },
  date: { en: 'Date', bn: 'তারিখ', ar: 'التاريخ', hi: 'তારીખ' },
  status: { en: 'Status', bn: 'স্ট্যাটাস', ar: 'الحالة', hi: 'স্থিতী' },
  total: { en: 'Total', bn: 'মোট', ar: 'الإجمالي', hi: 'কুল' },
  amount: { en: 'Amount', bn: 'পরিমাণ', ar: 'المبلغ', hi: 'রাশি' },
  action: { en: 'Action', bn: 'অ্যাকশন', ar: 'إجراء', hi: 'কার্রবাঈ' },
  remarks: { en: 'Remarks', bn: 'মন্তব্য', ar: 'ملاحظات', hi: 'টিপ্পণী' },
  invoice_no: { en: 'Invoice No', bn: 'ইনভয়েস নং', ar: 'رقم الفاتورة', hi: 'চালান সংখ্যা' },
  description: { en: 'Description', bn: 'বর্ণনা', ar: 'الوصف', hi: 'বিবরণ' },
  logout: { en: 'Logout Account', bn: 'লগআউট করুন', ar: 'تسجيل الخروج', hi: 'লগআউট' },
  switch_theme: { en: 'Switch Theme', bn: 'থিম পরিবর্তন করুন', ar: 'تغيير المظهر', hi: 'থীম বদলেঁ' },
  search_failed: { en: 'Search failed', bn: 'অনুসন্ধান ব্যর্থ হয়েছে', ar: 'فشل البحث', hi: 'খোজ বিফল' },
  no_record_found: { en: 'No record found for:', bn: 'কোন রেকর্ড পাওয়া যায়নি:', ar: 'لم يتم العثور على سجل لـ:', hi: 'ইস্কে লিয়ে কোঈ রেকর্ড নহীং মিলা:' },
  license_expiry_warning: { en: 'License expiring in less than 3 days. Please renew to avoid service disruption.', bn: 'লাইসেন্সের মেয়াদ ৩ দিনের কম সময়ের মধ্যে শেষ হয়ে যাবে। পরিষেবা বিঘ্নিত এড়াতে দয়া করে নবায়ন করুন।', ar: 'تنتهي صلاحية الترخيص في أقل من 3 أيام. يرجى التجديد لتجنب انقطاع الخدمة.', hi: 'লাইসেন্স 3 দিনোং সে কম সময় মেঁ সংাপ্ত হো রহা হ্যায়। সেবা মেঁ ব্যবধান সে বচনে কে লিয়ে কৃপয়া নবীনীকরণ করেঁ।' },

  // Placeholders
  search_placeholder: { en: 'Search anything...', bn: 'যেকোনো কিছু খুঁজুন...', ar: 'ابحث عن أي شيء...', hi: 'কুছ ভী খোজেন...' },
  imei_placeholder: { en: 'Scan or enter IMEI...', bn: 'আইএমইআই স্ক্যান বা লিখুন...', ar: 'امسح أو أدخل IMEI...', hi: 'IMEI স্ক্যান করেঁ ইয়া দর্জ করেঁ...' },
  phone_placeholder: { en: 'Enter phone number', bn: 'ফোন নম্বর লিখুন', ar: 'أدخل رقم الهاتف', hi: 'ফোন নম্বর দর্জ করেঁ' },
  name_placeholder: { en: 'Enter full name', bn: 'পুরো নাম লিখুন', ar: 'أدخل الاسم الكامل', hi: 'পুরা নাম দর্জ করেঁ' },
  address_placeholder: { en: 'Enter address', bn: 'ঠিকানা লিখুন', ar: 'أدخل العنوان', hi: 'পতা দর্জ করেঁ' },

  // Actions
  add_new: { en: 'Add New', bn: 'নতুন যোগ করুন', ar: 'إضافة جديد', hi: 'নয়ा জোড়েঁ' },
  save: { en: 'Save', bn: 'সংরক্ষণ করুন', ar: 'حفظ', hi: 'সহেজেন' },
  cancel: { en: 'Cancel', bn: 'বাতিল করুন', ar: 'إلغاء', hi: 'রদ্দ করেঁ' },
  edit: { en: 'Edit', bn: 'সম্পাদনা', ar: 'تعديل', hi: 'সংপাদন' },
  delete: { en: 'Delete', bn: 'মুছে ফেলুন', ar: 'حذف', hi: 'মিটাএঁ' },
  print: { en: 'Print', bn: 'প্রিন্ট', ar: 'طباعة', hi: 'প্রিন্ট' },
  search: { en: 'Search', bn: 'অনুসন্ধান', ar: 'بحث', hi: 'খোজ' },
  physical_audit: { en: 'Physical Audit', bn: 'ফিজিক্যাল অডিট', ar: 'التدقيق الفعلي', hi: 'ভৌতিক অডিট' },

  // Tutorial
  start_tour: { en: 'Start Tour', bn: 'ট্যুর শুরু করুন', ar: 'بدء الجولة', hi: 'দৌরা শুরু করেঁ' },
  next: { en: 'Next', bn: 'পরবর্তী', ar: 'التالي', hi: 'অগলা' },
  prev: { en: 'Prev', bn: 'পূর্ববর্তী', ar: 'السابق', hi: 'পিছলা' },
  finish: { en: 'Finish', bn: 'শেষ', ar: 'إنهاء', hi: 'সংাপ্ত' },
  loading: { en: 'Loading...', bn: 'লোড হচ্ছে...', ar: 'جارٍ التحميل...', hi: 'লোড হো রহা হ্যায়...' },
  staff_role: { en: 'Staff', bn: 'স্টাফ', ar: 'موظف', hi: 'কর্মচারী' },
  };



export const languageNames: Record<Language, { name: string; native: string; dir: 'ltr' | 'rtl' }> = {
  en: { name: 'English', native: 'English', dir: 'ltr' },
  bn: { name: 'Bangla', native: 'বাংলা', dir: 'ltr' },
  ar: { name: 'Arabic', native: 'العربية', dir: 'rtl' },
  hi: { name: 'Hindi', native: 'हिन्दी', dir: 'ltr' },
};
