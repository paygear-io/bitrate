"use client";

import * as React from "react";
import { RefreshCw, TrendingUp } from "lucide-react";
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

interface RateData {
  rate: number;
  timestamp: number;
}

export default function Home() {
  const [data, setData] = React.useState<RateData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAnimating, setIsAnimating] = React.useState(false);
  const { toast } = useToast();

  const fetchRate = React.useCallback(async () => {
    setIsLoading(true);
    const result = await getBtcRate();

    if (result.error || !result.data) {
      toast({
        variant: "destructive",
        title: "Error fetching rate",
        description: result.error || "An unknown error occurred.",
      });
      // Keep stale data visible if a refresh fails
      if (!data) {
        setData(null);
      }
    } else {
      setData(result.data);
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 700);
      return () => clearTimeout(timer);
    }
    setIsLoading(false);
  }, [toast, data]);

  React.useEffect(() => {
    fetchRate();
  }, [fetchRate]);

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
              "rounded-lg p-6 text-center transition-colors",
              isAnimating && "animate-highlight"
            )}
          >
            {isLoading && !data ? (
              <Skeleton className="h-[76px] w-full" />
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
            ) : (
               <div className="text-destructive text-center py-8">
                <p>Could not fetch exchange rate.</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center text-sm text-muted-foreground px-6 pb-6">
          <span>
            {data ? `Last updated: ${new Date(data.timestamp).toLocaleTimeString()}` : "Updating..."}
          </span>
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
        </CardFooter>
      </Card>
    </main>
  );
}
