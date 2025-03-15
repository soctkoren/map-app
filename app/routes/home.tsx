import type { Route } from "./+types/home";
import { lazy, Suspense } from "react";

const Map = lazy(() => import("../../src/components/Map"));

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Map Application" },
    { name: "description", content: "Interactive map with routing capabilities" },
  ];
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading map...</div>}>
      <Map />
    </Suspense>
  );
}
