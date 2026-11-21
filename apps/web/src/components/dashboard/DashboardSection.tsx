"use client";

import React from "react";

interface DashboardSectionProps {
  /** Visually hidden heading, kept for screen readers and document outline. */
  title: string;
  children: React.ReactNode;
}

export function DashboardSection({ title, children }: DashboardSectionProps) {
  return (
    <section aria-label={title}>
      <h2 className="sr-only">{title}</h2>
      {children}
    </section>
  );
}
