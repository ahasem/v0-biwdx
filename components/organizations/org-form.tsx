"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { organizationSchema, type OrganizationInput } from "@/lib/validators";
import { organization } from "@/lib/auth-client";

interface OrgFormProps {
  mode?: "create" | "edit";
  initialData?: {
    id: string;
    name: string;
    slug: string | null;
  };
}

export function OrgForm({ mode = "create", initialData }: OrgFormProps) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const form = useForm<OrganizationInput>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: initialData?.name || "",
      slug: initialData?.slug || "",
    },
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleNameChange = (value: string) => {
    form.setValue("name", value);
    if (mode === "create" && !form.getValues("slug")) {
      form.setValue("slug", generateSlug(value));
    }
  };

  const handleSubmit = async (data: OrganizationInput) => {
    setLoading(true);
    try {
      if (mode === "create") {
        const result = await organization.create({
          name: data.name,
          slug: data.slug || generateSlug(data.name),
        });

        if (result?.error) {
          toast.error(result.error.message || "Failed to create organization");
        } else if (result?.data) {
          toast.success("Organization created successfully!");
          router.push(`/organizations/${result.data.id}`);
        }
      } else if (initialData) {
        const result = await organization.update({
          organizationId: initialData.id,
          data: {
            name: data.name,
            slug: data.slug,
          },
        });

        if (result?.error) {
          toast.error(result.error.message || "Failed to update organization");
        } else {
          toast.success("Organization updated successfully!");
          router.refresh();
        }
      }
    } catch (error) {
      toast.error(
        mode === "create"
          ? "Failed to create organization"
          : "Failed to update organization"
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Create Organization" : "Organization Settings"}
        </CardTitle>
        <CardDescription>
          {mode === "create"
            ? "Create a new organization to collaborate with your team"
            : "Update your organization details"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Acme Inc."
                      {...field}
                      onChange={(e) => handleNameChange(e.target.value)}
                    />
                  </FormControl>
                  <FormDescription>
                    This is your organization&apos;s display name
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="acme-inc" {...field} />
                  </FormControl>
                  <FormDescription>
                    A unique identifier for your organization (URL-friendly)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === "create" ? "Create Organization" : "Save Changes"}
              </Button>
              {mode === "edit" && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
