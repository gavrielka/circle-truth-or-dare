import { createFileRoute } from "@tanstack/react-router";
import { CircleApp } from "@/components/circle-app";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return <CircleApp />;
}
