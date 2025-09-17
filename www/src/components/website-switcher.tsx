import * as React from "react";
import { ChevronsUpDown, Plus } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "~/components/ui/sidebar";
import { useWebsiteState, useWebsiteActions } from "~/stores/website-store";
import { addWebsite, getServerWebsites } from "~/server-fn/website-fn";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";

export function WebsiteSwitcher() {
  const { isMobile } = useSidebar();

  const getWebsites = useServerFn(getServerWebsites);
  const addWebsiteFn = useServerFn(addWebsite);
  const qc = useQueryClient();

  const { data, status } = useInfiniteQuery({
    queryKey: ["websites"],
    queryFn: ({ pageParam = 1 }) =>
      getWebsites({ data: { limit: 10, page: pageParam } }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { pagination } = lastPage;
      if (pagination.page < pagination.totalPages) {
        return pagination.page + 1;
      }

      return undefined;
    },
  });

  const websites = data?.pages.flatMap((page) => page.data) || [];

  const [openNewWebsitePopup, setOpenNewWebsitePopup] = React.useState(false);
  const { setCurrentWebsite } = useWebsiteActions();

  const [form, setForm] = React.useState({ name: "", domain: "" });
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const schema = React.useMemo(
    () =>
      z.object({
        name: z
          .string()
          .min(1, "Name is required")
          .max(50, "Max 50 chars")
          .regex(/^[\w\s-]+$/, "Only letters, numbers, spaces and -")
          .transform((v) => v.trim()),
        domain: z
          .string()
          .url("Provide a full URL incl. protocol e.g. https://example.com"),
      }),
    []
  );

  const mutation = useMutation({
    mutationFn: async () => {
      const parsed = schema.safeParse(form);
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
      if (res.data) {
        setCurrentWebsite(res.data);
      }
      setOpenNewWebsitePopup(false);
      setForm({ name: "", domain: "" });
    },
    onError: (err: any) => {
      if (err?.message !== "validation") {
        toast.error("Creation failed", {
          description: err instanceof Error ? err.message : "Unknown error",
        });
      }
    },
  });

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mutation.isPending) return;
    mutation.mutate();
  };

  const currentWebsite = useWebsiteState();
  if (!currentWebsite) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg"></div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {currentWebsite.name}
                </span>
                <span className="truncate text-xs">
                  {currentWebsite.domain}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Websites
            </DropdownMenuLabel>
            {status === "success" &&
              websites.length > 0 &&
              websites.map((w, index) => {
                return (
                  <DropdownMenuItem
                    key={w.name}
                    className="gap-2 p-2"
                    disabled={currentWebsite.id === w.id}
                    onClick={() => {
                      if (currentWebsite.id === w.id) {
                        return;
                      }
                      setCurrentWebsite(w);
                    }}
                  >
                    <div className="flex size-6 items-center justify-center rounded-md border"></div>
                    {w.name}
                    <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                  </DropdownMenuItem>
                );
              })}

            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 p-2"
              onClick={() => setOpenNewWebsitePopup(true)}
            >
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <Plus className="size-4" />
              </div>
              <div className="text-muted-foreground font-medium">
                Add Website
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Dialog
          open={openNewWebsitePopup}
          onOpenChange={(open) => setOpenNewWebsitePopup(open)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Website</DialogTitle>
            </DialogHeader>
            <form onSubmit={onSubmit} className="space-y-5 mt-2">
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
                  <p className="text-destructive text-xs mt-1">
                    {errors.domain}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                disabled={mutation.isPending}
                className="w-full"
              >
                {mutation.isPending ? "Creating..." : "Create"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
