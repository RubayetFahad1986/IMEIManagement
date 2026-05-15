import { LayoutDashboard, ShoppingCart, Package, Users, Truck, ShieldAlert, ShieldCheck, BarChart3, Settings, LogOut, Building2, UserCircle, History, PlusSquare, BookOpen, Contact, Smartphone, UserCog, Undo2, Repeat, Wallet, UserPlus, Hash } from "lucide-react";

export interface MenuItem {
  name: string;
  href: string;
  icon: any;
  roles?: string[];
}

export interface MenuGroup {
  group: string;
  items: MenuItem[];
}

export const getMenuItems = (t: (key: string) => string): MenuGroup[] => [
  { group: t("general"), items: [
    { name: t("dashboard"), href: "/dashboard", icon: LayoutDashboard },
    { name: t("pos_sale"), href: "/pos", icon: ShoppingCart },
    { name: t("master_product_list"), href: "/settings/products", icon: Package },
    { name: t("inventory"), href: "/inventory", icon: Smartphone },
    { name: t("branch_transfers"), href: "/inventory/transfers", icon: Repeat, roles: ["SuperAdmin", "CompanyAdmin", "Admin"] },
  ]},
  { group: t("transactions"), items: [
    { name: t("sales_history"), href: "/sales", icon: History },
    { name: t("sales_returns"), href: "/sales/returns", icon: Undo2 },
    { name: t("purchases"), href: "/purchases", icon: PlusSquare },
    { name: t("purchase_returns"), href: "/purchases/returns", icon: Undo2 },
  ]},
  { group: t("accounting"), items: [
    { name: t("daily_transactions"), href: "/accounting/daily", icon: Wallet, roles: ["SuperAdmin", "CompanyAdmin", "Admin"] },
    { name: t("general_ledger"), href: "/accounting/ledger", icon: BarChart3, roles: ["SuperAdmin", "CompanyAdmin", "Admin"] },
    { name: t("contact_ledger"), href: "/accounting/contact-ledger", icon: Contact, roles: ["SuperAdmin", "CompanyAdmin", "Admin"] },
    { name: t("due_management"), href: "/accounting/due-management", icon: Wallet, roles: ["SuperAdmin", "CompanyAdmin", "Admin"] },
    { name: t("expenses"), href: "/accounting/expenses", icon: Building2 },
    { name: t("chart_of_accounts"), href: "/settings/accounts", icon: BookOpen, roles: ["SuperAdmin", "CompanyAdmin"] },
  ]},
  { group: t("people"), items: [
    { name: t("contacts"), href: "/contacts", icon: Contact },
    { name: t("staff"), href: "/staff", icon: UserCircle, roles: ["SuperAdmin", "CompanyAdmin", "Admin"] },
    { name: t("user_management"), href: "/settings/users", icon: UserCog, roles: ["SuperAdmin", "CompanyAdmin"] },
  ]},
  { group: t("security"), items: [
    { name: t("stolen_registry"), href: "/stolen-check", icon: ShieldAlert },
    { name: t("reseller_management"), href: "/reseller", icon: Building2, roles: ["SuperAdmin", "Reseller"] },
  ]},
  { group: t("system"), items: [
    { name: t("reports"), href: "/reports", icon: BarChart3 },
    { name: t("subscription_management"), href: "/settings/subscriptions", icon: ShieldCheck, roles: ["SuperAdmin"] },
    { name: t("reseller_management"), href: "/settings/resellers", icon: UserPlus, roles: ["SuperAdmin"] },
    { name: t("sample_data_seeder"), href: "/settings/sample-data", icon: PlusSquare, roles: ["SuperAdmin", "CompanyAdmin"] },
    { name: t("document_sequences"), href: "/settings/sequences", icon: Hash, roles: ["SuperAdmin", "CompanyAdmin"] },
    { name: t("company_settings"), href: "/settings/company", icon: Settings, roles: ["SuperAdmin", "CompanyAdmin"] },
  ]}
];
