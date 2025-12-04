import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";

// Demo user ID for development
const DEMO_USER_ID = "demo-user";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Ensure demo user exists
  async function ensureDemoUser() {
    const existing = await storage.getUserByEmail("demo@example.com");
    if (!existing) {
      await storage.createUser({
        email: "demo@example.com",
        password: "demo123",
        businessName: "Demo Store",
      });
    }
  }

  // Get current user ID (demo mode)
  async function getCurrentUserId(): Promise<string> {
    let user = await storage.getUserByEmail("demo@example.com");
    if (!user) {
      user = await storage.createUser({
        email: "demo@example.com",
        password: "demo123",
        businessName: "Demo Store",
      });
    }
    return user.id;
  }

  // ============ Products Routes ============
  app.get("/api/products", async (req, res) => {
    try {
      const userId = await getCurrentUserId();
      const products = await storage.getProducts(userId);
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const userId = await getCurrentUserId();
      const product = await storage.createProduct({
        ...req.body,
        userId,
      });
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  app.patch("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.updateProduct(req.params.id, req.body);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteProduct(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  // ============ Checkout Pages Routes ============
  app.get("/api/checkout-pages", async (req, res) => {
    try {
      const userId = await getCurrentUserId();
      const pages = await storage.getCheckoutPages(userId);
      res.json(pages);
    } catch (error) {
      console.error("Error fetching checkout pages:", error);
      res.status(500).json({ error: "Failed to fetch checkout pages" });
    }
  });

  app.get("/api/checkout-pages/:id", async (req, res) => {
    try {
      const page = await storage.getCheckoutPage(req.params.id);
      if (!page) {
        return res.status(404).json({ error: "Checkout page not found" });
      }
      res.json(page);
    } catch (error) {
      console.error("Error fetching checkout page:", error);
      res.status(500).json({ error: "Failed to fetch checkout page" });
    }
  });

  app.get("/api/checkout-pages/slug/:slug", async (req, res) => {
    try {
      const page = await storage.getCheckoutPageBySlug(req.params.slug);
      if (!page) {
        return res.status(404).json({ error: "Checkout page not found" });
      }
      res.json(page);
    } catch (error) {
      console.error("Error fetching checkout page:", error);
      res.status(500).json({ error: "Failed to fetch checkout page" });
    }
  });

  app.post("/api/checkout-pages", async (req, res) => {
    try {
      const userId = await getCurrentUserId();
      const page = await storage.createCheckoutPage({
        ...req.body,
        userId,
      });
      res.status(201).json(page);
    } catch (error) {
      console.error("Error creating checkout page:", error);
      res.status(500).json({ error: "Failed to create checkout page" });
    }
  });

  app.patch("/api/checkout-pages/:id", async (req, res) => {
    try {
      const page = await storage.updateCheckoutPage(req.params.id, req.body);
      if (!page) {
        return res.status(404).json({ error: "Checkout page not found" });
      }
      res.json(page);
    } catch (error) {
      console.error("Error updating checkout page:", error);
      res.status(500).json({ error: "Failed to update checkout page" });
    }
  });

  app.delete("/api/checkout-pages/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteCheckoutPage(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Checkout page not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting checkout page:", error);
      res.status(500).json({ error: "Failed to delete checkout page" });
    }
  });

  // ============ Coupons Routes ============
  app.get("/api/coupons", async (req, res) => {
    try {
      const userId = await getCurrentUserId();
      const coupons = await storage.getCoupons(userId);
      res.json(coupons);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      res.status(500).json({ error: "Failed to fetch coupons" });
    }
  });

  app.post("/api/coupons", async (req, res) => {
    try {
      const userId = await getCurrentUserId();
      const coupon = await storage.createCoupon({
        ...req.body,
        userId,
      });
      res.status(201).json(coupon);
    } catch (error) {
      console.error("Error creating coupon:", error);
      res.status(500).json({ error: "Failed to create coupon" });
    }
  });

  app.patch("/api/coupons/:id", async (req, res) => {
    try {
      const coupon = await storage.updateCoupon(req.params.id, req.body);
      if (!coupon) {
        return res.status(404).json({ error: "Coupon not found" });
      }
      res.json(coupon);
    } catch (error) {
      console.error("Error updating coupon:", error);
      res.status(500).json({ error: "Failed to update coupon" });
    }
  });

  app.delete("/api/coupons/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteCoupon(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Coupon not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting coupon:", error);
      res.status(500).json({ error: "Failed to delete coupon" });
    }
  });

  app.post("/api/coupons/validate", async (req, res) => {
    try {
      const userId = await getCurrentUserId();
      const { code } = req.body;
      const coupon = await storage.getCouponByCode(code, userId);
      
      if (!coupon) {
        return res.status(404).json({ error: "Coupon not found" });
      }
      
      if (!coupon.isActive) {
        return res.status(400).json({ error: "Coupon is inactive" });
      }
      
      if (coupon.usageLimit && coupon.usedCount && coupon.usedCount >= coupon.usageLimit) {
        return res.status(400).json({ error: "Coupon usage limit reached" });
      }
      
      if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
        return res.status(400).json({ error: "Coupon has expired" });
      }
      
      res.json(coupon);
    } catch (error) {
      console.error("Error validating coupon:", error);
      res.status(500).json({ error: "Failed to validate coupon" });
    }
  });

  // ============ Customers Routes ============
  app.get("/api/customers", async (req, res) => {
    try {
      const userId = await getCurrentUserId();
      const customers = await storage.getCustomers(userId);
      res.json(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ error: "Failed to fetch customers" });
    }
  });

  app.get("/api/customers/:id", async (req, res) => {
    try {
      const customer = await storage.getCustomer(req.params.id);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      console.error("Error fetching customer:", error);
      res.status(500).json({ error: "Failed to fetch customer" });
    }
  });

  // ============ Orders Routes ============
  app.get("/api/orders", async (req, res) => {
    try {
      const userId = await getCurrentUserId();
      const orders = await storage.getOrders(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  // ============ Email Templates Routes ============
  app.get("/api/email-templates", async (req, res) => {
    try {
      const userId = await getCurrentUserId();
      const templates = await storage.getEmailTemplates(userId);
      res.json(templates);
    } catch (error) {
      console.error("Error fetching email templates:", error);
      res.status(500).json({ error: "Failed to fetch email templates" });
    }
  });

  app.post("/api/email-templates", async (req, res) => {
    try {
      const userId = await getCurrentUserId();
      const template = await storage.createEmailTemplate({
        ...req.body,
        userId,
      });
      res.status(201).json(template);
    } catch (error) {
      console.error("Error creating email template:", error);
      res.status(500).json({ error: "Failed to create email template" });
    }
  });

  app.patch("/api/email-templates/:id", async (req, res) => {
    try {
      const template = await storage.updateEmailTemplate(req.params.id, req.body);
      if (!template) {
        return res.status(404).json({ error: "Email template not found" });
      }
      res.json(template);
    } catch (error) {
      console.error("Error updating email template:", error);
      res.status(500).json({ error: "Failed to update email template" });
    }
  });

  app.delete("/api/email-templates/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteEmailTemplate(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Email template not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting email template:", error);
      res.status(500).json({ error: "Failed to delete email template" });
    }
  });

  // ============ Analytics Routes ============
  app.get("/api/analytics", async (req, res) => {
    try {
      const userId = await getCurrentUserId();
      
      // For demo purposes, return mock analytics data
      const mockData = {
        totalRevenue: 12450.00,
        totalOrders: 156,
        totalCustomers: 89,
        conversionRate: 3.2,
        revenueChange: 12.5,
        ordersChange: 8.3,
        customersChange: 15.2,
        conversionChange: 0.4,
        revenueByDay: generateMockRevenueData(),
        topProducts: [
          { name: "Ultimate Ebook Bundle", sales: 45, revenue: 2250 },
          { name: "Marketing Guide", sales: 32, revenue: 1280 },
          { name: "Startup Playbook", sales: 28, revenue: 1400 },
          { name: "Developer Toolkit", sales: 25, revenue: 1250 },
          { name: "Design Templates", sales: 18, revenue: 450 },
        ],
        recentOrders: [],
      };
      
      res.json(mockData);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  app.get("/api/analytics/detailed", async (req, res) => {
    try {
      const userId = await getCurrentUserId();
      
      // For demo purposes, return mock detailed analytics
      const mockData = {
        revenue: {
          total: 12450.00,
          change: 12.5,
          byDay: generateMockRevenueData(),
        },
        orders: {
          total: 156,
          change: 8.3,
          byDay: generateMockOrdersData(),
          byStatus: [
            { status: "completed", count: 142 },
            { status: "pending", count: 8 },
            { status: "refunded", count: 6 },
          ],
        },
        customers: {
          total: 89,
          change: 15.2,
          newByDay: generateMockCustomersData(),
        },
        conversions: {
          rate: 3.2,
          change: 0.4,
          pageViews: 4875,
          checkouts: 312,
          purchases: 156,
        },
        topProducts: [
          { name: "Ultimate Ebook Bundle", sales: 45, revenue: 2250 },
          { name: "Marketing Guide", sales: 32, revenue: 1280 },
          { name: "Startup Playbook", sales: 28, revenue: 1400 },
        ],
        topPages: [
          { name: "Bundle Checkout", views: 1250, conversions: 45 },
          { name: "Marketing Guide", views: 890, conversions: 32 },
          { name: "Startup Offer", views: 720, conversions: 28 },
        ],
      };
      
      res.json(mockData);
    } catch (error) {
      console.error("Error fetching detailed analytics:", error);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  // ============ Settings Routes ============
  app.post("/api/settings/general", async (req, res) => {
    try {
      const userId = await getCurrentUserId();
      const user = await storage.updateUser(userId, {
        businessName: req.body.storeName,
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Error saving settings:", error);
      res.status(500).json({ error: "Failed to save settings" });
    }
  });

  app.post("/api/settings/payment", async (req, res) => {
    try {
      const userId = await getCurrentUserId();
      await storage.updateUser(userId, {
        uddoktapayApiKey: req.body.uddoktapayApiKey,
        uddoktapayApiUrl: req.body.uddoktapayApiUrl,
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Error saving payment settings:", error);
      res.status(500).json({ error: "Failed to save settings" });
    }
  });

  app.post("/api/settings/tracking", async (req, res) => {
    try {
      const userId = await getCurrentUserId();
      await storage.updateUser(userId, {
        facebookPixelId: req.body.fbPixelId,
        facebookAccessToken: req.body.fbAccessToken,
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Error saving tracking settings:", error);
      res.status(500).json({ error: "Failed to save settings" });
    }
  });

  app.post("/api/settings/email", async (req, res) => {
    try {
      const userId = await getCurrentUserId();
      await storage.updateUser(userId, {
        fromEmail: req.body.fromEmail,
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Error saving email settings:", error);
      res.status(500).json({ error: "Failed to save settings" });
    }
  });

  app.post("/api/settings/domain", async (req, res) => {
    try {
      const userId = await getCurrentUserId();
      await storage.updateUser(userId, {
        customDomain: req.body.customDomain,
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Error saving domain settings:", error);
      res.status(500).json({ error: "Failed to save settings" });
    }
  });

  return httpServer;
}

// Helper functions for mock data
function generateMockRevenueData() {
  const data = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      amount: Math.floor(Math.random() * 500) + 100,
    });
  }
  return data;
}

function generateMockOrdersData() {
  const data = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      count: Math.floor(Math.random() * 10) + 1,
    });
  }
  return data;
}

function generateMockCustomersData() {
  const data = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      count: Math.floor(Math.random() * 5) + 1,
    });
  }
  return data;
}
