import { LayoutDashboard, ShoppingCart, Package, Users, Truck, ShieldAlert, BarChart3, Settings, LogOut, Building2, UserCircle, History, PlusSquare, BookOpen, Contact, Smartphone } from "lucide-react";

export const MENU_ITEMS = [
  { group: "General", items: [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "POS / Sale", href: "/pos", icon: ShoppingCart },
    { name: "Product Catalog", href: "/settings/products", icon: Package },
    { name: "Inventory", href: "/inventory", icon: Smartphone },
  ]},
  { group: "Transactions", items: [
    { name: "Sales History", href: "/sales", icon: History },
    { name: "Purchases", href: "/purchases", icon: PlusSquare },
  ]},
  { group: "Accounting", items: [
    { name: "Ledgers", href: "/accounting/ledgers", icon: BarChart3 },
    { name: "Expenses", href: "/accounting/expenses", icon: Building2 },
    { name: "Chart of Accounts", href: "/settings/accounts", icon: BookOpen },
  ]},
  { group: "People", items: [
    { name: "Contacts", href: "/contacts", icon: Contact },
    { name: "Staff", href: "/staff", icon: UserCircle },
  ]},
  { group: "Security", items: [
    { name: "Stolen Registry", href: "/stolen-check", icon: ShieldAlert },
  ]},
  { group: "System", items: [
    { name: "Settings", href: "/settings/company", icon: Settings },
  ]}
];
