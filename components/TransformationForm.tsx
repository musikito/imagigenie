/**
 * The `TransformationForm` component is a React component that renders a form for creating or updating image transformations.
 * 
 * The component uses the `react-hook-form` library to manage the form state and validation, and the `zod` library to define the schema for the form data.
 * 
 * The component supports three types of transformations: "fill", "remove", and "recolor". The form fields and functionality vary depending on the transformation type.
 * 
 * The component provides the following functionality:
 * - Allows the user to upload an image and preview the transformed image
 * - Allows the user to select an aspect ratio for the "fill" transformation type
 * - Allows the user to enter a prompt for the "remove" and "recolor" transformation types
 * - Allows the user to enter a color for the "recolor" transformation type
 * - Provides a "Transform" button to apply the transformation to the image
 * - Provides a "Save Image" button to save the transformed image
 * 
 * The component also handles the submission of the form, updating the user's credits, and navigating to the transformed image page.
 */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


import { Input } from "@/components/ui/input";
import { aspectRatioOptions, creditFee, defaultValues, transformationTypes } from "@/constants";
import { CustomField } from "./CustomField";
import { startTransition, useEffect, useState, useTransition } from "react";
import { AspectRatioKey, debounce, deepMergeObjects } from "@/lib/utils";
import { updateCredits } from "@/lib/actions/user.actions";
import MediaUploader from "./MediaUploader";
import TransformedImage from "./TransformedImage";
import { getCldImageUrl } from "next-cloudinary";
import { addImage, updateImage } from "@/lib/actions/image.actions";
import { useRouter } from "next/navigation";
import { InsufficientCreditsModal } from "./InsufficientCreditsModal";


/**
 * A Zod schema that defines the shape of the form data for the TransformationForm component.
 * The schema includes the following fields:
 * - `title`: a string representing the title of the transformation
 * - `aspectRatio`: an optional string representing the aspect ratio of the transformation
 * - `color`: an optional string representing the color of the transformation
 * - `prompt`: an optional string representing the prompt for the transformation
 * - `publicId`: a string representing the public ID of the transformation
 */
export const formSchema = z.object({
  title: z.string(),
  aspectRatio: z.string().optional(),
  color: z.string().optional(),
  prompt: z.string().optional(),
  publicId: z.string(),
});

