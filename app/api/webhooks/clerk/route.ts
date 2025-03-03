import { WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { Webhook } from "svix";

// This is a placeholder function since syncUserWithDatabase is not implemented yet
// We'll implement this in Step 4 according to the implementation plan
async function syncUserWithDatabase(userData: any): Promise<void> {
  console.log("User data to sync:", userData);
  // This will be implemented in Step 4
}

export async function POST(req: Request) {
  const headersList = headers();
  const svixId = headersList.get("svix-id");
  const svixTimestamp = headersList.get("svix-timestamp");
  const svixSignature = headersList.get("svix-signature");
  
  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix headers", { status: 400 });
  }
  
  const payload = await req.json();
  const body = JSON.stringify(payload);
  
  // Get the webhook secret from environment variables
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    return new Response("Missing webhook secret", { status: 500 });
  }
  
  // Create a new Webhook instance with the secret
  const wh = new Webhook(webhookSecret);
  
  try {
    // Verify the webhook signature
    const evt = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
    
    // Handle the webhook event
    const eventType = evt.type;
    
    if (eventType === "user.created" || eventType === "user.updated") {
      // Sync user data with our database (will be implemented in Step 4)
      await syncUserWithDatabase(evt.data);
    }
    
    return new Response("Webhook processed", { status: 200 });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error verifying webhook", { status: 400 });
  }
} 