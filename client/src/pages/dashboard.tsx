import { useQuery } from "@tanstack/react-query";
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  conversionRate: number;
  revenueChange: number;
  ordersChange: number;
  customersChange: number;
  conversionChange: number;
  revenueByDay: { date: string; revenue: number }[];
  topProducts: { name: string; sales: number; revenue: number }[];
  recentOrders: { id: string; customer: string; amount: number; status: string; date: string }[];
}

function StatCard({
  title,
  value,
  change,
  icon: Icon,
  prefix = "",
  isLoading = false,
}: {
  title: string;
  value: number | string;
  change: number;
  icon: React.ComponentType<{ className?: string }>;
  prefix?: string;
  isLoading?: boolean;
}) {
  const isPositive = change >= 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-20" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold" data-testid={`stat-${title.toLowerCase().replace(/\s+/g, "-")}`}>
          {prefix}{typeof value === "number" ? value.toLocaleString() : value}
        </div>
        <div className="flex items-center gap-1 mt-1">
          {isPositive ? (
            <ArrowUpRight className="h-4 w-4 text-green-600" />
          ) : (
            <ArrowDownRight className="h-4 w-4 text-red-600" />
          )}
          <span className={`text-sm ${isPositive ? "text-green-600" : "text-red-600"}`}>
            {isPositive ? "+" : ""}{change}%
          </span>
          <span className="text-sm text-muted-foreground">vs last month</span>
        </div>
      </CardContent>
    </Card>
  );
}

function RevenueChart({ data, isLoading }: { data: { date: string; revenue: number }[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <Card className="col-span-full lg:col-span-2">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle>Revenue Overview</CardTitle>
        <CardDescription>Your revenue performance over the last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" opacity={0.3} />
              <XAxis
                dataKey="date"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground"
              />
              <YAxis
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
                className="text-muted-foreground"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function TopProductsChart({ data, isLoading }: { data: { name: string; sales: number; revenue: number }[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Products</CardTitle>
        <CardDescription>Best selling products this month</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" opacity={0.3} horizontal={false} />
              <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                dataKey="name"
                type="category"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={100}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [value, "Sales"]}
              />
              <Bar
                dataKey="sales"
                fill="hsl(var(--primary))"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function RecentOrdersTable({ data, isLoading }: { data: { id: string; customer: string; amount: number; status: string; date: string }[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "pending":
        return "secondary";
      case "failed":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
        <CardDescription>Your latest sales activity</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4 text-sm font-medium text-muted-foreground pb-2 border-b">
            <div>Order ID</div>
            <div>Customer</div>
            <div>Amount</div>
            <div>Status</div>
          </div>
          {data.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No orders yet</p>
              <p className="text-sm">Orders will appear here once customers make purchases</p>
            </div>
          ) : (
            data.map((order) => (
              <div key={order.id} className="grid grid-cols-4 gap-4 items-center text-sm" data-testid={`order-row-${order.id}`}>
                <div className="font-medium">#{order.id.slice(0, 8)}</div>
                <div className="text-muted-foreground">{order.customer}</div>
                <div className="font-medium">${order.amount.toFixed(2)}</div>
                <div>
                  <Badge variant={getStatusVariant(order.status)}>
                    {order.status}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { data, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics"],
  });

  const defaultData: AnalyticsData = {
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    conversionRate: 0,
    revenueChange: 0,
    ordersChange: 0,
    customersChange: 0,
    conversionChange: 0,
    revenueByDay: [],
    topProducts: [],
    recentOrders: [],
  };

  const analytics = data || defaultData;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here's an overview of your store.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={analytics.totalRevenue.toFixed(2)}
          change={analytics.revenueChange}
          icon={DollarSign}
          prefix="$"
          isLoading={isLoading}
        />
        <StatCard
          title="Orders"
          value={analytics.totalOrders}
          change={analytics.ordersChange}
          icon={ShoppingCart}
          isLoading={isLoading}
        />
        <StatCard
          title="Customers"
          value={analytics.totalCustomers}
          change={analytics.customersChange}
          icon={Users}
          isLoading={isLoading}
        />
        <StatCard
          title="Conversion Rate"
          value={`${analytics.conversionRate.toFixed(1)}%`}
          change={analytics.conversionChange}
          icon={TrendingUp}
          isLoading={isLoading}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <RevenueChart data={analytics.revenueByDay} isLoading={isLoading} />
        <TopProductsChart data={analytics.topProducts} isLoading={isLoading} />
      </div>

      <RecentOrdersTable data={analytics.recentOrders} isLoading={isLoading} />
    </div>
  );
}
