"use client";

import dynamic from "next/dynamic";

const MapPage = dynamic(() => import("@/app/map/MapPage"), {
  ssr: false,
});

export default function Page() {
  return <MapPage />;
}
