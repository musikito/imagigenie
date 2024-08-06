"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { defaultValues } from "@/constants";
 
const formSchema = z.object({
    // username: z.string().min(2).max(50),
    title: z.string(),
    aspectRatio: z.string().optional(),
    color: z.string().optional(),
    prompt: z.string().optional(),
    publicId: z.string(),
  });

const TransformationForm = ({ action, data =null}: TransformationFormProps) => {
  /**
   * Initializes the form values based on the provided `data` and `action` props.
   * If `action` is "Update" and `data` is provided, the form values are initialized
   * with the values from `data`. Otherwise, the form values are initialized with
   * the `defaultValues` constant.
   */
  const initialValues = data && action === "Update" ? {
    title:data?.title, 
    aspectRatio:data?.aspectRatio, 
    color:data?.color, 
    prompt:data?.promtpt, 
    publicId:data?.publicId, 

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
  };
 

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
};

export default TransformationForm;