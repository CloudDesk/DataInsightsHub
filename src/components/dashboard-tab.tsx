import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import type { QueryResult } from '@/lib/types';
import { Skeleton } from './ui/skeleton';

interface DashboardTabProps {
  queryResult: QueryResult | null;
  isLoading: boolean;
}

export function DashboardTab({ queryResult, isLoading }: DashboardTabProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-72 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!queryResult || queryResult.length === 0) {
    return (
      <Card className="flex items-center justify-center h-96">
        <CardContent className="text-center">
          <p className="text-muted-foreground">No data to visualize. Please run a query first.</p>
        </CardContent>
      </Card>
    );
  }

  // Dynamically determine keys for the chart
  const keys = Object.keys(queryResult[0] || {});
  const categoryKey = keys.find(key => typeof queryResult[0][key] === 'string') || keys[0];
  const valueKey = keys.find(key => typeof queryResult[0][key] === 'number') || keys[1];

  if (!categoryKey || !valueKey) {
     return (
      <Card className="flex items-center justify-center h-96">
        <CardContent className="text-center">
          <p className="text-muted-foreground">Could not determine appropriate data for visualization.</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = queryResult.map(row => ({
    [categoryKey]: row[categoryKey],
    [valueKey]: row[valueKey],
  }));

  const chartConfig: ChartConfig = {
    [valueKey]: {
      label: valueKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      color: 'hsl(var(--primary))',
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Query Visualization</CardTitle>
        <CardDescription>A visual representation of your query results.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey={categoryKey}
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Bar dataKey={valueKey} fill="var(--color-value)" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
