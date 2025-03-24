"use client";

import dynamic from "next/dynamic";

const ReportPage = dynamic(() => import("@/app/report/ReportPage"), {
  ssr: false,
});

export default function Page() {
  return <ReportPage />;
}