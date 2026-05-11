import { LayoutDashboard, ShoppingCart, Package, Users, Truck, ShieldAlert, BarChart3, Settings, LogOut, Building2, UserCircle, History, PlusSquare, BookOpen, Contact, Smartphone, UserCog } from "lucide-react";

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
  ]},
  { group: "Transactions", items: [
    { name: "Sales History", href: "/sales", icon: History },
    { name: "Purchases", href: "/purchases", icon: PlusSquare },
  ]},
  { group: "Accounting", items: [
    { name: "Ledgers", href: "/accounting/ledgers", icon: BarChart3, roles: ["SuperAdmin", "CompanyAdmin", "Admin"] },
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
  ]},
  { group: "System", items: [
    { name: "Company Settings", href: "/settings/company", icon: Settings, roles: ["SuperAdmin", "CompanyAdmin"] },
  ]}
];
