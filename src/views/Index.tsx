"use client";

import dynamic from "next/dynamic";

const HomePageLoader = () => (
  <div className="min-h-screen bg-background">
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-12">
      <div className="h-6 w-40 animate-pulse rounded-md bg-muted" />
      <div className="mt-6 h-10 w-72 animate-pulse rounded-md bg-muted" />
      <div className="mt-3 h-5 w-80 max-w-full animate-pulse rounded-md bg-muted" />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="h-48 animate-pulse rounded-xl bg-muted" />
        <div className="h-48 animate-pulse rounded-xl bg-muted" />
        <div className="h-48 animate-pulse rounded-xl bg-muted" />
      </div>
    </div>
  </div>
);

const DynamicFrontend = dynamic(() => import("@/components/frontend/DynamicFrontend"), {
  loading: () => <HomePageLoader />,
});

const Index = () => {
  return (
    <div className="relative"><DynamicFrontend /></div>
  );
};

export default Index;
