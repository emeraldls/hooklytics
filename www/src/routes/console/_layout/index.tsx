import {
  createFileRoute,
  redirect,
  useLoaderData,
} from "@tanstack/react-router";
import data from "~/utils/data.json";
import { ChartAreaInteractive } from "~/components/chart-area-interactive";
import { DataTable } from "~/components/data-table";
import { SectionCards } from "~/components/section-cards";
import { getServerWebsites, hasAnyWebsite } from "~/server-fn/website-fn";
import { useWebsiteActions, useWebsiteState } from "~/stores/website-store";

export const Route = createFileRoute("/console/_layout/")({
  component: Home,
  beforeLoad: async () => {
    const { hasAny } = await hasAnyWebsite();
    if (!hasAny)
      throw redirect({
        to: "/console/setup",
      });
  },
  loader: async () => {
    try {
      const websites = await getServerWebsites({ data: { limit: 1, page: 1 } });
      return websites;
    } catch {}
  },
});

function Home() {
  const loaderData = Route.useLoaderData();
  const currentWebsite = useWebsiteState();
  const { setCurrentWebsite } = useWebsiteActions();
  if (loaderData && loaderData.data.length > 0 && !currentWebsite) {
    setCurrentWebsite(loaderData.data[0]);
  }

  return (
    <>
      <SectionCards />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
      <DataTable data={data} />
    </>
  );
}
