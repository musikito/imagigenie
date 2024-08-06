/**
 * A custom form field component that renders a form field with a label, control, and message.
 *
 * @param control - The `Control` object from the `react-hook-form` library, used to manage the form state.
 * @param render - A function that takes a `field` object and returns the JSX to render the form control.
 * @param name - The name of the form field, which should match a key in the form schema.
 * @param formLabel - An optional label to display for the form field.
 * @param className - An optional CSS class name to apply to the form item.
 */

import { Control } from "react-hook-form";
import { z } from "zod";

import {
    FormField,
    FormItem,
    FormControl,
    FormMessage,
    FormLabel,
} from "./ui/form";

import { formSchema } from "./TransformationForm";

type CustomFieldProps = {
    control: Control<z.infer<typeof formSchema>> | undefined;
    render: (props: { field: any }) => React.ReactNode;
    name: keyof z.infer<typeof formSchema>;
    formLabel?: string;
    className?: string;
};

export const CustomField = ({
    control,
    render,
    name,
    formLabel,
    className,
}: CustomFieldProps) => {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem className={className}>
                    {formLabel && <FormLabel>{formLabel}</FormLabel>}
                    <FormControl>{render({ field })}</FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
};