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
import { startTransition, useState, useTransition } from "react";
import { AspectRatioKey, debounce, deepMergeObjects } from "@/lib/utils";
import { set } from "mongoose";
import { updateCredits } from "@/lib/actions/user.action";

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
  const [ isPending, setTransition] = useTransition();




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
  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
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
  }; // End of onSelectFieldHandler

  /**
   * Debounces the input change event and updates the `newTransformation` state with the new field value.
   *
   * @param fieldName - The name of the field that was changed.
   * @param value - The new value of the field.
   * @param type - The type of the field (e.g. "prompt" or "to").
   * @param onChangeField - A callback function to update the form field value.
   *
   * This function uses the `debounce` utility to delay the update of the `newTransformation` state by 1 second.
   * This helps to prevent excessive updates and improve performance when the user is typing quickly.
   * The function then updates the `newTransformation` state with the new field value and calls the `onChangeField`
   * callback to update the corresponding form field.
   */
  const onInputChangeHandler = (fieldName: string, value: string, type: string, onChangeField: (value: string) => void) => {
    debounce(() => {
      setNewTransformation((prevState: any) => ({
        ...prevState,
        [type]: {
          ...prevState[type],
          [fieldName === "prompt" ? "prompt" : "to"]: value,
        }
      }));
      return onChangeField(value);
    }, 1000);
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
    startTransition(async () =>{
      // await updateCredits(userId, creditFee);

    })

  };// End of onTransformHandler





  return (

    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

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
              render={(({ field }) => (
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
              ))}
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
        )} {/* End of type === "remove" || type === "recolor" */}

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