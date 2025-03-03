import { WebhookEvent } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";

// This is a placeholder function since syncUserWithDatabase is not implemented yet
// We'll implement this in Step 4 according to the implementation plan
async function syncUserWithDatabase(userData: any): Promise<void> {
  console.log("User data to sync:", userData);
  // This will be implemented in Step 4
}

export async function POST(req: NextRequest) {
  // Get the headers
  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");
  
  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }
  
  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);
  
  // Get the webhook secret from environment variables
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    return NextResponse.json({ error: "Missing webhook secret" }, { status: 500 });
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
      await syncUserWithDatabase(evt.data);
    }
    
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }
} 