"use client";

import dynamic from "next/dynamic";

const HospitalPage = dynamic(() => import("@/app/hospitals/HospitalPage"), {
  ssr: false,
});

export default function Page() {
  return <HospitalPage />;
}
