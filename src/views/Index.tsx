"use client";

import dynamic from "next/dynamic";

const DynamicFrontend = dynamic(() => import("@/components/frontend/DynamicFrontend"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
        <div className="h-12 w-44 animate-pulse rounded-md bg-muted" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="h-44 animate-pulse rounded-xl bg-muted" />
          <div className="h-44 animate-pulse rounded-xl bg-muted" />
          <div className="h-44 animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    </div>
  ),
});

const Index = () => {
  return (
    <div className="relative"><DynamicFrontend /></div>
  );
};

export default Index;
