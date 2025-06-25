"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, Languages, RefreshCw, Save, Server, TrendingUp } from "lucide-react";
import { getBtcRate, getSavedRate, saveRate, getBackendIp } from "../actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { enUS, faIR } from 'date-fns/locale';
import { Separator } from "@/components/ui/separator";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

interface RateData {
  rate: number;
  timestamp: number;
}

function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();

  const handleLocaleChange = (newLocale: string) => {
    router.replace(`/${newLocale}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Languages className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleLocaleChange('en')} disabled={locale === 'en'}>
          English
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleLocaleChange('fa')} disabled={locale === 'fa'}>
          فارسی
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


export default function Home() {
  const t = useTranslations("HomePage");
  const locale = useLocale();
  
  const [data, setData] = React.useState<RateData | null>(null);
  const [savedRate, setSavedRate] = React.useState<RateData | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [hasAttemptedFetch, setHasAttemptedFetch] = React.useState(false);
  const [backendIp, setBackendIp] = React.useState<string | null>(null);
  const [isFetchingIp, setIsFetchingIp] = React.useState(false);
  const { toast } = useToast();

  const dateLocale = React.useMemo(() => (locale === 'fa' ? faIR : enUS), [locale]);
  const numberLocale = React.useMemo(() => (locale === 'fa' ? 'fa-IR' : 'en-US'), [locale]);

  React.useEffect(() => {
    const fetchSavedRate = async () => {
      const { data, error } = await getSavedRate();
      if (error) {
        toast({
          variant: "destructive",
          title: t("loadingSavedRateError"),
          description: error,
        });
      } else if (data) {
        setSavedRate(data);
      }
    };
    fetchSavedRate();
  }, [toast, t]);

  const fetchRate = React.useCallback(async () => {
    setIsLoading(true);
    if (!hasAttemptedFetch) {
      setHasAttemptedFetch(true);
    }
    
    const result = await getBtcRate();
    if (result.error || !result.data) {
      toast({
        variant: "destructive",
        title: t("fetchingRateError"),
        description: result.error || t("unknownError"),
      });
      setData(null);
    } else {
      setData(result.data);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 700);
    }
    setIsLoading(false);
  }, [toast, t, hasAttemptedFetch]);

  const handleSaveRate = async () => {
    if (data) {
      setIsSaving(true);
      const result = await saveRate(data);

      if (result.error) {
        toast({
          variant: "destructive",
          title: t("savingRateError"),
          description: result.error,
        });
      } else {
        setSavedRate(data);
        toast({
          title: t("rateSavedSuccess"),
          description: t("rateSavedDescription", {
            rate: data.rate.toLocaleString(numberLocale, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          })
        });
      }
      setIsSaving(false);
    }
  };

  const handleFetchIp = async () => {
    setIsFetchingIp(true);
    const result = await getBackendIp();
    if (result.error) {
      toast({
        variant: "destructive",
        title: t("fetchingIpError"),
        description: result.error,
      });
      setBackendIp(null);
    } else {
      setBackendIp(result.ip);
    }
    setIsFetchingIp(false);
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
        <CardHeader className="relative">
            <div className={cn("absolute top-4", locale === 'fa' ? 'left-4' : 'right-4')}>
               <LanguageSwitcher />
            </div>
            <div className="text-center">
                <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit mb-2">
                    <TrendingUp className="h-6 w-6" />
                </div>
                <CardTitle className="font-headline text-2xl">{t('title')}</CardTitle>
                <CardDescription>
                    {t('description')}
                </CardDescription>
            </div>
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
                <p className="text-sm text-muted-foreground">{t('btcEquals')}</p>
                <p className="text-5xl font-bold tracking-tight text-primary">
                  {data.rate.toLocaleString(numberLocale, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                  <span className="mx-2 text-3xl font-medium text-muted-foreground">
                    {t('usdt')}
                  </span>
                </p>
              </div>
            ) : hasAttemptedFetch ? (
               <div className="text-destructive text-center">
                <p>{t('fetchError')}</p>
              </div>
            ) : (
              <div className="text-muted-foreground text-center">
                <p>{t('clickToRefresh')}</p>
              </div>
            )
            }
          </div>

          {changeInfo && savedRate && (
            <div className="text-center text-sm -mt-4 mb-6 px-6">
                <p className="text-muted-foreground">
                    {t('changeSinceSaved')}
                </p>
                <div
                className={cn(
                    "mt-1 flex items-center justify-center gap-1 text-lg font-bold",
                    changeInfo.isPositive ? "text-chart-2" : "text-destructive"
                )}
                >
                {changeInfo.isPositive ? <ArrowUp className="h-5 w-5" /> : <ArrowDown className="h-5 w-5" />}
                <span>
                    {Math.abs(changeInfo.change).toLocaleString(numberLocale, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })}
                </span>
                <span className="text-base font-medium">
                    ({changeInfo.isPositive ? '+' : ''}{changeInfo.percentageChange.toLocaleString(numberLocale, {maximumFractionDigits: 2})}%)
                </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                    {t('savedRate', {
                        rate: savedRate.rate.toLocaleString(numberLocale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                        timeAgo: formatDistanceToNow(new Date(savedRate.timestamp), { addSuffix: true, locale: dateLocale })
                    })}
                </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex-col items-stretch gap-4 px-6 pb-6">
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>
              {data ? t('lastUpdated', { time: new Date(data.timestamp).toLocaleTimeString(numberLocale)}) : t('notUpdated')}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveRate}
                disabled={!data || isLoading || isSaving}
                aria-label={t('saveButton')}
              >
                <Save className={cn("h-4 w-4", isSaving && "animate-spin")} />
                <span className="hidden sm:inline">{t('saveButton')}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchRate}
                disabled={isLoading}
                aria-label={t('refreshButton')}
              >
                <RefreshCw
                  className={cn("h-4 w-4", isLoading && "animate-spin")}
                />
                <span className="hidden sm:inline">{t('refreshButton')}</span>
              </Button>
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div>
              {isFetchingIp ? (
                <Skeleton className="h-5 w-48" />
              ) : backendIp ? (
                <span>{t('backendIp')} <code className="font-mono bg-muted px-1 py-0.5 rounded">{backendIp}</code></span>
              ) : (
                <span>{t('showIpPrompt')}</span>
              )}
            </div>
            <Button
                variant="outline"
                size="sm"
                onClick={handleFetchIp}
                disabled={isFetchingIp}
                aria-label={t('showIpButton')}
              >
                <Server className="h-4 w-4" />
                <span className="hidden sm:inline">{t('showIpButton')}</span>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </main>
  );
}
