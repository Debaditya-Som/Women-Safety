"use client";

import dynamic from "next/dynamic";

const PolicePage = dynamic(() => import("@/app/police/PolicePage"), {
  ssr: false,
});

export default function Page() {
  return <PolicePage />;
}
