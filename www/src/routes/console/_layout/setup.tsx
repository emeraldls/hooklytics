import * as React from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { addWebsite, hasAnyWebsite } from "~/server-fn/website-fn";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import { useWebsiteActions } from "~/stores/website-store";

const websiteSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Max 50 chars")
    .regex(/^[\w\s-]+$/, "Only letters, numbers, spaces and -")
    .transform((v) => v.trim()),
  domain: z.url("Enter a valid URL incl. protocol e.g. https://example.com"),
});

export const Route = createFileRoute("/console/_layout/setup")({
  beforeLoad: async () => {
    const res = await hasAnyWebsite();
    if (res.hasAny) {
      throw redirect({ to: "/console" });
    }
    return {};
  },
  component: RouteComponent,
});

function RouteComponent() {
  const addWebsiteFn = useServerFn(addWebsite);
  const qc = useQueryClient();
  const [form, setForm] = React.useState({ name: "", domain: "" });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const { setCurrentWebsite } = useWebsiteActions();

  const mutation = useMutation({
    mutationFn: async () => {
      const parsed = websiteSchema.safeParse(form);
      if (!parsed.success) {
        const fieldErrors: Record<string, string> = {};
        parsed.error.issues.forEach((i) => {
          if (i.path[0]) fieldErrors[i.path[0] as string] = i.message;
        });
        setErrors(fieldErrors);
        throw new Error("validation");
      }
      setErrors({});
      return addWebsiteFn({ data: parsed.data });
    },
    onSuccess: (res) => {
      toast.success("Website created", { description: res.message });

      qc.invalidateQueries({ queryKey: ["websites"] });
      setCurrentWebsite(res.data);
      window.location.href = "/console";
    },
    onError: (err: any) => {
      if (err?.message !== "validation") {
        toast.error("Failed to create website", {
          description: err instanceof Error ? err.message : "Unknown error",
        });
      }
    },
  });

  const onChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mutation.isPending) return;
    mutation.mutate();
  };

  return (
    <div className="h-screen flex items-center justify-center flex-col border w-full">
      <div className="px-4 lg:px-8 py-8 max-w-xl ">
        <h1 className="text-2xl font-semibold mb-2">
          Create your first website
        </h1>
        <p className="text-muted-foreground mb-6 text-sm">
          You need at least one website to start sending analytics. Provide a
          friendly name and the full URL (we'll extract the domain).
        </p>
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Marketing Site"
              value={form.name}
              onChange={onChange}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-destructive text-xs mt-1">{errors.name}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="domain">Website URL</Label>
            <Input
              id="domain"
              name="domain"
              type="url"
              placeholder="https://example.com"
              value={form.domain}
              onChange={onChange}
              aria-invalid={!!errors.domain}
            />
            {errors.domain && (
              <p className="text-destructive text-xs mt-1">{errors.domain}</p>
            )}
          </div>
          <Button
            type="submit"
            disabled={mutation.isPending}
            className="w-full"
          >
            {mutation.isPending ? "Creating..." : "Create Website"}
          </Button>
        </form>
      </div>
    </div>
  );
}
