"use server";

import { revalidatePath } from "next/cache";
import { connect } from "@/lib/database/db";
import { handleError } from "../utils";
import User from "../database/models/user.model";
import Image from "../database/models/image.model";
import { redirect } from "next/navigation";

import { v2 as cloudinary } from 'cloudinary'

const populateUser = (query: any) => query.populate({
  path: 'author',
  model: User,
  select: '_id firstName lastName clerkId'
})

/**
 * Adds a new image to the database.
 *
 * @param {Object} params - The parameters for adding the image.
 * @param {Object} params.image - The image data to be added.
 * @param {string} params.userId - The ID of the user adding the image.
 * @param {string} params.path - The path to revalidate after the image is added.
 * @returns {Promise<Object>} - The newly created image object.
 * @throws {Error} - Throws an error if the user is not found or there is an issue creating the image.
 */
// ADD IMAGE
export async function addImage({ image, userId, path }: AddImageParams) {
  try {
    await connect();

    const author = await User.findById(userId);

    if (!author) {
      throw new Error("User not found");
    }

    const newImage = await Image.create({
      ...image,
      author: author._id,
    })

    revalidatePath(path);

    return JSON.parse(JSON.stringify(newImage));
  } catch (error) {
    handleError(error)
  }
}; // End of addImage

/**
 * Updates an existing image in the database.
 *
 * @param {Object} params - The parameters for updating the image.
 * @param {Object} params.image - The updated image data.
 * @param {string} params.userId - The ID of the user updating the image.
 * @param {string} params.path - The path to revalidate after the update.
 * @returns {Promise<Object>} - The updated image object.
 * @throws {Error} - Throws an error if the image is not found or the user is unauthorized to update the image.
 */
// UPDATE IMAGE
export async function updateImage({ image, userId, path }: UpdateImageParams) {
  try {
    await connect();

    const imageToUpdate = await Image.findById(image._id);

    if (!imageToUpdate || imageToUpdate.author.toHexString() !== userId) {
      throw new Error("Unauthorized or image not found");
    }

    const updatedImage = await Image.findByIdAndUpdate(
      imageToUpdate._id,
      image,
      { new: true }
    )

    revalidatePath(path);

    return JSON.parse(JSON.stringify(updatedImage));
  } catch (error) {
    handleError(error)
  }
}; // End of updateImage

/**
 * Deletes an image by its unique identifier.
 *
 * @param {string} imageId - The unique identifier of the image to delete.
 * @returns {Promise<void>} - A promise that resolves when the image is deleted.
 * @throws {Error} - Throws an error if the image is not found or there is an issue deleting the image.
 */
// DELETE IMAGE
export async function deleteImage(imageId: string) {
  try {
    await connect();

    await Image.findByIdAndDelete(imageId);
  } catch (error) {
    handleError(error)
  } finally{
    redirect('/')
  }
}; // End of deleteImage

/**
 * Retrieves an image by its unique identifier.
 *
 * @param {string} imageId - The unique identifier of the image to retrieve.
 * @returns {Promise<any>} - The retrieved image object.
 * @throws {Error} - Throws an error if the image is not found.
 */
// GET IMAGE
export async function getImageById(imageId: string) {
  try {
    await connect();

    const image = await populateUser(Image.findById(imageId));

    if(!image) throw new Error("Image not found");

    return JSON.parse(JSON.stringify(image));
  } catch (error) {
    handleError(error)
  }
}; // End of getImageById

/**
 * Retrieves all images from the database, with pagination and optional search query support.
 *
 * @param {Object} options - The options for retrieving the images.
 * @param {number} [options.limit=9] - The maximum number of images to retrieve per page.
 * @param {number} options.page - The page number to retrieve.
 * @param {string} [options.searchQuery=''] - The search query to filter the images.
 * @returns {Promise<{ data: any[]; totalPage: number; savedImages: number }>} - An object containing the retrieved images, the total number of pages, and the total number of saved images.
 */
// GET IMAGES
export async function getAllImages({ limit = 9, page = 1, searchQuery = '' }: {
  limit?: number;
  page: number;
  searchQuery?: string;
}) {
  try {
    await connect();

    cloudinary.config({
      cloud_name: process.env.NEXT_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    })

    let expression = 'folder=imaginify';

    if (searchQuery) {
      expression += ` AND ${searchQuery}`
    }

    const { resources } = await cloudinary.search
      .expression(expression)
      .execute();

    const resourceIds = resources.map((resource: any) => resource.public_id);

    let query = {};

    if(searchQuery) {
      query = {
        publicId: {
          $in: resourceIds
        }
      }
    }

    const skipAmount = (Number(page) -1) * limit;

    const images = await populateUser(Image.find(query))
      .sort({ updatedAt: -1 })
      .skip(skipAmount)
      .limit(limit);
    
    const totalImages = await Image.find(query).countDocuments();
    const savedImages = await Image.find().countDocuments();

    return {
      data: JSON.parse(JSON.stringify(images)),
      totalPage: Math.ceil(totalImages / limit),
      savedImages,
    }
  } catch (error) {
    handleError(error)
  }
}; // End of getAllImages

/**
 * Retrieves the user's images from the database, with pagination support.
 *
 * @param {Object} options - The options for retrieving the user's images.
 * @param {number} [options.limit=9] - The maximum number of images to retrieve per page.
 * @param {number} options.page - The page number to retrieve.
 * @param {string} options.userId - The ID of the user whose images to retrieve.
 * @returns {Promise<{ data: any[]; totalPages: number }>} - An object containing the retrieved images and the total number of pages.
 */
// GET IMAGES BY USER
export async function getUserImages({
  limit = 9,
  page = 1,
  userId,
}: {
  limit?: number;
  page: number;
  userId: string;
}) {
  try {
    await connect();

    const skipAmount = (Number(page) - 1) * limit;

    const images = await populateUser(Image.find({ author: userId }))
      .sort({ updatedAt: -1 })
      .skip(skipAmount)
      .limit(limit);

    const totalImages = await Image.find({ author: userId }).countDocuments();

    return {
      data: JSON.parse(JSON.stringify(images)),
      totalPages: Math.ceil(totalImages / limit),
    };
  } catch (error) {
    handleError(error);
  }
}; // End of getUserImages