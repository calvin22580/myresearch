import { db } from "../../db/db";
import { subscriptionPlans } from "../../db/schema/prepare-schema";
import { eq, desc } from "drizzle-orm";

/**
 * Get all active subscription plans
 */
export async function getActivePlans() {
  return db.query.subscriptionPlans.findMany({
    where: eq(subscriptionPlans.active, "true"),
    orderBy: desc(subscriptionPlans.creditsPerMonth),
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
  price?: string;
  creditsPerMonth: number;
  active?: string;
}) {
  const id = crypto.randomUUID();
  
  const [plan] = await db.insert(subscriptionPlans)
    .values({
      id,
      name: data.name,
      description: data.description,
      price: data.price,
      creditsPerMonth: data.creditsPerMonth,
      active: data.active || "true",
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
    price?: string;
    creditsPerMonth?: number;
    active?: string;
  }
) {
  const [updatedPlan] = await db.update(subscriptionPlans)
    .set({
      ...data,
    })
    .where(eq(subscriptionPlans.id, id))
    .returning();
  
  return updatedPlan;
}

/**
 * Delete a subscription plan
 */
export async function deletePlan(id: string) {
  await db.delete(subscriptionPlans)
    .where(eq(subscriptionPlans.id, id));
}

/**
 * Deactivate a subscription plan
 */
export async function deactivatePlan(id: string) {
  return updatePlan(id, { active: "false" });
}

/**
 * Initialize default subscription plans if none exist
 */
export async function initializeDefaultPlans() {
  const existingPlans = await db.query.subscriptionPlans.findMany({
    limit: 1,
  });
  
  if (existingPlans.length === 0) {
    const defaultPlans = [
      {
        id: crypto.randomUUID(),
        name: "Free",
        description: "Basic access with limited features",
        price: "0",
        creditsPerMonth: 10,
        active: "true",
      },
      {
        id: crypto.randomUUID(),
        name: "Pro",
        description: "Full access with advanced features",
        price: "9.99",
        creditsPerMonth: 100,
        active: "true",
      },
      {
        id: crypto.randomUUID(),
        name: "Enterprise",
        description: "Unlimited access with priority support",
        price: "49.99",
        creditsPerMonth: 1000,
        active: "true",
      },
    ];
    
    await db.insert(subscriptionPlans).values(defaultPlans);
  }
} 