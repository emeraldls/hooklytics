import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getWebRequest } from "@tanstack/react-start/server";
import { getSession } from "~/lib/auth-client";
import { SiteHeader } from "~/components/site-header";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import { AppSidebar } from "~/components/app-sidebar";
import { useQuery } from "@tanstack/react-query";

const fetchUser = createServerFn({ method: "GET" }).handler(async (ctx) => {
  const request = getWebRequest();
  const session = await getSession({
    fetchOptions: {
      headers: request.headers,
    },
  });

  if (!session.data?.session) {
    return null;
  }

  return session.data;
});

export const Route = createFileRoute("/console/_layout")({
  component: RouteComponent,
  beforeLoad: async (ctx) => {
    const user = await fetchUser();

    if (!user) {
      throw redirect({ to: "/login", search: { redirect: "/console" } });
    }

    return {
      user,
    };
  },
});

function RouteComponent() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
