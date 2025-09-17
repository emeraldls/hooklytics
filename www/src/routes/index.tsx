import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/")({
  component: Home,
  beforeLoad() {
    throw redirect({ to: "/console" });
  },
});

function Home() {
  return <div>Hello world</div>;
}
