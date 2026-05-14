import { LayoutDashboard, ShoppingCart, Package, Users, Truck, ShieldAlert, ShieldCheck, BarChart3, Settings, LogOut, Building2, UserCircle, History, PlusSquare, BookOpen, Contact, Smartphone, UserCog, Undo2, Repeat, Wallet } from "lucide-react";

export interface MenuItem {
  name: string;
  href: string;
  icon: any;
  roles?: string[]; // If omitted, visible to all
}

export interface MenuGroup {
  group: string;
  items: MenuItem[];
}

export const MENU_ITEMS: MenuGroup[] = [
  { group: "General", items: [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "POS / Sale", href: "/pos", icon: ShoppingCart },
    { name: "Master Product List", href: "/settings/products", icon: Package },
    { name: "Inventory", href: "/inventory", icon: Smartphone },
    { name: "Branch Transfers", href: "/inventory/transfers", icon: Repeat, roles: ["SuperAdmin", "CompanyAdmin", "Admin"] },
  ]},
  { group: "Transactions", items: [
    { name: "Sales History", href: "/sales", icon: History },
    { name: "Sales Returns", href: "/sales/returns", icon: Undo2 },
    { name: "Purchases", href: "/purchases", icon: PlusSquare },
    { name: "Purchase Returns", href: "/purchases/returns", icon: Undo2 },
  ]},
  { group: "Accounting", items: [
    { name: "Daily Transactions", href: "/accounting/smart-transaction", icon: Building2, roles: ["SuperAdmin", "CompanyAdmin", "Admin"] },
    { name: "General Ledger", href: "/accounting/ledgers", icon: BarChart3, roles: ["SuperAdmin", "CompanyAdmin", "Admin"] },
    { name: "Contact Ledger", href: "/accounting/contact-ledger", icon: Contact, roles: ["SuperAdmin", "CompanyAdmin", "Admin"] },
    { name: "Due Management", href: "/accounting/due-management", icon: Wallet, roles: ["SuperAdmin", "CompanyAdmin", "Admin"] },
    { name: "Expenses", href: "/accounting/expenses", icon: Building2 },
    { name: "Chart of Accounts", href: "/settings/accounts", icon: BookOpen, roles: ["SuperAdmin", "CompanyAdmin"] },
  ]},
  { group: "People", items: [
    { name: "Contacts", href: "/contacts", icon: Contact },
    { name: "Staff", href: "/staff", icon: UserCircle, roles: ["SuperAdmin", "CompanyAdmin", "Admin"] },
    { name: "User Management", href: "/settings/users", icon: UserCog, roles: ["SuperAdmin", "CompanyAdmin"] },
  ]},
  { group: "Security", items: [
    { name: "Stolen Registry", href: "/stolen-check", icon: ShieldAlert },
    { name: "Reseller Portal", href: "/reseller", icon: Building2, roles: ["SuperAdmin", "Reseller"] },
  ]},
  { group: "System", items: [
    { name: "Subscription Management", href: "/settings/subscriptions", icon: ShieldCheck, roles: ["SuperAdmin"] },
    { name: "Reseller Management", href: "/settings/resellers", icon: UserPlus, roles: ["SuperAdmin"] },
    { name: "Reports", href: "/reports", icon: BarChart3 },
    { name: "Sample Data Seeder", href: "/settings/sample-data", icon: PlusSquare, roles: ["SuperAdmin", "CompanyAdmin"] },
    { name: "Company Settings", href: "/settings/company", icon: Settings, roles: ["SuperAdmin", "CompanyAdmin"] },
  ]}
];
