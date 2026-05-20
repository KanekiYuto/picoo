"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  FileText,
  InboxIcon,
  TrendingDown,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/useUserStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UsageStatsSkeleton } from "./_components/UsageStatsSkeleton";
import { UsageTableSkeleton } from "./_components/UsageTableSkeleton";

interface UsageRecord {
  id: string;
  type: string;
  amount: number;
  balanceAfter: number;
  note: string | null;
  createdAt: string;
}

export default function UsagePage() {
  const tPage = useTranslations("settings.page");
  const tProfile = useTranslations("settings.profile");
  const tUsage = useTranslations("settings.usage");
  const { user, isLoading: userLoading } = useUserStore();
  const [records, setRecords] = useState<UsageRecord[]>([]);
  const [stats, setStats] = useState({ totalConsumed: 0, totalRecords: 0, avgPerRecord: 0 });
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [isRecordsLoading, setIsRecordsLoading] = useState(true);
  const [usageFilter, setUsageFilter] = useState<"all" | "consume" | "refund">("all");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!user) {
      setStats({ totalConsumed: 0, totalRecords: 0, avgPerRecord: 0 });
      setIsStatsLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchStats = async () => {
      try {
        setIsStatsLoading(true);
        const response = await fetch("/api/credit/usage/stats", {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Failed to fetch stats");
        const data = await response.json();
        setStats(data);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("Failed to fetch stats:", error);
      } finally {
        if (controller.signal.aborted) return;
        setIsStatsLoading(false);
      }
    };

    fetchStats();
    return () => controller.abort();
  }, [user]);

  useEffect(() => {
    if (!user) {
      setRecords([]);
      setTotalPages(1);
      setIsRecordsLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchRecords = async () => {
      setIsRecordsLoading(true);

      try {
        const params = new URLSearchParams({
          page: page.toString(),
          pageSize: pageSize.toString(),
          type: usageFilter,
        });
        const response = await fetch(`/api/credit/usage/records?${params}`, {
          signal: controller.signal,
        });

        if (!response.ok) throw new Error("Failed to fetch records");

        const data = await response.json();
        setRecords(data.records || []);
        setTotalPages(data.totalPages || 1);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("Failed to fetch records:", error);
        setRecords([]);
        setTotalPages(1);
      } finally {
        if (controller.signal.aborted) return;
        setIsRecordsLoading(false);
      }
    };

    fetchRecords();
    return () => controller.abort();
  }, [user, page, pageSize, usageFilter]);

  const usageFilterOptions = [
    { value: "all" as const, label: tUsage("filter.all") },
    { value: "consume" as const, label: tUsage("filter.consume") },
    { value: "refund" as const, label: tUsage("filter.refund") },
  ];

  if (!user && !userLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-muted">{tProfile("notSignedIn")}</div>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">
            {tPage("usageTitle")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {tPage("usageDescription")}
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {userLoading || isStatsLoading ? (
            <UsageStatsSkeleton />
          ) : (
            <Card className="overflow-hidden rounded-2xl border-background-2 bg-background-1 shadow-none">
              <CardHeader className="flex flex-row items-center gap-2 px-4 py-2.5">
                <FileText className="size-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium">
                  {tUsage("sectionTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 rounded-t-2xl border-t border-background-2 bg-background p-4 sm:grid-cols-3">
                <div className="flex items-center gap-2 rounded-xl bg-background-1 p-3">
                  <TrendingDown />
                  <div>
                    <div className="text-xs text-muted-foreground">
                      {tUsage("stats.totalConsumed")}
                    </div>
                    <div className="text-lg font-semibold text-foreground">
                      {stats.totalConsumed.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-background-1 p-3">
                  <Calendar />
                  <div>
                    <div className="text-xs text-muted-foreground">
                      {tUsage("stats.recordCount")}
                    </div>
                    <div className="text-lg font-semibold text-foreground">
                      {stats.totalRecords}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-background-1 p-3">
                  <FileText />
                  <div>
                    <div className="text-xs text-muted-foreground">
                      {tUsage("stats.avgPerRecord")}
                    </div>
                    <div className="text-lg font-semibold text-foreground">
                      {stats.avgPerRecord}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="overflow-hidden rounded-2xl border-background-2 bg-background-1 shadow-none">
            <CardHeader className="flex flex-col gap-3 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium">
                  {tUsage("table.title")}
                </CardTitle>
              </div>
              <div className="flex rounded-full border border-background-2 bg-background-2/40 p-1">
                {usageFilterOptions.map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    variant={usageFilter === option.value ? "default" : "ghost"}
                    size="sm"
                    onClick={() => {
                      setUsageFilter(option.value);
                      setPage(1);
                    }}
                    className={cn("h-7 rounded-full px-3 text-xs", usageFilter !== option.value && "text-muted-foreground")}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="rounded-t-2xl border-t border-background-2 bg-background p-4">
              {isRecordsLoading ? (
                <UsageTableSkeleton />
              ) : records.length === 0 ? (
                <Empty className="rounded-xl border border-background-2 bg-background-2/40">
                  <EmptyHeader>
                    <EmptyMedia variant="icon" className="bg-sidebar-hover text-muted-foreground">
                      <InboxIcon />
                    </EmptyMedia>
                    <EmptyTitle className="text-sm font-medium text-foreground">
                      {tUsage("table.noRecords")}
                    </EmptyTitle>
                  </EmptyHeader>
                </Empty>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="grid gap-3 md:hidden">
                    {records.map((record) => (
                      <div key={record.id} className="rounded-xl bg-background-1 p-3">
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-foreground">
                              {record.note || "-"}
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">
                              {new Date(record.createdAt).toLocaleString()}
                            </div>
                          </div>
                          <Badge variant={record.type === "consume" ? "error" : "success"}>
                            {tUsage(`table.types.${record.type}`)}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className={cn("font-semibold", record.amount > 0 ? "text-green-600" : "text-red-600")}>
                            {record.amount > 0 ? "+" : ""}{record.amount}
                          </span>
                          <span className="text-muted-foreground">
                            {record.balanceAfter.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="hidden overflow-hidden rounded-lg border md:block">
                    <Table>
                      <TableHeader className="bg-sidebar-hover/50">
                        <TableRow className="border-border hover:bg-transparent">
                          <TableHead>{tUsage("table.columns.time")}</TableHead>
                          <TableHead>{tUsage("table.columns.type")}</TableHead>
                          <TableHead>{tUsage("table.columns.description")}</TableHead>
                          <TableHead>{tUsage("table.columns.amount")}</TableHead>
                          <TableHead>{tUsage("table.columns.balance")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {records.map((record) => (
                          <TableRow key={record.id} className="border-border hover:bg-sidebar-hover/30">
                            <TableCell className="text-sm text-foreground">
                              {new Date(record.createdAt).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Badge variant={record.type === "consume" ? "error" : "success"}>
                                {tUsage(`table.types.${record.type}`)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {record.note || "-"}
                            </TableCell>
                            <TableCell className="text-sm">
                              <span className={cn("font-semibold", record.amount > 0 ? "text-green-600" : "text-red-600")}>
                                {record.amount > 0 ? "+" : ""}{record.amount}
                              </span>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {record.balanceAfter.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-xs text-muted-foreground">
                      {tUsage("pagination.pageInfo", { current: page, total: totalPages })}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page <= 1}
                      >
                        <ChevronLeft data-icon="inline-start" />
                        <span className="text-xs font-medium">
                          {tUsage("pagination.previous")}
                        </span>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                        disabled={page >= totalPages}
                      >
                        <span className="text-xs font-medium">
                          {tUsage("pagination.next")}
                        </span>
                        <ChevronRight data-icon="inline-end" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
