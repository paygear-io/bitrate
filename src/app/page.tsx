"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, RefreshCw, Save, TrendingUp } from "lucide-react";
import { getBtcRate } from "./actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface RateData {
  rate: number;
  timestamp: number;
}

export default function Home() {
  const [data, setData] = React.useState<RateData | null>(null);
  const [savedRate, setSavedRate] = React.useState<RateData | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [hasAttemptedFetch, setHasAttemptedFetch] = React.useState(false);
  const { toast } = useToast();

  const fetchRate = React.useCallback(async () => {
    setIsLoading(true);
    if (!hasAttemptedFetch) {
      setHasAttemptedFetch(true);
    }
    
    try {
      const result = await getBtcRate();
      if (result.error || !result.data) {
        toast({
          variant: "destructive",
          title: "Error fetching rate",
          description: result.error || "An unknown error occurred.",
        });
      } else {
        setData(result.data);
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 700);
      }
    } catch (e) {
       toast({
        variant: "destructive",
        title: "Error fetching rate",
        description: "An unexpected error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, hasAttemptedFetch]);

  const handleSaveRate = () => {
    if (data) {
      setSavedRate(data);
      toast({
        title: "Rate Saved",
        description: `BTC/USDT rate of ${data.rate.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2})} saved.`,
      });
    }
  };

  const changeInfo = React.useMemo(() => {
    if (!data || !savedRate) return null;
    
    const change = data.rate - savedRate.rate;
    const percentageChange = (change / savedRate.rate) * 100;
    const isPositive = change >= 0;

    return {
      change,
      percentageChange,
      isPositive,
    };
  }, [data, savedRate]);

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit mb-2">
            <TrendingUp className="h-6 w-6" />
          </div>
          <CardTitle className="font-headline text-2xl">BitRate</CardTitle>
          <CardDescription>
            Live BTC/USDT Exchange Rate from Binance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              "rounded-lg p-6 text-center transition-colors flex items-center justify-center min-h-[124px]",
              isAnimating && "animate-highlight"
            )}
          >
            {isLoading && !data ? (
              <Skeleton className="h-[76px] w-[280px]" />
            ) : data ? (
              <div>
                <p className="text-sm text-muted-foreground">1 BTC equals</p>
                <p className="text-5xl font-bold tracking-tight text-primary">
                  {data.rate.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                  <span className="ml-2 text-3xl font-medium text-muted-foreground">
                    USDT
                  </span>
                </p>
              </div>
            ) : hasAttemptedFetch ? (
               <div className="text-destructive text-center">
                <p>Could not fetch exchange rate.</p>
              </div>
            ) : (
              <div className="text-muted-foreground text-center">
                <p>Click Refresh to get the latest rate.</p>
              </div>
            )
            }
          </div>

          {changeInfo && savedRate && (
            <div className="text-center text-sm -mt-4 mb-6 px-6">
                <p className="text-muted-foreground">
                    Change since saved rate
                </p>
                <div
                className={cn(
                    "mt-1 flex items-center justify-center gap-1 text-lg font-bold",
                    changeInfo.isPositive ? "text-chart-2" : "text-destructive"
                )}
                >
                {changeInfo.isPositive ? <ArrowUp className="h-5 w-5" /> : <ArrowDown className="h-5 w-5" />}
                <span>
                    {Math.abs(changeInfo.change).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })}
                </span>
                <span className="text-base font-medium">
                    ({changeInfo.isPositive ? '+' : ''}{changeInfo.percentageChange.toFixed(2)}%)
                </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                    Saved: {savedRate.rate.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({formatDistanceToNow(new Date(savedRate.timestamp), { addSuffix: true })})
                </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between items-center text-sm text-muted-foreground px-6 pb-6">
          <span>
            {data ? `Last updated: ${new Date(data.timestamp).toLocaleTimeString()}` : "Not updated yet"}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveRate}
              disabled={!data || isLoading}
              aria-label="Save current rate"
            >
              <Save className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">Save</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchRate}
              disabled={isLoading}
              aria-label="Refresh exchange rate"
            >
              <RefreshCw
                className={cn("h-4 w-4", isLoading && "animate-spin")}
              />
              <span className="ml-2 hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </main>
  );
}
