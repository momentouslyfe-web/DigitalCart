import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, decimal, jsonb, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - store owners/sellers
export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  businessName: text("business_name"),
  logoUrl: text("logo_url"),
  primaryColor: text("primary_color").default("#2563eb"),
  facebookPixelId: text("facebook_pixel_id"),
  facebookAccessToken: text("facebook_access_token"),
  uddoktapayApiKey: text("uddoktapay_api_key"),
  uddoktapayApiUrl: text("uddoktapay_api_url"),
  sendgridApiKey: text("sendgrid_api_key"),
  fromEmail: text("from_email"),
  customDomain: text("custom_domain"),
  domainVerified: boolean("domain_verified").default(false),
});

// Products - ebooks and digital products
export const products = pgTable("products", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  compareAtPrice: decimal("compare_at_price", { precision: 10, scale: 2 }),
  imageUrl: text("image_url"),
  fileUrl: text("file_url"),
  fileName: text("file_name"),
  fileSize: integer("file_size"),
  downloadLimit: integer("download_limit").default(5),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Checkout Pages - customizable checkout page designs
export const checkoutPages = pgTable("checkout_pages", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull().references(() => users.id),
  productId: uuid("product_id").notNull().references(() => products.id),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  template: text("template").default("publisher"), // publisher, author, clean, minimalist
  blocks: jsonb("blocks").default([]),
  customStyles: jsonb("custom_styles").default({}),
  isPublished: boolean("is_published").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Order Bumps - complementary offers shown during checkout
export const orderBumps = pgTable("order_bumps", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  checkoutPageId: uuid("checkout_page_id").notNull().references(() => checkoutPages.id),
  productId: uuid("product_id").notNull().references(() => products.id),
  headline: text("headline").notNull(),
  description: text("description"),
  discountType: text("discount_type").default("fixed"), // fixed, percentage
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }).default("0"),
  position: integer("position").default(0),
  isActive: boolean("is_active").default(true),
});

// Upsells - post-purchase offers
export const upsells = pgTable("upsells", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  checkoutPageId: uuid("checkout_page_id").notNull().references(() => checkoutPages.id),
  productId: uuid("product_id").notNull().references(() => products.id),
  headline: text("headline").notNull(),
  description: text("description"),
  discountType: text("discount_type").default("fixed"),
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }).default("0"),
  position: integer("position").default(0),
  isActive: boolean("is_active").default(true),
});

// Coupons - discount codes
export const coupons = pgTable("coupons", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull().references(() => users.id),
  code: text("code").notNull(),
  discountType: text("discount_type").notNull(), // fixed, percentage
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }).notNull(),
  usageLimit: integer("usage_limit"),
  usedCount: integer("used_count").default(0),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Customers - buyers
export const customers = pgTable("customers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull().references(() => users.id),
  email: text("email").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  country: text("country"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Orders - completed purchases
export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull().references(() => users.id),
  customerId: uuid("customer_id").notNull().references(() => customers.id),
  checkoutPageId: uuid("checkout_page_id").references(() => checkoutPages.id),
  status: text("status").default("pending"), // pending, completed, failed, refunded
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 10, scale: 2 }).default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  couponId: uuid("coupon_id").references(() => coupons.id),
  paymentMethod: text("payment_method"),
  transactionId: text("transaction_id"),
  invoiceId: text("invoice_id"),
  eventId: text("event_id"), // For Facebook deduplication
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Order Items - individual products in an order
export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: uuid("order_id").notNull().references(() => orders.id),
  productId: uuid("product_id").notNull().references(() => products.id),
  itemType: text("item_type").default("main"), // main, bump, upsell
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  downloadCount: integer("download_count").default(0),
  downloadToken: text("download_token"),
  tokenExpiresAt: timestamp("token_expires_at"),
});

// Cart Abandonment tracking
export const abandonedCarts = pgTable("abandoned_carts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull().references(() => users.id),
  checkoutPageId: uuid("checkout_page_id").notNull().references(() => checkoutPages.id),
  email: text("email"),
  cartData: jsonb("cart_data"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  recoveryEmailSent: boolean("recovery_email_sent").default(false),
  recoveredAt: timestamp("recovered_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Email Templates
export const emailTemplates = pgTable("email_templates", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // purchase_confirmation, digital_delivery, cart_abandonment, upsell
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  isActive: boolean("is_active").default(true),
});

// Facebook Pixel Events log
export const pixelEvents = pgTable("pixel_events", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull().references(() => users.id),
  eventName: text("event_name").notNull(),
  eventId: text("event_id").notNull(),
  eventTime: timestamp("event_time").notNull(),
  userData: jsonb("user_data"),
  customData: jsonb("custom_data"),
  actionSource: text("action_source").default("website"),
  sentToServer: boolean("sent_to_server").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  products: many(products),
  checkoutPages: many(checkoutPages),
  coupons: many(coupons),
  customers: many(customers),
  orders: many(orders),
  emailTemplates: many(emailTemplates),
  pixelEvents: many(pixelEvents),
  abandonedCarts: many(abandonedCarts),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  user: one(users, { fields: [products.userId], references: [users.id] }),
  checkoutPages: many(checkoutPages),
  orderBumps: many(orderBumps),
  upsells: many(upsells),
  orderItems: many(orderItems),
}));

