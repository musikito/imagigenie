"use server";

import User from "@/lib/database/models/user.model";
import { connect } from "@/lib/database/db";
import { revalidatePath } from "next/cache";
import { handleError } from "@/lib/utils";


/**
 * Creates a new user in the database.
 *
 * @param user - The user object to create.
 * @returns The created user object.
 */
export async function createUser(user: CreateUserParams) {
    try {
      await connect();
      const newUser = await User.create(user);
      // console.log("newUser", newUser);
      
      return JSON.parse(JSON.stringify(newUser));
      
    } catch (error) {
      handleError(error);
    }
  
}; // End of createUser

/**
 * Retrieves a user from the database by their Clerk ID.
 *
 * @param userId - The Clerk ID of the user to retrieve.
 * @returns The user object, or throws an error if the user is not found.
 */
export async function getUserById(userId: string) {
  try {
    await connect();

    const user = await User.findOne({ clerkId: userId });

    if (!user) throw new Error("User not found");

    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    handleError(error);
  }
}; // End of getUserById


/**
 * Updates an existing user in the database.
 *
 * @param clerkId - The Clerk ID of the user to update.
 * @param user - The updated user object.
 * @returns The updated user object, or throws an error if the update fails.
 */
export async function updateUser(clerkId: string, user: UpdateUserParams) {
  try {
    await connect();

    const updatedUser = await User.findOneAndUpdate({ clerkId }, user, {
      new: true,
    });

    if (!updatedUser) throw new Error("User update failed");
    
    return JSON.parse(JSON.stringify(updatedUser));
  } catch (error) {
    handleError(error);
  }
}; // End of updateUser

/**
 * Deletes a user from the database by their Clerk ID.
 *
 * @param clerkId - The Clerk ID of the user to delete.
 * @returns The deleted user object, or null if the user was not found.
 * @throws Error if the user could not be deleted.
 */
export async function deleteUser(clerkId: string) {
  try {
    await connect();

    // Find user to delete
    const userToDelete = await User.findOne({ clerkId });

    if (!userToDelete) {
      throw new Error("User not found");
    }

    // Delete user
    const deletedUser = await User.findByIdAndDelete(userToDelete._id);
    revalidatePath("/");

    return deletedUser ? JSON.parse(JSON.stringify(deletedUser)) : null;
  } catch (error) {
    handleError(error);
  }
}; // End of deleteUser

/**
 * Updates the credit balance for a user.
 *
 * @param userId - The ID of the user whose credits should be updated.
 * @param creditFee - The amount to add or subtract from the user's credit balance.
 * @returns The updated user object with the new credit balance, or throws an error if the update fails.
 */
export async function updateCredits(userId: string, creditFee: number) {
  try {
    await connect();

    const updatedUserCredits = await User.findOneAndUpdate(
      { _id: userId },
      // { $inc: { creditBalance: creditFee }},
      { $inc: { credits: creditFee }},
      { new: true }
    )

    if(!updatedUserCredits) throw new Error("User credits update failed");

    return JSON.parse(JSON.stringify(updatedUserCredits));
  } catch (error) {
    handleError(error);
  }
}; // End of updateCredits


