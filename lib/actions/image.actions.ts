"use server";

import User from "@/lib/database/models/user.model";
import { connect } from "@/lib/database/db";
import { revalidatePath } from "next/cache";
import { handleError } from "@/lib/utils";
import Image from "../database/models/image.model";
import { redirect } from "next/navigation";



/**
 * Populates the `author` field of a query with the user's `_id`, `firstName`, and `lastName`.
 *
 * @param {any} query - The query to populate the `author` field for.
 * @returns {any} - The query with the `author` field populated.
 */
const populateUser = ( query:any) =>query.populate({
    path: "author",
    model: User,
    select: " _id firstName lastName",
});

/**
 * Adds a new image to the database.
 *
 * @param {AddImageParams} params - The parameters for adding the image.
 * @param {Image} params.image - The image data to be added.
 * @param {string} params.userId - The ID of the user creating the image.
 * @param {string} params.path - The path to revalidate after the image is added.
 * @returns {Promise<Image>} - The newly created image.
 */
// ADD IMAGE
export async function addImage({ image, userId, path }: AddImageParams) {
    try {
        await connect();
        const author = await User.findById(userId);
        if (!author) { throw new Error("User not found"); }
        const newImage = await Image.create({
            ...image,
            author: author._id,
            //   title: image.title,
            //   image: image.url,
            //   publicId: image.publicId,
        });
        revalidatePath(path);
        return JSON.parse(JSON.stringify(newImage));
    } catch (error) {
        handleError(error);
    }
}; // End of addImage

/**
 * Updates an existing image in the database.
 *
 * @param {UpdateImageParams} params - The parameters for updating the image.
 * @param {Image} params.image - The updated image data.
 * @param {string} params.userId - The ID of the user updating the image.
 * @param {string} params.path - The path to revalidate after the image is updated.
 * @returns {Promise<Image>} - The updated image.
 */
// UPDATE IMAGE
export async function updateImage({ image, userId, path }: UpdateImageParams) {
    try {
        await connect();
        const imageToUpdate = await Image.findById(image._id);
        if (!imageToUpdate || imageToUpdate.author.toHexString() !== userId) { throw new Error("Unauthorized or image not found"); }

        const updatedImage = await Image.findByIdAndUpdate(imageToUpdate._id, image, { new: true });

        revalidatePath(path);
        return JSON.parse(JSON.stringify(updatedImage));
    } catch (error) {
        handleError(error);
    }
}; // End of updateImage

/**
 * Deletes an image from the database by its ID.
 *
 * @param {string} imageId - The ID of the image to be deleted.
 * @returns {Promise<void>} - A promise that resolves when the image has been deleted.
 */
// DELETE IMAGE
export async function deleteImage(imageId: string) {
    try {
        await connect();
       await Image.findByIdAndDelete(imageId);
    } catch (error) {
        handleError(error);
    } finally {
        redirect("/");
    }
}; // End of deleteImage


/**
 * Retrieves an image from the database by its ID.
 *
 * @param {string} imageId - The ID of the image to retrieve.
 * @returns {Promise<Image>} - The retrieved image.
 * @throws {Error} - If the image is not found.
 */
// GET IMAGE
export async function getImageById(imageId: string) {
    try {
        await connect();
        const image = await populateUser(Image.findById(imageId));
        if (!image) { throw new Error("Image not found"); }

        return JSON.parse(JSON.stringify(image));
    } catch (error) {
        handleError(error);
    }
}; // End of getImageById


