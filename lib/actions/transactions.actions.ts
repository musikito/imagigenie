"use server";

import { redirect } from "next/navigation";
import Stripe from "stripe";
import { handleError } from "../utils";
import { connect } from "../database/db";
import Transaction from "../database/models/transaction.model";
import { updateCredits } from "./user.actions";

/**
 * Initiates a Stripe checkout session for a transaction and process payments.
 *
 * @param transaction - An object containing the details of the transaction, including the amount, plan, and buyer ID.
 * @returns A redirect to the Stripe checkout session URL.
 */
export async function checkoutCredits(transaction: CheckoutTransactionParams){

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const amount = Number(transaction.amount) * 100;
    const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: 'usd',
              unit_amount: amount,
              product_data: {
                name: transaction.plan,
              }
            },
            quantity: 1
          }
        ],
        metadata: {
          plan: transaction.plan,
          credits: transaction.credits,
          buyerId: transaction.buyerId,
        },
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/client`,
        cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/`,
      })
    
      redirect(session.url!)

}; // End of checkoutCredits



/**
 * Creates a new transaction in the database and updates the buyer's credits.
 *
 * @param transaction - An object containing the details of the transaction, including the buyer ID and the number of credits to be added.
 * @returns The newly created transaction object.
 */
export async function createTransaction(transaction: CreateTransactionParams) {
    try {
        await connect();
        const newTransaction = await Transaction.create({
            ...transaction,
            buyer: transaction.buyerId,
        });

        await updateCredits(transaction.buyerId, transaction.credits);
        return JSON.parse(JSON.stringify(newTransaction));
        
    } catch (error) {
        handleError(error);
        
    }
}; // End of createTransaction