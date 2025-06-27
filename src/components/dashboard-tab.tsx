import * as React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import type { QueryResult } from '@/lib/types';
import { Skeleton } from './ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DashboardTabProps {
  queryResult: QueryResult | null;
  isLoading: boolean;
}

type ChartType = 'bar' | 'pie' | 'stack';

export function DashboardTab({ queryResult, isLoading }: DashboardTabProps) {
  const [chartType, setChartType] = React.useState<ChartType>('bar');

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
    [categoryKey]: String(row[categoryKey]),
    [valueKey]: Number(row[valueKey]),
  }));

  const chartConfig: ChartConfig = {
    [valueKey]: {
      label: valueKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      color: 'hsl(var(--chart-1))',
    },
    ...Object.fromEntries(
      chartData.map((entry, index) => [
        entry[categoryKey],
        {
          label: entry[categoryKey],
          color: `hsl(var(--chart-${index + 1}))`,
        },
      ])
    ),
  };

  const COLORS = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
  ];

  const renderChart = () => {
    switch (chartType) {
      case 'pie':
        return (
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel nameKey={categoryKey} />}
            />
            <Pie
              data={chartData}
              dataKey={valueKey}
              nameKey={categoryKey}
              cx="50%"
              cy="50%"
              outerRadius={120}
              labelLine={false}
              label={({ percent, x, y }) => {
                 if (percent === 0) return null;
                 const label = `${(percent * 100).toFixed(0)}%`;
                 return (
                    <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fill="hsl(var(--primary-foreground))" className="text-sm font-medium">
                      {label}
                    </text>
                 );
              }}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        );
      case 'stack':
         return (
            <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid horizontal={false} />
              <YAxis
                dataKey={categoryKey}
                type="category"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                width={80}
                stroke="hsl(var(--muted-foreground))"
              />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Bar dataKey={valueKey} fill="var(--color-value)" radius={4} />
            </BarChart>
         );
      case 'bar':
      default:
        return (
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
        );
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Query Visualization</CardTitle>
          <CardDescription>A visual representation of your query results.</CardDescription>
        </div>
        <div className="w-[180px]">
          <Select value={chartType} onValueChange={(value) => setChartType(value as ChartType)}>
            <SelectTrigger>
              <SelectValue placeholder="Select chart type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bar">Bar Chart</SelectItem>
              <SelectItem value="pie">Pie Chart</SelectItem>
              <SelectItem value="stack">Horizontal Bar Chart</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <ResponsiveContainer width="100%" height={350}>
            {renderChart()}
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
