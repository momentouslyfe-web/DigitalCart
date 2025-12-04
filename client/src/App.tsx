import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Products from "@/pages/products";
import ProductForm from "@/pages/product-form";
import CheckoutPages from "@/pages/checkout-pages";
import CheckoutPageForm from "@/pages/checkout-page-form";
import PageEditor from "@/pages/page-editor";
import Orders from "@/pages/orders";
import Customers from "@/pages/customers";
import Coupons from "@/pages/coupons";
import EmailTemplates from "@/pages/email-templates";
import Analytics from "@/pages/analytics";
import Settings from "@/pages/settings";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/products" component={Products} />
      <Route path="/products/new" component={ProductForm} />
      <Route path="/products/:id" component={ProductForm} />
      <Route path="/checkout-pages" component={CheckoutPages} />
      <Route path="/checkout-pages/new" component={CheckoutPageForm} />
      <Route path="/checkout-pages/:id/editor" component={PageEditor} />
      <Route path="/orders" component={Orders} />
      <Route path="/customers" component={Customers} />
      <Route path="/coupons" component={Coupons} />
      <Route path="/email-templates" component={EmailTemplates} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppLayout() {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex flex-col flex-1 overflow-hidden">
          <header className="flex h-14 items-center justify-between gap-4 border-b px-4 shrink-0">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto p-6">
            <Router />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <AppLayout />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
