import { db } from "@/db/db";
import { subscriptionPlans } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

/**
 * Get all active subscription plans
 */
export async function getAllActivePlans() {
  return db.query.subscriptionPlans.findMany({
    where: eq(subscriptionPlans.active, true),
    orderBy: subscriptionPlans.creditsPerMonth,
  });
}

/**
 * Get a subscription plan by ID
 */
export async function getPlanById(id: string) {
  return db.query.subscriptionPlans.findFirst({
    where: eq(subscriptionPlans.id, id),
  });
}

/**
 * Create a new subscription plan
 */
export async function createPlan(data: {
  name: string;
  description?: string;
  price?: number;
  creditsPerMonth: number;
  active?: boolean;
}) {
  const [plan] = await db.insert(subscriptionPlans)
    .values({
      id: crypto.randomUUID(),
      ...data,
      // Convert price to string if it exists
      price: data.price !== undefined ? data.price.toString() : undefined,
      active: data.active !== undefined ? data.active : true,
    })
    .returning();
  
  return plan;
}

/**
 * Update a subscription plan
 */
export async function updatePlan(
  id: string,
  data: {
    name?: string;
    description?: string;
    price?: number;
    creditsPerMonth?: number;
    active?: boolean;
  }
) {
  // Create a new object without the price field
  const { price, ...otherData } = data;
  
  // Add price as string if it exists
  const updateData = {
    ...otherData,
    ...(price !== undefined ? { price: price.toString() } : {})
  };
  
  const [updatedPlan] = await db.update(subscriptionPlans)
    .set(updateData)
    .where(eq(subscriptionPlans.id, id))
    .returning();
  
  return updatedPlan;
}

/**
 * Delete a subscription plan (soft delete by setting active to false)
 */
export async function deactivatePlan(id: string) {
  const [updatedPlan] = await db.update(subscriptionPlans)
    .set({ active: false })
    .where(eq(subscriptionPlans.id, id))
    .returning();
  
  return updatedPlan;
}

/**
 * Initialize default subscription plans if they don't exist
 */
export async function initializeDefaultPlans() {
  const existingPlans = await db.query.subscriptionPlans.findMany();
  
  if (existingPlans.length > 0) {
    return existingPlans;
  }
  
  // Create default plans
  const freePlan = {
    name: "Free",
    description: "Basic access with daily credit refresh",
    price: "0",
    creditsPerMonth: 10,
    active: true,
  };
  
  const proPlan = {
    name: "Professional",
    description: "Unlimited access with priority support",
    price: "19.99",
    creditsPerMonth: 1000,
    active: true,
  };
  
  const enterprisePlan = {
    name: "Enterprise",
    description: "Custom support and integration options",
    price: "49.99",
    creditsPerMonth: 5000,
    active: true,
  };
  
  await db.insert(subscriptionPlans)
    .values([
      { id: crypto.randomUUID(), ...freePlan },
      { id: crypto.randomUUID(), ...proPlan },
      { id: crypto.randomUUID(), ...enterprisePlan },
    ]);
  
  return db.query.subscriptionPlans.findMany();
} 