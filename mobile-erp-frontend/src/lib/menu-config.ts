import { LayoutDashboard, ShoppingCart, Package, Users, Truck, ShieldAlert, BarChart3, Settings, LogOut, Building2, UserCircle } from "lucide-react";

export const MENU_ITEMS = [
  { group: "General", items: [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "POS / Sale", href: "/pos", icon: ShoppingCart },
    { name: "Inventory", href: "/inventory", icon: Package },
  ]},
  { group: "Accounting", items: [
    { name: "Ledgers", href: "/accounting/ledgers", icon: BarChart3 },
    { name: "Expenses", href: "/accounting/expenses", icon: Building2 },
  ]},
  { group: "People", items: [
    { name: "Customers", href: "/customers", icon: Users },
    { name: "Suppliers", href: "/suppliers", icon: Truck },
    { name: "Staff", href: "/staff", icon: UserCircle },
  ]},
  { group: "Security", items: [
    { name: "Stolen Registry", href: "/stolen-check", icon: ShieldAlert },
  ]},
  { group: "System", items: [
    { name: "Settings", href: "/settings/company", icon: Settings },
  ]}
];
