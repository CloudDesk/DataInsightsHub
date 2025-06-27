'use client';

import * as React from 'react';
import { Loader2, MessageSquare, LineChart, Table } from 'lucide-react';
import * as XLSX from 'xlsx';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { generateSqlQuery } from '@/ai/flows/generate-sql-query';
import { verifySqlQuery, type VerifySqlQueryOutput } from '@/ai/flows/verify-sql-query';
import type { QueryResult } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { QueryTab } from '@/components/query-tab';
import { ReportTab } from '@/components/report-tab';
import { DashboardTab } from '@/components/dashboard-tab';
import { runQuery } from './actions';

export type SavedQuery = {
  id: string;
  name: string;
  query: string;
};

export default function Home() {
  const [schema, setSchema] = React.useState<string>('');
  const [uploadedFileName, setUploadedFileName] = React.useState<string | null>(null);
  const [prompt, setPrompt] = React.useState<string>('Show me total sales per category for the last quarter.');
  const [reportQuery, setReportQuery] = React.useState<string>('');
  const [dashboardQuery, setDashboardQuery] = React.useState<string>('');
  const [reportResult, setReportResult] = React.useState<QueryResult | null>(null);
  const [dashboardResult, setDashboardResult] = React.useState<QueryResult | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('query');
  const [savedQueries, setSavedQueries] = React.useState<SavedQuery[]>([]);
  const [verificationResult, setVerificationResult] = React.useState<Record<string, VerifySqlQueryOutput | null>>({});
  const [verifyingQueryId, setVerifyingQueryId] = React.useState<string | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    try {
      const item = window.localStorage.getItem('savedQueries');
      if (item) {
        const queries = JSON.parse(item);
        if (Array.isArray(queries)) {
            setSavedQueries(queries);
        }
      }
    } catch (error) {
      console.error("Failed to load queries from localStorage", error);
      setSavedQueries([]);
    }
  }, []);

  React.useEffect(() => {
    try {
      window.localStorage.setItem('savedQueries', JSON.stringify(savedQueries));
    } catch (error) {
      console.error("Failed to save queries to localStorage", error);
    }
  }, [savedQueries]);

  const handleAddSavedQuery = (name: string, query: string) => {
    if (!name.trim() || !query.trim()) {
      toast({
        variant: 'destructive',
        title: 'Input Missing',
        description: 'Both a name and a query are required to save.',
      });
      return;
    }
    const newQuery: SavedQuery = { id: Date.now().toString(), name, query };
    setSavedQueries(prev => [...prev, newQuery]);
    toast({
      title: 'Success',
      description: 'Query saved successfully.'
    });
  };

  const handleDeleteSavedQuery = (id: string) => {
    setSavedQueries(prev => prev.filter(q => q.id !== id));
    setVerificationResult(prev => {
      const newResults = { ...prev };
      delete newResults[id];
      return newResults;
    });
    toast({
        title: 'Query Deleted',
        description: 'The saved query has been removed.',
    });
  };

  const handleRunRawQuery = async (query: string) => {
    if (!query.trim()) {
      toast({
        variant: 'destructive',
        title: 'Empty Query',
        description: 'Cannot run an empty query.',
      });
      return;
    }
    setIsLoading(true);
    setReportResult(null);
    setDashboardResult(null);
    setReportQuery(query);
    setDashboardQuery('');

    try {
      const result = await runQuery(query);
      setReportResult(result);
      setActiveTab('report');
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred.';
      toast({
        variant: 'destructive',
        title: 'Error Running Query',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleVerifyQuery = async (queryId: string, query: string) => {
    setVerifyingQueryId(queryId);
    setVerificationResult(prev => ({ ...prev, [queryId]: null }));
    try {
      const result = await verifySqlQuery({
        sqlQuery: query,
        databaseSchemaDescription: schema,
      });
      setVerificationResult(prev => ({ ...prev, [queryId]: result }));
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred.';
      toast({
        variant: 'destructive',
        title: 'Error Verifying Query',
        description: errorMessage,
      });
      setVerificationResult(prev => ({ ...prev, [queryId]: { isValid: false, explanation: `Error: ${errorMessage}` }}));
    } finally {
      setVerifyingQueryId(null);
    }
  };


  const handleFileUpload = (file: File) => {
    setIsLoading(true);
    setUploadedFileName(file.name);
    setSchema('');
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          throw new Error('Failed to read file data.');
        }
        const workbook = XLSX.read(data, { type: 'binary' });
        let schemaDescription = '';

        workbook.SheetNames.forEach(sheetName => {
          const cleanSheetName = sheetName.trim();
          if (cleanSheetName) {
            schemaDescription += `Table: ${cleanSheetName}\n`;
            const worksheet = workbook.Sheets[sheetName];
            const json: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

            if (json.length > 0) {
              const columns = json
                .map(row => {
                  const fieldName = row['Field Name'] || row['fieldName'] || row['field_name'];
                  const description = row['Description'] || row['description'];
                  if (fieldName && typeof fieldName === 'string' && fieldName.trim()) {
                    return `- ${fieldName.trim()}: ${String(description || 'No description').trim()}`;
                  }
                  return null;
                })
                .filter(Boolean);
              
              if (columns.length > 0) {
                schemaDescription += 'Columns:\n' + columns.join('\n') + '\n';
              }
            }
            schemaDescription += '\n';
          }
        });
        
        const finalSchema = schemaDescription.trim();
        if (!finalSchema) {
           throw new Error('No valid schema data found in the Excel file. Please check sheet names and column headers (e.g., "Field Name", "Description").');
        }
        setSchema(finalSchema);
        toast({
          title: 'Success',
          description: 'Schema parsed successfully from the Excel file.'
        })
      } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
          console.error("Error parsing Excel file:", error);
          toast({
              variant: 'destructive',
              title: 'File Parse Error',
              description: errorMessage,
          });
          setUploadedFileName(null);
          setSchema('');
      } finally {
          setIsLoading(false);
      }
    };

    reader.onerror = () => {
        toast({
              variant: 'destructive',
              title: 'File Read Error',
              description: 'There was an error reading the file.',
        });
        setUploadedFileName(null);
        setSchema('');
        setIsLoading(false);
    }

    reader.readAsBinaryString(file);
  };

  const handleGenerateQuery = async () => {
    if (!prompt.trim() || !schema.trim()) {
      toast({
        variant: 'destructive',
        title: 'Input missing',
        description: 'Please upload a schema file and provide a natural language prompt.',
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
              onFileUpload={handleFileUpload}
              uploadedFileName={uploadedFileName}
              prompt={prompt}
              setPrompt={setPrompt}
              reportQuery={reportQuery}
              dashboardQuery={dashboardQuery}
              isLoading={isLoading}
              onSubmit={handleGenerateQuery}
              savedQueries={savedQueries}
              onAddQuery={handleAddSavedQuery}
              onDeleteQuery={handleDeleteSavedQuery}
              onRunRawQuery={handleRunRawQuery}
              onVerifyQuery={handleVerifyQuery}
              verificationResult={verificationResult}
              verifyingQueryId={verifyingQueryId}
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
