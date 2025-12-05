import { getFirestore } from "./firebase";
import type { IStorage } from "./storage";
import type {
  User,
  InsertUser,
  Product,
  InsertProduct,
  CheckoutPage,
  InsertCheckoutPage,
  Coupon,
  InsertCoupon,
  Customer,
  InsertCustomer,
  Order,
  InsertOrder,
  OrderItem,
  InsertOrderItem,
  AbandonedCart,
  InsertAbandonedCart,
  EmailTemplate,
  InsertEmailTemplate,
  PixelEvent,
  InsertPixelEvent,
} from "@shared/schema";

function generateId(): string {
  return crypto.randomUUID();
}

function toDate(timestamp: FirebaseFirestore.Timestamp | Date | string | null | undefined): Date | null {
  if (!timestamp) return null;
  if (timestamp instanceof Date) return timestamp;
  if (typeof timestamp === 'string') return new Date(timestamp);
  if ('toDate' in timestamp) return timestamp.toDate();
  return null;
}

function serializeForFirestore(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (obj instanceof Date) return obj;
  if (Array.isArray(obj)) return obj.map(serializeForFirestore);
  if (typeof obj === 'object') {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        result[key] = serializeForFirestore(value);
      }
    }
    return result;
  }
  return obj;
}

export class FirebaseStorage implements IStorage {
  private get db() {
    return getFirestore();
  }

