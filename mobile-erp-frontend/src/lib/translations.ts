export type Language = 'en' | 'bn' | 'ar' | 'hi';

export interface Translations {
  [key: string]: {
    [key in Language]: string;
  };
}

export const translations: Translations = {
  // Groups
  general: { en: 'General', bn: 'সাধারণ', ar: 'عام', hi: 'सामान्य' },
  transactions: { en: 'Transactions', bn: 'লেনদেন', ar: 'المعاملات', hi: 'लेनदेन' },
  people: { en: 'People', bn: 'ব্যক্তি', ar: 'الأشخاص', hi: 'लोग' },
  security: { en: 'Security', bn: 'নিরাপত্তা', ar: 'الأمن', hi: 'सुरक्षा' },
  system: { en: 'System', bn: 'সিস্টেম', ar: 'النظام', hi: 'सिस्टम' },
  accounting: { en: 'Accounting', bn: 'অ্যাকাউন্টিং', ar: 'المحاسبة', hi: 'लेखांकन' },

  // Menu Items
  dashboard: { en: 'Dashboard', bn: 'ড্যাশবোর্ড', ar: 'لوحة القيادة', hi: 'डैशबोर्ड' },
  pos_sale: { en: 'POS / Sale', bn: 'পস / বিক্রয়', ar: 'نقطة البيع / البيع', hi: 'पीओएस / बिक्री' },
  master_product_list: { en: 'Master Product List', bn: 'মাস্টার প্রোডাক্ট লিস্ট', ar: 'قائمة المنتجات الرئيسية', hi: 'मास्टर उत्पाद सूची' },
  inventory: { en: 'Inventory', bn: 'ইনভেন্টরি', ar: 'المخزون', hi: 'ইन्वেন্টरी' },
  branch_transfers: { en: 'Branch Transfers', bn: 'ব্রাঞ্চ ট্রান্সফার', ar: 'تحويلات الفروع', hi: 'शाखा स्थानान्तरण' },
  sales_history: { en: 'Sales History', bn: 'বিক্রয় ইতিহাস', ar: 'সجل المبيعات', hi: 'बिक्री इतिहास' },
  sales_returns: { en: 'Sales Returns', bn: 'বিক্রয় ফেরত', ar: 'مرتجعات المبيعات', hi: 'बिक्री वापसी' },
  purchases: { en: 'Purchases', bn: 'ক্রয়', ar: 'المشتريات', hi: 'खरीदारी' },
  purchase_returns: { en: 'Purchase Returns', bn: 'ক্রয় ফেরত', ar: 'مرتجعات المشتريات', hi: 'खरीद वापसी' },
  daily_transactions: { en: 'Daily Transactions', bn: 'দৈনিক লেনদেন', ar: 'المعاملات اليومية', hi: 'दैनिक लेनदेन' },
  general_ledger: { en: 'General Ledger', bn: 'জেনারেল লেজার', ar: 'دفتر الأستاذ العام', hi: 'सामान्य बही' },
  contact_ledger: { en: 'Contact Ledger', bn: 'কন্টাক্ট লেজার', ar: 'دفتر جهات الاتصال', hi: 'संपর্ক बही' },
  due_management: { en: 'Due Management', bn: 'বাকি ম্যানেজমেন্ট', ar: 'إدارة الديون', hi: 'बकाया प्रबंधन' },
  expenses: { en: 'Expenses', bn: 'খরচ', ar: 'المصاريف', hi: 'खर्च' },
  chart_of_accounts: { en: 'Chart of Accounts', bn: 'হিসাবের তালিকা', ar: 'شجرة الحسابات', hi: 'खातों का चार्ट' },
  contacts: { en: 'Contacts', bn: 'কন্টাক্টস', ar: 'جهات الاتصال', hi: 'संपর্ক' },
  staff: { en: 'Staff', bn: 'স্টাফ', ar: 'الموظفون', hi: 'कर्मचारी' },
  user_management: { en: 'User Management', bn: 'ইউজার ম্যানেজমেন্ট', ar: 'إدارة المستخدمين', hi: 'उपयोगकर्ता प्रबंधन' },
  stolen_registry: { en: 'Stolen Registry', bn: 'চুরি রেজিস্ট্রি', ar: 'সجل المسروقات', hi: 'चोरी की रजिस्ट्री' },
  subscription_management: { en: 'Subscription Management', bn: 'সাবস্ক্রিপশন ম্যানেজমেন্ট', ar: 'إدارة الاشتراكات', hi: 'सदस्यता प्रबंधन' },
  reports: { en: 'Reports', bn: 'রিপোর্ট', ar: 'التقارير', hi: 'रिपोर्ट' },
  sample_data_seeder: { en: 'Sample Data Seeder', bn: 'স্যাম্পল ডাটা সিডার', ar: 'مغذي بيانات العينة', hi: 'नमूना डेटा फीडर' },
  company_settings: { en: 'Company Settings', bn: 'কোম্পানি সেটিংস', ar: 'إعدادات الشركة', hi: 'कंपनी সেটिंग्स' },

  // Help & Guidelines
  help_guide: { en: 'Help Guide', bn: 'সাহায্য গাইড', ar: 'دليل المساعدة', hi: 'सहायता गाइड' },
  dashboard_help: { 
    en: 'Quick view of your business health. Monitor sales and stock levels.', 
    bn: 'আপনার ব্যবসার স্বাস্থ্যের দ্রুত দৃশ্য। বিক্রয় এবং স্টক লেভেল পর্যবেক্ষণ করুন।', 
    ar: 'نظرة سريعة على صحة عملك. مراقبة المبيعات ومستويات المخزون.', 
    hi: 'आपके व्यवसाय के स्वास्थ्य का त्वरित दृश्य। बिक्री और स्टॉक स्तर की निगरानी करें।' 
  },
  pos_help: { 
    en: 'Process sales here. Use F2 to search, F8 to finish. Scan IMEI for mobile phones.', 
    bn: 'এখানে বিক্রয় প্রক্রিয়া সম্পন্ন করুন। অনুসন্ধানের জন্য F2, শেষ করার জন্য F8 ব্যবহার করুন। মোবাইলের জন্য IMEI স্ক্যান করুন।', 
    ar: 'معالجة المبيعات هنا. استخدم F2 للبحث، F8 للإنهاء. امسح IMEI للهواتف المحمولة.', 
    hi: 'यहाँ बिक्री की प्रक्रिया करें। खोजने के लिए F2, समाप्त करने के लिए F8 का उपयोग करें। मोबाइल फोन के लिए IMEI स्कैन करें।' 
  },
  inventory_help: { 
    en: 'View all stock. Use Physical Audit to reconcile software stock with floor stock.', 
    bn: 'সমস্ত স্টক দেখুন। সফটওয়্যার স্টকের সাথে ফ্লোর স্টক মিলানোর জন্য ফিজিক্যাল অডিট ব্যবহার করুন।', 
    ar: 'عرض كل المخزون. استخدم التدقيق الفعلي لمطابقة مخزون البرنامج مع مخزون المتجر.', 
    hi: 'सभी स्टॉक देखें। सॉफ्टवेयर स्टॉक को फ्लोर स्टॉक के साथ मिलाने के लिए भौतिक ऑडिट का उपयोग करें।' 
  },
  sales_help: {
    en: 'Track and manage your sales history. View invoices and handle returns efficiently.',
    bn: 'আপনার বিক্রয় ইতিহাস ট্র্যাক এবং পরিচালনা করুন। ইনভয়েস দেখুন এবং দক্ষতার সাথে রিটার্ন পরিচালনা করুন।',
    ar: 'تتبع وإدارة سجل مبيعاتك. عرض الفواتير والتعامل مع المرتجعات بكفاءة.',
    hi: 'अपने बिक्री इतिहास को ट्रैक और प्रबंधित करें। चालान देखें और रिटर्न को कुशलतापूर्वक संभालें।'
  },
  purchases_help: {
    en: 'Manage supplier purchases and stock intake. Track pending orders and returns.',
    bn: 'সরবরাহকারী ক্রয় এবং স্টক গ্রহণ পরিচালনা করুন। মুলতুবি অর্ডার এবং রিটার্ন ট্র্যাক করুন।',
    ar: 'إدارة مشتريات الموردين واستلام المخزون. تتبع الطلبات المعلقة والمرتجعات.',
    hi: 'आपूर्तिकर्ता खरीद और स्टॉक सेवन का प्रबंधन करें। लंबित ऑर्डर और रिटर्न को ट्रैक करें।'
  },
  accounting_help: {
    en: 'Monitor financial health. View ledgers, manage dues, and track expenses here.',
    bn: 'আর্থিক অবস্থা পর্যবেক্ষণ করুন। এখানে লেজার দেখুন, বকেয়া পরিচালনা করুন এবং খরচ ট্র্যাক করুন।',
    ar: 'مراقبة الصحة المالية. عرض دفاتر الأستاذ وإدارة الديون وتتبع المصاريف هنا.',
    hi: 'वित्तीय स्वास्थ्य की निगरानी करें। यहां बहीखाता देखें, बकाया प्रबंधित करें और खर्चों को ट्रैक करें।'
  },
  contacts_help: {
    en: 'Manage your customers and suppliers. View their history and balances easily.',
    bn: 'আপনার গ্রাহক এবং সরবরাহকারীদের পরিচালনা করুন। সহজেই তাদের ইতিহাস এবং ব্যালেন্স দেখুন।',
    ar: 'إدارة عملائك ومورديك. عرض سجلهم وأرصدتهم بسهولة.',
    hi: 'अपने ग्राहकों और आपूर्तिकर्ताओं को प्रबंधित करें। उनका इतिहास और शेष राशि आसानी से देखें।'
  },
  stolen_help: {
    en: 'Check IMEI against stolen registry to ensure device legitimacy before purchase.',
    bn: 'ক্রয় করার আগে ডিভাইসের বৈধতা নিশ্চিত করতে চুরি হওয়া রেজিস্ট্রির সাথে IMEI যাচাই করুন।',
    ar: 'تحقق من IMEI مقابل سجل المسروقات لضمان شرعية الجهاز قبل الشراء.',
    hi: 'खरीदने से पहले डिवाइस की वैधता सुनिश्चित करने के लिए चोरी की रजिस्ट्री के खिलाफ IMEI की जांच करें।'
  },
  settings_help: {
    en: 'Configure company details, user roles, and system preferences for your business.',
    bn: 'আপনার ব্যবসার জন্য কোম্পানির বিবরণ, ব্যবহারকারীর ভূমিকা এবং সিস্টেম পছন্দগুলি কনফিগার করুন।',
    ar: 'تكوين تفاصيل الشركة وأدوار المستخدمين وتفضيلات النظام لعملك.',
    hi: 'अपने व्यवसाय के लिए कंपनी विवरण, उपयोगकर्ता भूमिकाएं और सिस्टम प्राथमिकताएं कॉन्फ़िगर करें।'
  },
  animated_demo: { en: 'Animated Demo', bn: 'অ্যানিমেটেড ডেমো', ar: 'عرض توضيحي متحرك', hi: 'एनिमेटेड डेमो' },
  how_to_use: { en: 'How to use', bn: 'কিভাবে ব্যবহার করবেন', ar: 'كيفية الاستخدام', hi: 'कैसे उपयोग करें' },
  contextual_guideline: { en: 'Contextual Guideline', bn: 'প্রাসঙ্গিক গাইডলাইন', ar: 'إرشادات سياقية', hi: 'प्रासंगिक दिशानिर्देश' },


  // Common Labels
  name: { en: 'Name', bn: 'নাম', ar: 'الاسم', hi: 'नाम' },
  phone: { en: 'Phone', bn: 'ফোন', ar: 'الهاتف', hi: 'फोन' },
  email: { en: 'Email', bn: 'ইমেইল', ar: 'البريد الإلكتروني', hi: 'ইমেল' },
  address: { en: 'Address', bn: 'ঠিকানা', ar: 'العنوان', hi: 'पता' },
  date: { en: 'Date', bn: 'তারিখ', ar: 'التاريخ', hi: 'तারিখ' },
  status: { en: 'Status', bn: 'স্ট্যাটাস', ar: 'الحالة', hi: 'स्थिति' },
  total: { en: 'Total', bn: 'মোট', ar: 'الإجمالي', hi: 'कुल' },
  amount: { en: 'Amount', bn: 'পরিমাণ', ar: 'المبلغ', hi: 'राशि' },
  action: { en: 'Action', bn: 'অ্যাকশন', ar: 'إجراء', hi: 'কার্রवाई' },
  remarks: { en: 'Remarks', bn: 'মন্তব্য', ar: 'ملاحظات', hi: 'टिপূণী' },
  invoice_no: { en: 'Invoice No', bn: 'ইনভয়েস নং', ar: 'رقم الفاتورة', hi: 'चालान संख्या' },
  description: { en: 'Description', bn: 'বর্ণনা', ar: 'الوصف', hi: 'विवরণ' },
  logout: { en: 'Logout Account', bn: 'লগআউট করুন', ar: 'تسجيل الخروج', hi: 'लॉगआउट' },
  switch_theme: { en: 'Switch Theme', bn: 'থিম পরিবর্তন করুন', ar: 'تغيير المظهر', hi: 'थीम बदलें' },
  search_failed: { en: 'Search failed', bn: 'অনুসন্ধান ব্যর্থ হয়েছে', ar: 'فشل البحث', hi: 'खोज विफल' },
  no_record_found: { en: 'No record found for:', bn: 'কোন রেকর্ড পাওয়া যায়নি:', ar: 'لم يتم العثور على سجل لـ:', hi: 'इसके लिए कोई रिकॉर्ड नहीं मिला:' },
  license_expiry_warning: { en: 'License expiring in less than 3 days. Please renew to avoid service disruption.', bn: 'লাইসেন্সের মেয়াদ ৩ দিনের কম সময়ের মধ্যে শেষ হয়ে যাবে। পরিষেবা বিঘ্নিত এড়াতে দয়া করে নবায়ন করুন।', ar: 'تنتهي صلاحية الترخيص في أقل من 3 أيام. يرجى التجديد لتجنب انقطاع الخدمة.', hi: 'लाइसेंस 3 दिनों से कम समय में समाप्त हो रहा है। सेवा में व्यवधान से बचने के लिए कृपया नवीनीकरण करें।' },

  // Placeholders
  search_placeholder: { en: 'Search anything...', bn: 'যেকোনো কিছু খুঁজুন...', ar: 'ابحث عن أي شيء...', hi: 'कुछ भी खोजें...' },
  imei_placeholder: { en: 'Scan or enter IMEI...', bn: 'আইএমইআই স্ক্যান বা লিখুন...', ar: 'امسح أو أدخل IMEI...', hi: 'IMEI स्कैन करें या दर्ज करें...' },
  phone_placeholder: { en: 'Enter phone number', bn: 'ফোন নম্বর লিখুন', ar: 'أدخل رقم الهاتف', hi: 'फ़ोन नंबर दर्ज करें' },
  name_placeholder: { en: 'Enter full name', bn: 'পুরো নাম লিখুন', ar: 'أدخل الاسم الكامل', hi: 'पूरा नाम दर्ज करें' },
  address_placeholder: { en: 'Enter address', bn: 'ঠিকানা লিখুন', ar: 'أدخل العنوان', hi: 'पता दर्ज करें' },

  // Actions
  add_new: { en: 'Add New', bn: 'নতুন যোগ করুন', ar: 'إضافة جديد', hi: 'नया जोड़ें' },
  save: { en: 'Save', bn: 'সংরক্ষণ করুন', ar: 'حفظ', hi: 'सहेजें' },
  cancel: { en: 'Cancel', bn: 'বাতিল করুন', ar: 'إলগাউ', hi: 'রद्द करें' },
  edit: { en: 'Edit', bn: 'সম্পাদনা', ar: 'تعديل', hi: 'संपादन' },
  delete: { en: 'Delete', bn: 'মুছে ফেলুন', ar: 'حذف', hi: 'मिटाएं' },
  print: { en: 'Print', bn: 'প্রিন্ট', ar: 'طباعة', hi: 'প্রিন্ট' },
  search: { en: 'Search', bn: 'অনুসন্ধান', ar: 'بحث', hi: 'খোজ' },
  physical_audit: { en: 'Physical Audit', bn: 'ফিজিক্যাল অডিট', ar: 'التدقيق الفعلي', hi: 'भौतिक ऑडिट' },

  // Tutorial
  start_tour: { en: 'Start Tour', bn: 'ট্যুর শুরু করুন', ar: 'بدء الجولة', hi: 'दौरा शुरू करें' },
  next: { en: 'Next', bn: 'পরবর্তী', ar: 'التالي', hi: 'अगला' },
  prev: { en: 'Prev', bn: 'পূর্ববর্তী', ar: 'السابق', hi: 'पिछला' },
  finish: { en: 'Finish', bn: 'শেষ', ar: 'إنهاء', hi: 'समाप्त' },
  loading: { en: 'Loading...', bn: 'লোড হচ্ছে...', ar: 'جارٍ التحميل...', hi: 'लोड हो रहा है...' },
  settings: { en: 'Settings', bn: 'সেটিংস', ar: 'الإعدادات', hi: 'सेटिंग्स' },
  superadmin: { en: 'Super Admin', bn: 'সুপার এডমিন', ar: 'مدير عام', hi: 'সুপার এডमिन' },
  companyadmin: { en: 'Company Admin', bn: 'কোম্পানি এডমিন', ar: 'مدير الشركة', hi: 'कंपनी এডমিন' },
  admin: { en: 'Admin', bn: 'এডমিন', ar: 'مدير', hi: 'एडमिन' },
  staff_role: { en: 'Staff', bn: 'স্টাফ', ar: 'موظف', hi: 'कर्मचारी' },
  };



export const languageNames: Record<Language, { name: string; native: string; dir: 'ltr' | 'rtl' }> = {
  en: { name: 'English', native: 'English', dir: 'ltr' },
  bn: { name: 'Bangla', native: 'বাংলা', dir: 'ltr' },
  ar: { name: 'Arabic', native: 'العربية', dir: 'rtl' },
  hi: { name: 'Hindi', native: 'हिन्दी', dir: 'ltr' },
};
