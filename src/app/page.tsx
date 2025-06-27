'use client';

import * as React from 'react';
import { Loader2, MessageSquare, LineChart, Table } from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { generateSqlQuery } from '@/ai/flows/generate-sql-query';
import type { QueryResult } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { QueryTab } from '@/components/query-tab';
import { ReportTab } from '@/components/report-tab';
import { DashboardTab } from '@/components/dashboard-tab';
import { runQuery } from './actions';

const exampleSchema = `CREATE TABLE sales (
  sale_id INT PRIMARY KEY,
  product_name VARCHAR(100),
  category VARCHAR(50),
  unit_price DECIMAL(10, 2),
  quantity_sold INT,
  sale_date DATE
);

CREATE TABLE products (
  product_id INT PRIMARY KEY,
  product_name VARCHAR(100),
  description TEXT,
  supplier_id INT
);`;

export default function Home() {
  const [schema, setSchema] = React.useState<string>(exampleSchema);
  const [prompt, setPrompt] = React.useState<string>('Show me total sales per category for the last quarter.');
  const [reportQuery, setReportQuery] = React.useState<string>('');
  const [dashboardQuery, setDashboardQuery] = React.useState<string>('');
  const [reportResult, setReportResult] = React.useState<QueryResult | null>(null);
  const [dashboardResult, setDashboardResult] = React.useState<QueryResult | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('query');
  const { toast } = useToast();

  const handleGenerateQuery = async () => {
    if (!prompt.trim() || !schema.trim()) {
      toast({
        variant: 'destructive',
        title: 'Input missing',
        description: 'Please provide both a schema and a natural language prompt.',
      });
      return;
    }

    setIsLoading(true);
    setReportQuery('');
    setDashboardQuery('');
    setReportResult(null);
    setDashboardResult(null);

    try {
      const result = await generateSqlQuery({ schema, prompt });
      const { reportQuery: generatedReportQuery, dashboardQuery: generatedDashboardQuery } = result;
      
      setReportQuery(generatedReportQuery);
      setDashboardQuery(generatedDashboardQuery);

      if (generatedReportQuery && generatedDashboardQuery) {
        const [reportDbResult, dashboardDbResult] = await Promise.all([
          runQuery(generatedReportQuery),
          runQuery(generatedDashboardQuery),
        ]);
        setReportResult(reportDbResult);
        setDashboardResult(dashboardDbResult);
        setActiveTab('report');
      } else {
         toast({
          variant: 'destructive',
          title: 'SQL Generation Failed',
          description: 'The AI could not generate one or both SQL queries from your prompt.',
        });
      }
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred.';
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto p-4 md:p-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary font-headline">Data Insights Hub</h1>
          <p className="text-muted-foreground mt-2">
            Transform your natural language questions into powerful data insights.
          </p>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:w-fit md:mx-auto">
            <TabsTrigger value="query">
              <MessageSquare className="mr-2" />
              Query
            </TabsTrigger>
            <TabsTrigger value="report" disabled={!reportResult}>
              <Table className="mr-2" />
              Report
            </TabsTrigger>
            <TabsTrigger value="dashboard" disabled={!dashboardResult}>
              <LineChart className="mr-2" />
              Dashboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="query" className="mt-6">
            <QueryTab
              schema={schema}
              setSchema={setSchema}
              prompt={prompt}
              setPrompt={setPrompt}
              reportQuery={reportQuery}
              dashboardQuery={dashboardQuery}
              isLoading={isLoading}
              onSubmit={handleGenerateQuery}
            />
          </TabsContent>
          <TabsContent value="report" className="mt-6">
            <ReportTab queryResult={reportResult} isLoading={isLoading} />
          </TabsContent>
          <TabsContent value="dashboard" className="mt-6">
            <DashboardTab queryResult={dashboardResult} isLoading={isLoading} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