export const checkoutPagesRelations = relations(checkoutPages, ({ one, many }) => ({
  user: one(users, { fields: [checkoutPages.userId], references: [users.id] }),
  product: one(products, { fields: [checkoutPages.productId], references: [products.id] }),
  orderBumps: many(orderBumps),
  upsells: many(upsells),
  orders: many(orders),
  abandonedCarts: many(abandonedCarts),
}));

export const orderBumpsRelations = relations(orderBumps, ({ one }) => ({
  checkoutPage: one(checkoutPages, { fields: [orderBumps.checkoutPageId], references: [checkoutPages.id] }),
  product: one(products, { fields: [orderBumps.productId], references: [products.id] }),
}));

export const upsellsRelations = relations(upsells, ({ one }) => ({
  checkoutPage: one(checkoutPages, { fields: [upsells.checkoutPageId], references: [checkoutPages.id] }),
  product: one(products, { fields: [upsells.productId], references: [products.id] }),
}));

export const couponsRelations = relations(coupons, ({ one, many }) => ({
  user: one(users, { fields: [coupons.userId], references: [users.id] }),
  orders: many(orders),
}));

export const customersRelations = relations(customers, ({ one, many }) => ({
  user: one(users, { fields: [customers.userId], references: [users.id] }),
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  customer: one(customers, { fields: [orders.customerId], references: [customers.id] }),
  checkoutPage: one(checkoutPages, { fields: [orders.checkoutPageId], references: [checkoutPages.id] }),
  coupon: one(coupons, { fields: [orders.couponId], references: [coupons.id] }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
}));

export const abandonedCartsRelations = relations(abandonedCarts, ({ one }) => ({
  user: one(users, { fields: [abandonedCarts.userId], references: [users.id] }),
  checkoutPage: one(checkoutPages, { fields: [abandonedCarts.checkoutPageId], references: [checkoutPages.id] }),
}));

export const emailTemplatesRelations = relations(emailTemplates, ({ one }) => ({
  user: one(users, { fields: [emailTemplates.userId], references: [users.id] }),
}));

export const pixelEventsRelations = relations(pixelEvents, ({ one }) => ({
  user: one(users, { fields: [pixelEvents.userId], references: [users.id] }),
}));

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true });
export const insertCheckoutPageSchema = createInsertSchema(checkoutPages).omit({ id: true, createdAt: true });
export const insertOrderBumpSchema = createInsertSchema(orderBumps).omit({ id: true });
export const insertUpsellSchema = createInsertSchema(upsells).omit({ id: true });
export const insertCouponSchema = createInsertSchema(coupons).omit({ id: true, usedCount: true, createdAt: true });
export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true, createdAt: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true });
export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true });
export const insertAbandonedCartSchema = createInsertSchema(abandonedCarts).omit({ id: true, createdAt: true });
export const insertEmailTemplateSchema = createInsertSchema(emailTemplates).omit({ id: true });
export const insertPixelEventSchema = createInsertSchema(pixelEvents).omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type CheckoutPage = typeof checkoutPages.$inferSelect;
export type InsertCheckoutPage = z.infer<typeof insertCheckoutPageSchema>;
export type OrderBump = typeof orderBumps.$inferSelect;
export type InsertOrderBump = z.infer<typeof insertOrderBumpSchema>;
export type Upsell = typeof upsells.$inferSelect;
export type InsertUpsell = z.infer<typeof insertUpsellSchema>;
export type Coupon = typeof coupons.$inferSelect;
export type InsertCoupon = z.infer<typeof insertCouponSchema>;
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type AbandonedCart = typeof abandonedCarts.$inferSelect;
export type InsertAbandonedCart = z.infer<typeof insertAbandonedCartSchema>;
export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type InsertEmailTemplate = z.infer<typeof insertEmailTemplateSchema>;
export type PixelEvent = typeof pixelEvents.$inferSelect;
export type InsertPixelEvent = z.infer<typeof insertPixelEventSchema>;

// Block types for visual page editor
export const blockSchema = z.object({
  id: z.string(),
  type: z.enum([
    "hero",
    "text",
    "heading",
    "image",
    "button",
    "pricing",
    "testimonial",
    "countdown",
    "divider",
    "spacer",
    "features",
    "guarantee",
    "orderBump",
    "paymentForm"
  ]),
  content: z.record(z.any()),
  styles: z.record(z.any()).optional(),
  position: z.number(),
});

export type Block = z.infer<typeof blockSchema>;
