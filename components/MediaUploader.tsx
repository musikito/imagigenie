/**
 * The MediaUploader component is responsible for handling the upload of media files, such as images, to a cloud storage service (Cloudinary).
 * 
 * It provides a user interface for initiating the upload process, and handles the success and error cases of the upload operation.
 * 
 * When a media file is successfully uploaded, the component updates the state with the relevant information about the uploaded file, such as the public ID, width, height, and secure URL.
 * It also calls the `onValueChange` function provided as a prop to notify the parent component of the new value (the public ID of the uploaded media).
 * 
 * If an error occurs during the upload process, the component displays an error toast notification to the user.
 * 
 * @param onValueChange - A function that is called when the value changes, taking the new value (public ID of the uploaded media) as a parameter.
 * @param setImage - A function to set the image state.
 * @param publicId - The public ID of the uploaded image.
 * @param image - The image data.
 * @param type - The type of the uploaded media.
 */
"use client";

import { dataUrl, getImageSize } from "@/lib/utils";
import { useToast } from "./ui/use-toast";
import { CldImage, CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import { PlaceholderValue } from "next/dist/shared/lib/get-img-props";

/**
 * Defines the props for the MediaUploader component.
 * 
 * @param onValueChange - A function that is called when the value changes, taking the new value as a parameter.
 * @param setImage - A function to set the image state.
 * @param publicId - The public ID of the uploaded image.
 * @param image - The image data.
 * @param type - The type of the uploaded media.
 */
type MediaUploaderProps = {
    onValueChange: (value: string) => void;
    setImage: React.Dispatch<any>,
    publicId: string;
    image: string;
    type: string;
}; // End of MediaUploaderProps

const MediaUploader = (
    {
        onValueChange,
        setImage,
        publicId,
        image,
        type,
    }: MediaUploaderProps) => {

    /**
     * Const block
     */
    const { toast } = useToast();
    /**
     * Handles the success event of a media upload operation.
     * 
     * @param result - The result object containing information about the uploaded media.
     * @param result.info - The information about the uploaded media.
     * @param result.info.public_id - The public ID of the uploaded media.
     * @param result.info.width - The width of the uploaded media.
     * @param result.info.height - The height of the uploaded media.
     * @param result.info.secure_url - The secure URL of the uploaded media.
     * @param setImage - The function to update the image state.
     * @param onValueChange - The function to notify the value change.
     * @param toast - The function to display a success toast notification.
     */
    const onUploadSuccessHandler = (result: any) => {
        
        setImage((prevState: any) =>({
            ...prevState,
            publicId: result?.info.public_id,
            width: result?.info?.width,
            height: result?.info.height,
            secureURL: result?.info.secure_url,
        }));
        onValueChange(result?.info?.public_id);


        toast({
            title: "Success, Media uploaded successfully",
            description: "1 credit was deducted from your account",
            duration: 5000,
            className: "success-toast",
        });
    }; // end of onUploadSuccessHandler
    const onUploadErrorHandler = () => {
        toast({
            title: "Something went wrong",
            description: "Media upload failed, Please try again",
            duration: 5000,
            className: "error-toast"
        });
    }; // End of onUploadErrorHandler

    return (
        <CldUploadWidget
            uploadPreset="imagegenie"
            options={{
                multiple: false,
                resourceType: "image",
            }}
            onSuccess={onUploadSuccessHandler}
            onError={onUploadErrorHandler}
        >
            {({ open }) => {
                return (
                    <div className="flex flex-col gap-4">
                        <h3 className="h3-bold text-dark">Original</h3>
                        {publicId ? (
                            <>
                                <div className="cursor-pointer overflow-hidden rounded-[10px]">
                                    <CldImage
                                    width={getImageSize(type, image, "width")}
                                    height={getImageSize(type, image, "height")}
                                    src={publicId}
                                    alt="uploaded image"
                                    sizes={"(max-width: 768px) 100vw, 50vw"}
                                    placeholder={ dataUrl as PlaceholderValue}
                                    className="media-uploader_cldImage"
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="media-uploader_cta" onClick={() => open()}>
                                <div className="media-uploader_cta-image">
                                    <Image
                                        src="/assets/icons/add.svg"
                                        alt="Add Image"
                                        width={24}
                                        height={24}
                                    />

                                </div>
                                <p className="p-14-medium">Click here to upload Image</p>
                            </div>
                        )}
                    </div>
                );
            }}
        </CldUploadWidget>
    );
};

export default MediaUploader;