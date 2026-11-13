"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ReportingPeriod } from "../types";
import { dashboardRepository } from "../services/dashboardRepository";

export function useDashboardData(initialPeriod: ReportingPeriod = "2024-2025") {
  const [period, setPeriod] = useState<ReportingPeriod>(initialPeriod);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["dashboard", period],
    queryFn: () => dashboardRepository.getDashboardData(period),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  return {
    period,
    setPeriod,
    data,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  };
}
