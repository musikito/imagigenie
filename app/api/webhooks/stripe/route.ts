/**
 * Handles Stripe webhook events, specifically the "checkout.session.completed" event.
 * When a Stripe checkout session is completed, this function creates a new transaction record
 * with the relevant details from the Stripe event, such as the Stripe session ID, the total
 * amount, the plan, the number of credits, and the buyer ID.
 *
 * @param request - The incoming HTTP request containing the Stripe webhook event data.
 * @returns A JSON response with a success message and the newly created transaction.
 */
/* eslint-disable camelcase */
import { createTransaction } from "@/lib/actions/transactions.actions";
import { NextResponse } from "next/server";
import stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();

  const sig = request.headers.get("stripe-signature") as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    return NextResponse.json({ message: "Webhook error", error: err });
  }

  // Get the ID and type
  const eventType = event.type;

  // CREATE
  if (eventType === "checkout.session.completed") {
    const { id, amount_total, metadata } = event.data.object;

    const transaction = {
      stripeId: id,
      amount: amount_total ? amount_total / 100 : 0,
      plan: metadata?.plan || "",
      credits: Number(metadata?.credits) || 0,
      buyerId: metadata?.buyerId || "",
      createdAt: new Date(),
    };

    const newTransaction = await createTransaction(transaction);
    
    return NextResponse.json({ message: "OK", transaction: newTransaction });
  }

  return new Response("", { status: 200 });
};