  async getUser(id: string): Promise<User | undefined> {
    try {
      const doc = await this.db.collection("users").doc(id).get();
      if (!doc.exists) return undefined;
      return { id: doc.id, ...doc.data() } as User;
    } catch (error: any) {
      if (error.code === 5) {
        return undefined;
      }
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const snapshot = await this.db.collection("users").where("email", "==", email).limit(1).get();
      if (snapshot.empty) return undefined;
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as User;
    } catch (error: any) {
      if (error.code === 5) {
        return undefined;
      }
      throw error;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = generateId();
    const userWithDefaults = {
      ...user,
      id,
      primaryColor: user.primaryColor ?? "#2563eb",
      domainVerified: user.domainVerified ?? false,
    };
    const userData = serializeForFirestore(userWithDefaults);
    await this.db.collection("users").doc(id).set(userData);
    return userWithDefaults as User;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const docRef = this.db.collection("users").doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return undefined;
    await docRef.update(serializeForFirestore(data));
    const updated = await docRef.get();
    return { id, ...updated.data() } as User;
  }

  async getProducts(userId: string): Promise<Product[]> {
    try {
      const snapshot = await this.db.collection("products")
        .where("userId", "==", userId)
        .orderBy("createdAt", "desc")
        .get();
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: toDate(data.createdAt),
        } as Product;
      });
    } catch (error: any) {
      if (error.code === 5) {
        return [];
      }
      throw error;
    }
  }

  async getProduct(id: string): Promise<Product | undefined> {
    try {
      const doc = await this.db.collection("products").doc(id).get();
      if (!doc.exists) return undefined;
      const data = doc.data()!;
      return {
        ...data,
        id: doc.id,
        createdAt: toDate(data.createdAt),
      } as Product;
    } catch (error: any) {
      if (error.code === 5) {
        return undefined;
      }
      throw error;
    }
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = generateId();
    const createdAt = new Date();
    const productWithDefaults = {
      ...product,
      id,
      createdAt,
      downloadLimit: product.downloadLimit ?? 5,
      isActive: product.isActive ?? true,
    };
    const productData = serializeForFirestore(productWithDefaults);
    await this.db.collection("products").doc(id).set(productData);
    return productWithDefaults as Product;
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<Product | undefined> {
    const docRef = this.db.collection("products").doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return undefined;
    await docRef.update(serializeForFirestore(data));
    const updated = await docRef.get();
    const updatedData = updated.data()!;
    return {
      ...updatedData,
      id,
      createdAt: toDate(updatedData.createdAt),
    } as Product;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const docRef = this.db.collection("products").doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return false;
    await docRef.delete();
    return true;
  }

  async getCheckoutPages(userId: string): Promise<(CheckoutPage & { product?: Product })[]> {
    try {
      const snapshot = await this.db.collection("checkoutPages")
        .where("userId", "==", userId)
        .orderBy("createdAt", "desc")
        .get();
      
      const pages = await Promise.all(snapshot.docs.map(async (doc) => {
        const data = doc.data();
        const page = {
          ...data,
          id: doc.id,
          createdAt: toDate(data.createdAt),
        } as CheckoutPage;
        
        const product = await this.getProduct(page.productId);
        return { ...page, product };
      }));
      
      return pages;
    } catch (error: any) {
      if (error.code === 5) {
        return [];
      }
      throw error;
    }
  }

  async getCheckoutPage(id: string): Promise<(CheckoutPage & { product?: Product }) | undefined> {
    try {
      const doc = await this.db.collection("checkoutPages").doc(id).get();
      if (!doc.exists) return undefined;
      const data = doc.data()!;
      const page = {
        ...data,
        id: doc.id,
        createdAt: toDate(data.createdAt),
      } as CheckoutPage;
      const product = await this.getProduct(page.productId);
      return { ...page, product };
    } catch (error: any) {
      if (error.code === 5) {
        return undefined;
      }
      throw error;
    }
  }

  async getCheckoutPageBySlug(slug: string): Promise<(CheckoutPage & { product?: Product }) | undefined> {
    try {
      const snapshot = await this.db.collection("checkoutPages")
        .where("slug", "==", slug)
        .limit(1)
        .get();
      if (snapshot.empty) return undefined;
      const doc = snapshot.docs[0];
      const data = doc.data();
      const page = {
        ...data,
        id: doc.id,
        createdAt: toDate(data.createdAt),
      } as CheckoutPage;
      const product = await this.getProduct(page.productId);
      return { ...page, product };
    } catch (error: any) {
      if (error.code === 5) {
        return undefined;
      }
      throw error;
    }
  }

  async createCheckoutPage(page: InsertCheckoutPage): Promise<CheckoutPage> {
    const id = generateId();
    const createdAt = new Date();
    const pageWithDefaults = {
      ...page,
      id,
      createdAt,
      template: page.template ?? "publisher",
      blocks: page.blocks ?? [],
      customStyles: page.customStyles ?? {},
      isPublished: page.isPublished ?? false,
    };
    const pageData = serializeForFirestore(pageWithDefaults);
    await this.db.collection("checkoutPages").doc(id).set(pageData);
    return pageWithDefaults as CheckoutPage;
  }

  async updateCheckoutPage(id: string, data: Partial<CheckoutPage>): Promise<CheckoutPage | undefined> {
    const docRef = this.db.collection("checkoutPages").doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return undefined;
    await docRef.update(serializeForFirestore(data));
    const updated = await docRef.get();
    const updatedData = updated.data()!;
    return {
      ...updatedData,
      id,
      createdAt: toDate(updatedData.createdAt),
    } as CheckoutPage;
  }

  async deleteCheckoutPage(id: string): Promise<boolean> {
    const docRef = this.db.collection("checkoutPages").doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return false;
    await docRef.delete();
    return true;
  }

  async getCoupons(userId: string): Promise<Coupon[]> {
    try {
      const snapshot = await this.db.collection("coupons")
        .where("userId", "==", userId)
        .orderBy("createdAt", "desc")
        .get();
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: toDate(data.createdAt),
          expiresAt: toDate(data.expiresAt),
        } as Coupon;
      });
    } catch (error: any) {
      if (error.code === 5) {
        return [];
      }
      throw error;
    }
  }

  async getCoupon(id: string): Promise<Coupon | undefined> {
    try {
      const doc = await this.db.collection("coupons").doc(id).get();
      if (!doc.exists) return undefined;
      const data = doc.data()!;
      return {
        ...data,
        id: doc.id,
        createdAt: toDate(data.createdAt),
        expiresAt: toDate(data.expiresAt),
      } as Coupon;
    } catch (error: any) {
      if (error.code === 5) {
        return undefined;
      }
      throw error;
    }
  }

  async getCouponByCode(code: string, userId: string): Promise<Coupon | undefined> {
    try {
      const snapshot = await this.db.collection("coupons")
        .where("code", "==", code)
        .where("userId", "==", userId)
        .limit(1)
        .get();
      if (snapshot.empty) return undefined;
      const doc = snapshot.docs[0];
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: toDate(data.createdAt),
        expiresAt: toDate(data.expiresAt),
      } as Coupon;
    } catch (error: any) {
      if (error.code === 5) {
        return undefined;
      }
      throw error;
    }
  }

  async createCoupon(coupon: InsertCoupon): Promise<Coupon> {
    const id = generateId();
    const createdAt = new Date();
    const couponWithDefaults = {
      ...coupon,
      id,
      createdAt,
      usedCount: 0,
      isActive: coupon.isActive ?? true,
    };
    const couponData = serializeForFirestore(couponWithDefaults);
    await this.db.collection("coupons").doc(id).set(couponData);
    return couponWithDefaults as Coupon;
  }

  async updateCoupon(id: string, data: Partial<Coupon>): Promise<Coupon | undefined> {
    const docRef = this.db.collection("coupons").doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return undefined;
    await docRef.update(serializeForFirestore(data));
    const updated = await docRef.get();
    const updatedData = updated.data()!;
    return {
      ...updatedData,
      id,
      createdAt: toDate(updatedData.createdAt),
      expiresAt: toDate(updatedData.expiresAt),
    } as Coupon;
  }

  async deleteCoupon(id: string): Promise<boolean> {
    const docRef = this.db.collection("coupons").doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return false;
    await docRef.delete();
    return true;
  }

  async getCustomers(userId: string): Promise<Customer[]> {
    try {
      const snapshot = await this.db.collection("customers")
        .where("userId", "==", userId)
        .orderBy("createdAt", "desc")
        .get();
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: toDate(data.createdAt),
        } as Customer;
      });
    } catch (error: any) {
      if (error.code === 5) {
        return [];
      }
      throw error;
    }
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    try {
      const doc = await this.db.collection("customers").doc(id).get();
      if (!doc.exists) return undefined;
      const data = doc.data()!;
      return {
        ...data,
        id: doc.id,
        createdAt: toDate(data.createdAt),
      } as Customer;
    } catch (error: any) {
      if (error.code === 5) {
        return undefined;
      }
      throw error;
    }
  }

  async getCustomerByEmail(email: string, userId: string): Promise<Customer | undefined> {
    try {
      const snapshot = await this.db.collection("customers")
        .where("email", "==", email)
        .where("userId", "==", userId)
        .limit(1)
        .get();
      if (snapshot.empty) return undefined;
      const doc = snapshot.docs[0];
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: toDate(data.createdAt),
      } as Customer;
    } catch (error: any) {
      if (error.code === 5) {
        return undefined;
      }
      throw error;
    }
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const id = generateId();
    const createdAt = new Date();
    const customerData = serializeForFirestore({ ...customer, id, createdAt });
    await this.db.collection("customers").doc(id).set(customerData);
    return { id, ...customer, createdAt } as Customer;
  }

  async updateCustomer(id: string, data: Partial<Customer>): Promise<Customer | undefined> {
    const docRef = this.db.collection("customers").doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return undefined;
    await docRef.update(serializeForFirestore(data));
    const updated = await docRef.get();
    const updatedData = updated.data()!;
    return {
      ...updatedData,
      id,
      createdAt: toDate(updatedData.createdAt),
    } as Customer;
  }

  async getOrders(userId: string): Promise<(Order & { customer?: Customer; items?: OrderItem[] })[]> {
    try {
      const snapshot = await this.db.collection("orders")
        .where("userId", "==", userId)
        .orderBy("createdAt", "desc")
        .get();
      
      return Promise.all(snapshot.docs.map(async (doc) => {
        const data = doc.data();
        const order = {
          ...data,
          id: doc.id,
          createdAt: toDate(data.createdAt),
        } as Order;
        
        const customer = await this.getCustomer(order.customerId);
        const itemsSnapshot = await this.db.collection("orderItems")
          .where("orderId", "==", order.id)
          .get();
        const items = itemsSnapshot.docs.map(itemDoc => ({
          ...itemDoc.data(),
          id: itemDoc.id,
        } as OrderItem));
        
        return { ...order, customer, items };
      }));
    } catch (error: any) {
      if (error.code === 5) {
        return [];
      }
      throw error;
    }
  }

  async getOrder(id: string): Promise<(Order & { customer?: Customer; items?: (OrderItem & { product?: Product })[] }) | undefined> {
    const doc = await this.db.collection("orders").doc(id).get();
    if (!doc.exists) return undefined;
    const data = doc.data()!;
    const order = {
      ...data,
      id: doc.id,
      createdAt: toDate(data.createdAt),
    } as Order;
    
    const customer = await this.getCustomer(order.customerId);
    const items = await this.getOrderItems(id);
    
    return { ...order, customer, items };
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const id = generateId();
    const createdAt = new Date();
    const orderWithDefaults = {
      ...order,
      id,
      createdAt,
      status: order.status ?? "pending",
      discount: order.discount ?? "0",
    };
    const orderData = serializeForFirestore(orderWithDefaults);
    await this.db.collection("orders").doc(id).set(orderData);
    return orderWithDefaults as Order;
  }

  async updateOrder(id: string, data: Partial<Order>): Promise<Order | undefined> {
    const docRef = this.db.collection("orders").doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return undefined;
    await docRef.update(serializeForFirestore(data));
    const updated = await docRef.get();
    const updatedData = updated.data()!;
    return {
      ...updatedData,
      id,
      createdAt: toDate(updatedData.createdAt),
    } as Order;
  }

  async createOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    const id = generateId();
    const itemWithDefaults = {
      ...item,
      id,
      itemType: item.itemType ?? "main",
      downloadCount: item.downloadCount ?? 0,
    };
    const itemData = serializeForFirestore(itemWithDefaults);
    await this.db.collection("orderItems").doc(id).set(itemData);
    return itemWithDefaults as OrderItem;
  }

  async getOrderItems(orderId: string): Promise<(OrderItem & { product?: Product })[]> {
    const snapshot = await this.db.collection("orderItems")
      .where("orderId", "==", orderId)
      .get();
    
    return Promise.all(snapshot.docs.map(async (doc) => {
      const data = doc.data();
      const item = {
        ...data,
        id: doc.id,
        tokenExpiresAt: toDate(data.tokenExpiresAt),
      } as OrderItem;
      const product = await this.getProduct(item.productId);
      return { ...item, product };
    }));
  }

  async getEmailTemplates(userId: string): Promise<EmailTemplate[]> {
    try {
      const snapshot = await this.db.collection("emailTemplates")
        .where("userId", "==", userId)
        .get();
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      } as EmailTemplate));
    } catch (error: any) {
      if (error.code === 5) {
        return [];
      }
      throw error;
    }
  }

  async getEmailTemplate(id: string): Promise<EmailTemplate | undefined> {
    const doc = await this.db.collection("emailTemplates").doc(id).get();
    if (!doc.exists) return undefined;
    return { id: doc.id, ...doc.data() } as EmailTemplate;
  }

  async createEmailTemplate(template: InsertEmailTemplate): Promise<EmailTemplate> {
    const id = generateId();
    const templateWithDefaults = {
      ...template,
      id,
      isActive: template.isActive ?? true,
    };
    const templateData = serializeForFirestore(templateWithDefaults);
    await this.db.collection("emailTemplates").doc(id).set(templateData);
    return templateWithDefaults as EmailTemplate;
  }

  async updateEmailTemplate(id: string, data: Partial<EmailTemplate>): Promise<EmailTemplate | undefined> {
    const docRef = this.db.collection("emailTemplates").doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return undefined;
    await docRef.update(serializeForFirestore(data));
    const updated = await docRef.get();
    return { id, ...updated.data() } as EmailTemplate;
  }

  async deleteEmailTemplate(id: string): Promise<boolean> {
    const docRef = this.db.collection("emailTemplates").doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return false;
    await docRef.delete();
    return true;
  }

  async createPixelEvent(event: InsertPixelEvent): Promise<PixelEvent> {
    const id = generateId();
    const createdAt = new Date();
    const eventWithDefaults = {
      ...event,
      id,
      createdAt,
      actionSource: event.actionSource ?? "website",
      sentToServer: event.sentToServer ?? false,
    };
    const eventData = serializeForFirestore(eventWithDefaults);
    await this.db.collection("pixelEvents").doc(id).set(eventData);
    return eventWithDefaults as PixelEvent;
  }

  async getPixelEvents(userId: string, limit = 100): Promise<PixelEvent[]> {
    try {
      const snapshot = await this.db.collection("pixelEvents")
        .where("userId", "==", userId)
        .orderBy("createdAt", "desc")
        .limit(limit)
        .get();
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: toDate(data.createdAt),
          eventTime: toDate(data.eventTime),
        } as PixelEvent;
      });
    } catch (error: any) {
      if (error.code === 5) {
        return [];
      }
      throw error;
    }
  }

  async createAbandonedCart(cart: InsertAbandonedCart): Promise<AbandonedCart> {
    const id = generateId();
    const createdAt = new Date();
    const cartWithDefaults = {
      ...cart,
      id,
      createdAt,
      recoveryEmailSent: cart.recoveryEmailSent ?? false,
    };
    const cartData = serializeForFirestore(cartWithDefaults);
    await this.db.collection("abandonedCarts").doc(id).set(cartData);
    return cartWithDefaults as AbandonedCart;
  }

  async getAbandonedCarts(userId: string): Promise<AbandonedCart[]> {
    try {
      const snapshot = await this.db.collection("abandonedCarts")
        .where("userId", "==", userId)
        .orderBy("createdAt", "desc")
        .get();
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: toDate(data.createdAt),
          recoveredAt: toDate(data.recoveredAt),
        } as AbandonedCart;
      });
    } catch (error: any) {
      if (error.code === 5) {
        return [];
      }
      throw error;
    }
  }

  async updateAbandonedCart(id: string, data: Partial<AbandonedCart>): Promise<AbandonedCart | undefined> {
    const docRef = this.db.collection("abandonedCarts").doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return undefined;
    await docRef.update(serializeForFirestore(data));
    const updated = await docRef.get();
    const updatedData = updated.data()!;
    return {
      ...updatedData,
      id,
      createdAt: toDate(updatedData.createdAt),
      recoveredAt: toDate(updatedData.recoveredAt),
    } as AbandonedCart;
  }
}