const TransformationForm = ({ action, data = null, userId, type, creditBalance, config = null }: TransformationFormProps) => {

  /** useState block */
  const transformationType = transformationTypes[type];
  const [image, setImage] = useState(data);
  const [newTransformation, setNewTransformation] = useState<Transformations | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);
  const [transformationConfig, setTransformationConfig] = useState(config);
  const [isPending, setTransition] = useTransition();
  const router = useRouter();




  /**
   * Initializes the `initialValues` object based on the `action` and `data` props passed to the `TransformationForm` component.
   * If `action` is "Update" and `data` is not null, the `initialValues` object is populated with the values from the `data` object.
   * Otherwise, the `initialValues` object is set to the `defaultValues` object.
   */
  const initialValues = data && action === "Update" ? {
    title: data?.title,
    aspectRatio: data?.aspectRatio,
    color: data?.color,
    prompt: data?.promtpt,
    publicId: data?.publicId,

  } : defaultValues; // End of initialValues



  /**
   * Initializes the form state using the `useForm` hook from `react-hook-form`.
   * The form state is initialized with the `initialValues` object, which is determined
   * based on the `action` and `data` props passed to the `TransformationForm` component.
   * The `zodResolver` function from `@hookform/resolvers/zod` is used to validate the
   * form values against the `formSchema` defined earlier in the file.
   */
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  });


  /** Functions block */


  async function onSubmit(values: z.infer<typeof formSchema>) {
    // console.log(values);
    setIsSubmitting(true);
    if (data || image) {
      const transformationUrl = getCldImageUrl({
        width: image?.width,
        height: image?.height,
        src: image?.publicId,
        ...transformationConfig,
      }); // End of transformationUrl

      const imageData = {
        title: values.title,
        publicId: image?.publicId,
        transformationType: type,
        width: image?.width,
        height: image?.height,
        config: transformationConfig,
        secureURL: image?.secureURL,
        transformationURL: transformationUrl,
        aspectRatio: values.aspectRatio,
        color: values.color,
        prompt: values.prompt,
      }; // End of imageData

      if (action === 'Add') {
        try {
          const newImage = await addImage({
            image: imageData,
            userId,
            path: "/",
          });

          if (newImage) {
            form.reset();
            setImage(data);
            router.push(`/transformations/${newImage._id}`);
            // setNewTransformation(null);
            // setIsSubmitting(false);
          }; // End of if newImage statement

        } catch (error) {
          console.log(error);

        }
      }; // End of if action statement

      if (action === "Update") {
        try {
          const updatedImage = await updateImage({
            image: {
              ...imageData,
              _id: data?._id,
            },
            userId,
            path: `/transformations/${data?._id}`,
          });

          if (updatedImage) {
            router.push(`/transformations/${updatedImage._id}`);
          }; // End of if newImage statement

        } catch (error) {
          console.log(error);

        }
      }; // End of if Update statement

    };// End if Data statement

    setIsSubmitting(false);
  }; // End of onSubmit

  /**
   * Handles the selection of an aspect ratio option from a dropdown.
   *
   * @param value - The selected aspect ratio option value.
   * @param onChangeField - A callback function to update the form field value.
   *
   * This function updates the `image` state with the corresponding aspect ratio, width, and height values
   * based on the selected aspect ratio option. It then calls the `onChangeField` callback to update the
   * form field value.
   */
  const onSelectFieldHandler = (value: string, onChangeField: (value: string) => void) => {
    const imageSize = aspectRatioOptions[value as AspectRatioKey];

    setImage((prevState: any) => ({
      ...prevState,
      aspectRatio: imageSize.aspectRatio,
      width: imageSize.width,
      height: imageSize.height,

    })); // End of setImage

    setNewTransformation(transformationType.config);

    return onChangeField(value);
  }; // End of onSelectFieldHandler

  /**
   * Handles the input change event for a form field.
   *
   * This function is used to update the `newTransformation` state with the latest value entered in a form field. It uses the `debounce` function to delay the update by 1 second, which helps to reduce the number of state updates and improve performance.
   *
   * @param fieldName - The name of the form field that was updated.
   * @param value - The new value entered in the form field.
   * @param type - The type of transformation (e.g. "fill", "resize") that the form field belongs to.
   * @param onChangeField - A callback function to update the form field value.
   *
   * @returns The result of calling the `onChangeField` callback with the new value.
   */
  const onInputChangeHandler = (fieldName: string, value: string, type: string, onChangeField: (value: string) => void) => {
    debounce(() => {
      setNewTransformation((prevState: any) => ({
        ...prevState,
        [type]: {
          ...prevState?.[type],
          [fieldName === 'prompt' ? 'prompt' : 'to']: value
        }
      }))
    }, 1000)();

    return onChangeField(value)
  }; // End of onInputChangeHandler


  /**
   * Handles the transformation process, updating the transformation configuration and triggering the transition.
   *
   * This function is called when the user wants to perform a transformation on an image. It first sets the `isTransforming` state to `true` to indicate that the transformation is in progress. It then merges the `newTransformation` object with the existing `transformationConfig` object and updates the `transformationConfig` state with the merged object. This ensures that the latest transformation settings are used for the transformation.
   *
   * Next, the function sets the `newTransformation` state to `null` to clear any pending transformation changes. Finally, it starts a transition and performs the transformation asynchronously. The commented-out code suggests that this function may also update the user's credits, but this functionality is not currently implemented.
   */
  // TODO: Return to this function and implement the functionality to update the user's credits.
  const onTransformHandler = async () => {
    setIsTransforming(true);

    setTransformationConfig(
      deepMergeObjects(
        newTransformation,
        transformationConfig,
      )
    );// End of setTransformationConfig
    setNewTransformation(null);
    startTransition(async () => {
      await updateCredits(userId, creditFee);

    })

  };// End of onTransformHandler



  useEffect(() => {
    if (image && (type === "restore" || type === "removeBackground")) {
      setNewTransformation(transformationType.config);
    }
  }, [image, transformationType.config, type]); // End of useEffect

  return (

    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {creditBalance < Math.abs(creditFee) && <InsufficientCreditsModal />}

        <CustomField
          name="title"
          control={form.control}
          formLabel="Image Title"
          className="w-full"
          render={({ field }) => (<Input {...field} className="input-field" />)}
        />

        {type === "fill" && (
          <CustomField
            name="aspectRatio"
            control={form.control}
            formLabel="Aspect Ratio"
            className="w-full"
            render={({ field }) => (
              <Select
                onValueChange={(value) => onSelectFieldHandler(value, field.onChange)}
                value={field.value}
              >
                <SelectTrigger className="select-field">
                  <SelectValue placeholder="Select Size" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(aspectRatioOptions).map(
                    (key) => (
                      <SelectItem key={key} value={key} className="select-item">
                        {aspectRatioOptions[key as AspectRatioKey].label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            )}
          />
        )} {/* End of type === "fill" */}

        {(type === "remove" || type === "recolor") && (
          <div className="prompt-field">
            <CustomField
              control={form.control}
              name="prompt"
              formLabel={type === "remove" ? "Object to remove" : "Object to recolor"}
              className="w-full"
              render={({ field }) => (
                <Input
                  value={field.value}
                  className="input-field"
                  onChange={
                    (e) => onInputChangeHandler(
                      'prompt',
                      e.target.value,
                      type,
                      field.onChange,)
                  }
                />
              )}
            />
            {type === "recolor" && (
              <CustomField
                name="color"
                control={form.control}
                formLabel="Replacement Color"
                className="w-full"
                render={({ field }) => (
                  <Input
                    value={field.value}
                    className="input-field"
                    onChange={
                      (e) => onInputChangeHandler(
                        'color',
                        e.target.value,
                        'recolor',
                        field.onChange,
                      )
                    }
                  />
                )}
              />
            )}
          </div>
        )} {/* End of recolor */}

        {/**
         * Renders a media uploader field and a transformed image preview for the TransformationForm component.
         * 
         * The media uploader field allows the user to upload an image, which is then stored in the `image` state.
         * The transformed image preview displays the uploaded image with the specified transformation configuration.
         * 
         * @param form - The form object from the react-hook-form library, used to control the form state.
         * @param setImage - A function to update the `image` state.
         * @param transformationConfig - The current transformation configuration.
         * @param type - The type of transformation being performed (e.g. "fill", "remove", "recolor").
         * @param isTransforming - A boolean indicating whether the image is currently being transformed.
         * @param setIsTransforming - A function to update the `isTransforming` state.
         */}
        <div className="media-uploader-filed">
          <CustomField
            name="publicId"
            control={form.control}
            className="flex size-full flex-col"
            render={({ field }) => (
              <MediaUploader
                onValueChange={field.onChange}
                setImage={setImage}
                publicId={field.value}
                image={image}
                type={type}
              />
            )}
          />
          {/* Transformed Image */}
          {/**
           * Renders a transformed image preview for the TransformationForm component.
           * 
           * The transformed image preview displays the uploaded image with the specified transformation configuration.
           * 
           * @param image - The uploaded image to be transformed.
           * @param transformationConfig - The current transformation configuration.
           * @param type - The type of transformation being performed (e.g. "fill", "remove", "recolor").
           * @param title - The title of the transformed image.
           * @param isTransforming - A boolean indicating whether the image is currently being transformed.
           * @param setIsTransforming - A function to update the `isTransforming` state.
           */}
          <TransformedImage
            image={image}
            transformationConfig={transformationConfig}
            type={type}
            title={form.getValues().title}
            isTransforming={isTransforming}
            setIsTransforming={setIsTransforming}

          />

        </div>

        <div className="flex flex-col gap-4">
          <Button
            type="button"
            className="submit-button capitalize"
            disabled={isTransforming || newTransformation === null}
            onClick={onTransformHandler}
          >{isTransforming ? "Transforming..." : "Apply Transformation"}
          </Button>



          <Button
            type="submit"
            className="submit-button capitalize"
            disabled={isSubmitting}
          >{isSubmitting ? "Submitting..." : "Save Image"}
          </Button>
        </div>


      </form>
    </Form>
  );
};

export default TransformationForm;