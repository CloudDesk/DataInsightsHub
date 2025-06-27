'use client';

import * as React from 'react';
import { Loader2, Database, MessageSquare, LineChart, Table } from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { generateSqlQuery } from '@/ai/flows/generate-sql-query';
import type { QueryResult } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { QueryTab } from '@/components/query-tab';
import { ReportTab } from '@/components/report-tab';
import { DashboardTab } from '@/components/dashboard-tab';

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
  const [sqlQuery, setSqlQuery] = React.useState<string>('');
  const [queryResult, setQueryResult] = React.useState<QueryResult | null>(null);
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
    setSqlQuery('');
    setQueryResult(null);

    try {
      const result = await generateSqlQuery({ schema, prompt });
      setSqlQuery(result.sqlQuery);

      // This is mock data for demonstration purposes.
      // In a real application, you would execute the generated SQL against your database.
      const mockData: QueryResult = [
        { category: 'Electronics', total_sales: 125500.75 },
        { category: 'Clothing', total_sales: 78200.50 },
        { category: 'Home Goods', total_sales: 93400.20 },
        { category: 'Books', total_sales: 32100.00 },
      ];
      setQueryResult(mockData);
      setActiveTab('report');
    } catch (e) {
      console.error(e);
      toast({
        variant: 'destructive',
        title: 'Error generating SQL',
        description: 'An unexpected error occurred. Please check the console for details.',
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
            <TabsTrigger value="report" disabled={!queryResult}>
              <Table className="mr-2" />
              Report
            </TabsTrigger>
            <TabsTrigger value="dashboard" disabled={!queryResult}>
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
              sqlQuery={sqlQuery}
              isLoading={isLoading}
              onSubmit={handleGenerateQuery}
            />
          </TabsContent>
          <TabsContent value="report" className="mt-6">
            <ReportTab queryResult={queryResult} isLoading={isLoading} />
          </TabsContent>
          <TabsContent value="dashboard" className="mt-6">
            <DashboardTab queryResult={queryResult} isLoading={isLoading} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
