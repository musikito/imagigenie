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
import { aspectRatioOptions, defaultValues, transformationTypes } from "@/constants";
import { CustomField } from "./CustomField";
import { useState } from "react";
import { AspectRatioKey } from "@/lib/utils";

export const formSchema = z.object({
  // username: z.string().min(2).max(50),
  title: z.string(),
  aspectRatio: z.string().optional(),
  color: z.string().optional(),
  prompt: z.string().optional(),
  publicId: z.string(),
});

const TransformationForm = ({ action, data = null, userId, type, creditBalance }: TransformationFormProps) => {
  /**
   * Initializes the `transformationType` variable with the corresponding transformation type based on the `type` prop.
   * Also initializes the `image` state with the `data` prop, and the `newTransformation` state with `null`.
   *
   * @param type - The type of transformation, used to look up the corresponding transformation type in the `transformationTypes` object.
   * @param data - The initial data for the image being transformed.
   */
  const transformationType = transformationTypes[type];
  const [image, setImage] = useState(data);
  const [newTransformation, setNewTransformation] = useState<Transformations | null>(null);
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


  /**
   * Handles the form submission by logging the form values to the console.
   *
   * @param values - The form values, which are validated against the `formSchema`.
   */
  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }; // End of onSubmit

  const onSelectFieldHandler = (value: string, onChangeField: (value: string) => void) => { };


  return (

    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

        <CustomField
          name="title"
          control={form.control}
          formLabel="Image Title"
          className="w-full"
          render={({ field }) => <Input {...field} className="input-field" />}
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
        )}
      </form>
    </Form>
  );
};

export default TransformationForm;