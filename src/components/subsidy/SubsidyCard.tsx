"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Subsidy } from "@/types";

interface SubsidyCardProps {
  subsidy: Subsidy;
  onFavorite?: (subsidy: Subsidy) => void;
  isFavorited?: boolean;
}

function getStatusBadgeColor(status: Subsidy["status"]) {
  switch (status) {
    case "recruiting_1st":
    case "recruiting_2nd":
      return "bg-green-100 text-green-800 border-green-200";
    case "year_round":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "not_recruiting":
      return "bg-gray-100 text-gray-600 border-gray-200";
    default:
      return "bg-gray-100 text-gray-600 border-gray-200";
  }
}

function getMatchScoreColor(score: number) {
  if (score >= 4) return "text-green-600";
  if (score >= 3) return "text-yellow-600";
  return "text-gray-500";
}

export function SubsidyCard({
  subsidy,
  onFavorite,
  isFavorited,
}: SubsidyCardProps) {
  const subsidyId = encodeURIComponent(subsidy.name);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base font-semibold leading-tight">
            {subsidy.name}
          </CardTitle>
          {subsidy.match_score !== undefined && (
            <span
              className={`text-sm font-bold whitespace-nowrap ${getMatchScoreColor(subsidy.match_score)}`}
            >
              ★ {subsidy.match_score}/5
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{subsidy.authority}</p>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Status Badge */}
        {subsidy.status_label && (
          <Badge
            variant="outline"
            className={`text-xs ${getStatusBadgeColor(subsidy.status)}`}
          >
            {subsidy.status_label}
          </Badge>
        )}

        {/* Amount and Rate */}
        <div className="flex flex-wrap gap-4 text-sm">
          {subsidy.max_amount !== null && subsidy.max_amount !== undefined && (
            <div>
              <span className="text-muted-foreground">上限額: </span>
              <span className="font-medium text-blue-700">
                {subsidy.max_amount >= 100000000
                  ? `${(subsidy.max_amount / 100000000).toFixed(0)}億円`
                  : subsidy.max_amount >= 10000
                    ? `${(subsidy.max_amount / 10000).toFixed(0)}万円`
                    : `${subsidy.max_amount.toLocaleString()}円`}
              </span>
            </div>
          )}
          {subsidy.subsidy_rate && (
            <div>
              <span className="text-muted-foreground">助成率: </span>
              <span className="font-medium">{subsidy.subsidy_rate}</span>
            </div>
          )}
        </div>

        {/* Recommended expenses */}
        {subsidy.recommended_expenses &&
          subsidy.recommended_expenses.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {subsidy.recommended_expenses.map((expense) => (
                <Badge
                  key={expense}
                  variant="secondary"
                  className="text-xs"
                >
                  {expense}
                </Badge>
              ))}
            </div>
          )}

        {/* Match reason */}
        {subsidy.match_reason && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {subsidy.match_reason}
          </p>
        )}
      </CardContent>

      <CardFooter className="flex gap-2 pt-3">
        <Link href={`/apply/${subsidyId}`} className="flex-1">
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            size="sm"
          >
            申請書類を作成
          </Button>
        </Link>
        {onFavorite && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onFavorite(subsidy)}
            className={isFavorited ? "text-yellow-500 border-yellow-300" : ""}
          >
            {isFavorited ? "★" : "☆"}
          </Button>
        )}
        {subsidy.official_url && (
          <a
            href={subsidy.official_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm">
              公式
            </Button>
          </a>
        )}
      </CardFooter>
    </Card>
  );
}
