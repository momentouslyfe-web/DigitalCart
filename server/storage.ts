import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";
import {
  users,
  products,
  checkoutPages,
  orderBumps,
  upsells,
  coupons,
  customers,
  orders,
  orderItems,
  abandonedCarts,
  emailTemplates,
  pixelEvents,
  type User,
  type InsertUser,
  type Product,
  type InsertProduct,
  type CheckoutPage,
  type InsertCheckoutPage,
  type OrderBump,
  type InsertOrderBump,
  type Upsell,
  type InsertUpsell,
  type Coupon,
  type InsertCoupon,
  type Customer,
  type InsertCustomer,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type AbandonedCart,
  type InsertAbandonedCart,
  type EmailTemplate,
  type InsertEmailTemplate,
  type PixelEvent,
  type InsertPixelEvent,
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;

  // Products
  getProducts(userId: string): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, data: Partial<Product>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;

  // Checkout Pages
  getCheckoutPages(userId: string): Promise<(CheckoutPage & { product?: Product })[]>;
  getCheckoutPage(id: string): Promise<(CheckoutPage & { product?: Product }) | undefined>;
  getCheckoutPageBySlug(slug: string): Promise<(CheckoutPage & { product?: Product }) | undefined>;
  createCheckoutPage(page: InsertCheckoutPage): Promise<CheckoutPage>;
  updateCheckoutPage(id: string, data: Partial<CheckoutPage>): Promise<CheckoutPage | undefined>;
  deleteCheckoutPage(id: string): Promise<boolean>;

  // Coupons
  getCoupons(userId: string): Promise<Coupon[]>;
  getCoupon(id: string): Promise<Coupon | undefined>;
  getCouponByCode(code: string, userId: string): Promise<Coupon | undefined>;
  createCoupon(coupon: InsertCoupon): Promise<Coupon>;
  updateCoupon(id: string, data: Partial<Coupon>): Promise<Coupon | undefined>;
  deleteCoupon(id: string): Promise<boolean>;

  // Customers
  getCustomers(userId: string): Promise<Customer[]>;
  getCustomer(id: string): Promise<Customer | undefined>;
  getCustomerByEmail(email: string, userId: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, data: Partial<Customer>): Promise<Customer | undefined>;

  // Orders
  getOrders(userId: string): Promise<(Order & { customer?: Customer; items?: OrderItem[] })[]>;
  getOrder(id: string): Promise<(Order & { customer?: Customer; items?: (OrderItem & { product?: Product })[] }) | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, data: Partial<Order>): Promise<Order | undefined>;

  // Order Items
  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;
  getOrderItems(orderId: string): Promise<(OrderItem & { product?: Product })[]>;

  // Email Templates
  getEmailTemplates(userId: string): Promise<EmailTemplate[]>;
  getEmailTemplate(id: string): Promise<EmailTemplate | undefined>;
  createEmailTemplate(template: InsertEmailTemplate): Promise<EmailTemplate>;
  updateEmailTemplate(id: string, data: Partial<EmailTemplate>): Promise<EmailTemplate | undefined>;
  deleteEmailTemplate(id: string): Promise<boolean>;

  // Pixel Events
  createPixelEvent(event: InsertPixelEvent): Promise<PixelEvent>;
  getPixelEvents(userId: string, limit?: number): Promise<PixelEvent[]>;

  // Abandoned Carts
  createAbandonedCart(cart: InsertAbandonedCart): Promise<AbandonedCart>;
  getAbandonedCarts(userId: string): Promise<AbandonedCart[]>;
  updateAbandonedCart(id: string, data: Partial<AbandonedCart>): Promise<AbandonedCart | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const [updated] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return updated;
  }

  // Products
  async getProducts(userId: string): Promise<Product[]> {
    return db.select().from(products).where(eq(products.userId, userId)).orderBy(desc(products.createdAt));
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [created] = await db.insert(products).values(product).returning();
    return created;
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<Product | undefined> {
    const [updated] = await db.update(products).set(data).where(eq(products.id, id)).returning();
    return updated;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id)).returning();
    return result.length > 0;
  }

  // Checkout Pages
  async getCheckoutPages(userId: string): Promise<(CheckoutPage & { product?: Product })[]> {
    const pages = await db.select().from(checkoutPages).where(eq(checkoutPages.userId, userId)).orderBy(desc(checkoutPages.createdAt));
    
    const pagesWithProducts = await Promise.all(
      pages.map(async (page) => {
        const [product] = await db.select().from(products).where(eq(products.id, page.productId));
        return { ...page, product };
      })
    );
    
    return pagesWithProducts;
  }

  async getCheckoutPage(id: string): Promise<(CheckoutPage & { product?: Product }) | undefined> {
    const [page] = await db.select().from(checkoutPages).where(eq(checkoutPages.id, id));
    if (!page) return undefined;
    
    const [product] = await db.select().from(products).where(eq(products.id, page.productId));
    return { ...page, product };
  }

  async getCheckoutPageBySlug(slug: string): Promise<(CheckoutPage & { product?: Product }) | undefined> {
    const [page] = await db.select().from(checkoutPages).where(eq(checkoutPages.slug, slug));
    if (!page) return undefined;
    
    const [product] = await db.select().from(products).where(eq(products.id, page.productId));
    return { ...page, product };
  }

  async createCheckoutPage(page: InsertCheckoutPage): Promise<CheckoutPage> {
    const [created] = await db.insert(checkoutPages).values(page).returning();
    return created;
  }

  async updateCheckoutPage(id: string, data: Partial<CheckoutPage>): Promise<CheckoutPage | undefined> {
    const [updated] = await db.update(checkoutPages).set(data).where(eq(checkoutPages.id, id)).returning();
    return updated;
  }

  async deleteCheckoutPage(id: string): Promise<boolean> {
    const result = await db.delete(checkoutPages).where(eq(checkoutPages.id, id)).returning();
    return result.length > 0;
  }

  // Coupons
  async getCoupons(userId: string): Promise<Coupon[]> {
    return db.select().from(coupons).where(eq(coupons.userId, userId)).orderBy(desc(coupons.createdAt));
  }

  async getCoupon(id: string): Promise<Coupon | undefined> {
    const [coupon] = await db.select().from(coupons).where(eq(coupons.id, id));
    return coupon;
  }

  async getCouponByCode(code: string, userId: string): Promise<Coupon | undefined> {
    const [coupon] = await db.select().from(coupons).where(
      and(eq(coupons.code, code), eq(coupons.userId, userId))
    );
    return coupon;
  }

  async createCoupon(coupon: InsertCoupon): Promise<Coupon> {
    const [created] = await db.insert(coupons).values(coupon).returning();
    return created;
  }

  async updateCoupon(id: string, data: Partial<Coupon>): Promise<Coupon | undefined> {
    const [updated] = await db.update(coupons).set(data).where(eq(coupons.id, id)).returning();
    return updated;
  }

  async deleteCoupon(id: string): Promise<boolean> {
    const result = await db.delete(coupons).where(eq(coupons.id, id)).returning();
    return result.length > 0;
  }

  // Customers
  async getCustomers(userId: string): Promise<Customer[]> {
    return db.select().from(customers).where(eq(customers.userId, userId)).orderBy(desc(customers.createdAt));
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer;
  }

  async getCustomerByEmail(email: string, userId: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(
      and(eq(customers.email, email), eq(customers.userId, userId))
    );
    return customer;
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [created] = await db.insert(customers).values(customer).returning();
    return created;
  }

  async updateCustomer(id: string, data: Partial<Customer>): Promise<Customer | undefined> {
    const [updated] = await db.update(customers).set(data).where(eq(customers.id, id)).returning();
    return updated;
  }

  // Orders
  async getOrders(userId: string): Promise<(Order & { customer?: Customer; items?: OrderItem[] })[]> {
    const allOrders = await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
    
    const ordersWithDetails = await Promise.all(
      allOrders.map(async (order) => {
        const [customer] = await db.select().from(customers).where(eq(customers.id, order.customerId));
        const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
        return { ...order, customer, items };
      })
    );
    
    return ordersWithDetails;
  }

  async getOrder(id: string): Promise<(Order & { customer?: Customer; items?: (OrderItem & { product?: Product })[] }) | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    if (!order) return undefined;
    
    const [customer] = await db.select().from(customers).where(eq(customers.id, order.customerId));
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
    
    const itemsWithProducts = await Promise.all(
      items.map(async (item) => {
        const [product] = await db.select().from(products).where(eq(products.id, item.productId));
        return { ...item, product };
      })
    );
    
    return { ...order, customer, items: itemsWithProducts };
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [created] = await db.insert(orders).values(order).returning();
    return created;
  }

  async updateOrder(id: string, data: Partial<Order>): Promise<Order | undefined> {
    const [updated] = await db.update(orders).set(data).where(eq(orders.id, id)).returning();
    return updated;
  }

  // Order Items
  async createOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    const [created] = await db.insert(orderItems).values(item).returning();
    return created;
  }

  async getOrderItems(orderId: string): Promise<(OrderItem & { product?: Product })[]> {
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
    
    const itemsWithProducts = await Promise.all(
      items.map(async (item) => {
        const [product] = await db.select().from(products).where(eq(products.id, item.productId));
        return { ...item, product };
      })
    );
    
    return itemsWithProducts;
  }

  // Email Templates
  async getEmailTemplates(userId: string): Promise<EmailTemplate[]> {
    return db.select().from(emailTemplates).where(eq(emailTemplates.userId, userId));
  }

  async getEmailTemplate(id: string): Promise<EmailTemplate | undefined> {
    const [template] = await db.select().from(emailTemplates).where(eq(emailTemplates.id, id));
    return template;
  }

  async createEmailTemplate(template: InsertEmailTemplate): Promise<EmailTemplate> {
    const [created] = await db.insert(emailTemplates).values(template).returning();
    return created;
  }

  async updateEmailTemplate(id: string, data: Partial<EmailTemplate>): Promise<EmailTemplate | undefined> {
    const [updated] = await db.update(emailTemplates).set(data).where(eq(emailTemplates.id, id)).returning();
    return updated;
  }

  async deleteEmailTemplate(id: string): Promise<boolean> {
    const result = await db.delete(emailTemplates).where(eq(emailTemplates.id, id)).returning();
    return result.length > 0;
  }

  // Pixel Events
  async createPixelEvent(event: InsertPixelEvent): Promise<PixelEvent> {
    const [created] = await db.insert(pixelEvents).values(event).returning();
    return created;
  }

  async getPixelEvents(userId: string, limit = 100): Promise<PixelEvent[]> {
    return db.select().from(pixelEvents).where(eq(pixelEvents.userId, userId)).orderBy(desc(pixelEvents.createdAt)).limit(limit);
  }

  // Abandoned Carts
  async createAbandonedCart(cart: InsertAbandonedCart): Promise<AbandonedCart> {
    const [created] = await db.insert(abandonedCarts).values(cart).returning();
    return created;
  }

  async getAbandonedCarts(userId: string): Promise<AbandonedCart[]> {
    return db.select().from(abandonedCarts).where(eq(abandonedCarts.userId, userId)).orderBy(desc(abandonedCarts.createdAt));
  }

  async updateAbandonedCart(id: string, data: Partial<AbandonedCart>): Promise<AbandonedCart | undefined> {
    const [updated] = await db.update(abandonedCarts).set(data).where(eq(abandonedCarts.id, id)).returning();
    return updated;
  }
}

import { FirebaseStorage } from "./firebase-storage";

function createStorage(): IStorage {
  const dbType = process.env.DATABASE_TYPE || "postgres";
  
  if (dbType === "firebase") {
    console.log("Using Firebase Firestore database");
    return new FirebaseStorage();
  }
  
  console.log("Using PostgreSQL database");
  return new DatabaseStorage();
}

export const storage = createStorage();
