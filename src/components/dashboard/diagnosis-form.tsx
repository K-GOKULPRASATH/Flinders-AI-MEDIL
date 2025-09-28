"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Search } from "lucide-react";

export const diagnosisFormSchema = z.object({
  patientId: z.string().min(1, "Patient ID is required."),
  medicalSystem: z.enum(["Ayurveda", "Unani", "Siddha", "ICD"], {
    required_error: "You need to select a medical system.",
  }),
  diagnosis: z.string().min(3, "Diagnosis must be at least 3 characters."),
});

export type DiagnosisFormValues = z.infer<typeof diagnosisFormSchema>;

interface DiagnosisFormProps {
  onSubmit: (data: DiagnosisFormValues) => void;
  isSubmitting: boolean;
}

export function DiagnosisForm({ onSubmit, isSubmitting }: DiagnosisFormProps) {
  const form = useForm<DiagnosisFormValues>({
    resolver: zodResolver(diagnosisFormSchema),
    defaultValues: {
      patientId: "",
      diagnosis: "",
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Diagnosis Code Mapper</CardTitle>
        <CardDescription>
          Enter patient and diagnosis information to get code suggestions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="patientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient ID</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., PID-12345" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="medicalSystem"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medical System</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a system" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Ayurveda">Ayurveda</SelectItem>
                        <SelectItem value="Unani">Unani</SelectItem>
                        <SelectItem value="Siddha">Siddha</SelectItem>
                        <SelectItem value="ICD">ICD (Modern)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="diagnosis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Diagnosis</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter a diagnosis..."
                      {...field}
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mapping...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Map Codes
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
