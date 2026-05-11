import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Package, Users, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const stats = [
    { title: "Today's Sales", value: "৳ 124,500", icon: ShoppingCart, color: "text-blue-600", bg: "bg-blue-100" },
    { title: "Items in Stock", value: "482", icon: Package, color: "text-green-600", bg: "bg-green-100" },
    { title: "Total Customers", value: "1,204", icon: Users, color: "text-purple-600", bg: "bg-purple-100" },
    { title: "Monthly Profit", value: "৳ 32,800", icon: TrendingUp, color: "text-orange-600", bg: "bg-orange-100" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-slate-500">Welcome back to your mobile store management system.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`${stat.bg} p-2 rounded-md`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-slate-500 mt-1">
                  +12.5% from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Placeholder for charts/recent activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 shadow-sm">
          <CardHeader>
            <CardTitle>Sales Analysis</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center border-t border-dashed">
            <span className="text-slate-400">Sales Chart Placeholder</span>
          </CardContent>
        </Card>
        <Card className="col-span-3 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center border-t border-dashed">
             <span className="text-slate-400">Activity Feed Placeholder</span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
