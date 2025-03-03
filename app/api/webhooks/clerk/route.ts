import { WebhookEvent } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { syncUserWithDatabase } from "@/lib/db/user-sync";

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

// Clerk webhook handler that processes user events from Clerk
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
    } else if (eventType === "user.deleted") {
      // We could handle user deletion here if needed
      // await handleUserDeletion(evt.data);
      console.log(`User deleted event received for: ${JSON.stringify(evt.data)}`);
    }
    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error processing webhook:", err);
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }
} 