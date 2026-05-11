"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard, ShoppingCart, Package, Users, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const stats = [
    { title: "Today's Sales", value: "$12,450", icon: ShoppingCart, color: "text-green-600", bg: "bg-green-100" },
    { title: "Stock Value", value: "$450,200", icon: Package, color: "text-blue-600", bg: "bg-blue-100" },
    { title: "New Customers", value: "24", icon: Users, color: "text-purple-600", bg: "bg-purple-100" },
    { title: "Profit Margin", value: "18.5%", icon: TrendingUp, color: "text-orange-600", bg: "bg-orange-100" },
  ];

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome Back, Admin</h1>
        <p className="text-muted-foreground">Here is what's happening in your shop today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-full ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">+4.5% from yesterday</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground py-10 text-center">Charts and detailed reports will appear here.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Models</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground py-10 text-center">Real-time inventory analysis coming soon.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
