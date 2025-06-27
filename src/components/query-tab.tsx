import * as React from 'react';
import { Loader2, Wand2, Plus, Trash2, Play, ShieldCheck, DownloadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { SavedQuery } from '@/lib/types';
import type { VerifySqlQueryOutput } from '@/ai/flows/verify-sql-query';
import { cn } from '@/lib/utils';

interface QueryTabProps {
  onFileUpload: (file: File) => void;
  onLoadSchemaFromUrl: () => void;
  uploadedFileName: string | null;
  prompt: string;
  setPrompt: (prompt: string) => void;
  reportQuery: string;
  dashboardQuery: string;
  isLoading: boolean;
  onSubmit: () => void;
  savedQueries: SavedQuery[];
  onAddQuery: (name: string, query: string) => void;
  onDeleteQuery: (id: string) => void;
  onRunRawQuery: (query: string) => void;
  onVerifyQuery: (queryId: string, query: string) => void;
  verificationResult: Record<string, VerifySqlQueryOutput | null>;
  verifyingQueryId: string | null;
}

function AddQueryDialog({ onSave }: { onSave: (name: string, query: string) => void }) {
  const [name, setName] = React.useState('');
  const [query, setQuery] = React.useState('');
  const [open, setOpen] = React.useState(false);

  const handleSaveClick = () => {
    onSave(name, query);
    setName('');
    setQuery('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="mr-2" /> Add Query</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Add New Raw Query</DialogTitle>
          <DialogDescription>
            Save a raw SQL query for later use. This query will not be processed by the AI.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" placeholder="e.g., 'Active Users Last 30 Days'" />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="query" className="text-right pt-2">Query</Label>
            <Textarea id="query" value={query} onChange={(e) => setQuery(e.target.value)} className="col-span-3 min-h-[150px]" placeholder="SELECT * FROM users WHERE..." />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="submit" onClick={handleSaveClick}>Save Query</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface SchemaUploadCardProps {
  onFileUpload: (file: File) => void;
  onLoadSchemaFromUrl: () => void;
  uploadedFileName: string | null;
  isLoading: boolean;
  stepNumber?: number;
  description: string;
}

function SchemaUploadCard({ onFileUpload, onLoadSchemaFromUrl, uploadedFileName, isLoading, stepNumber, description }: SchemaUploadCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{stepNumber ? `${stepNumber}. ` : ''}Provide Schema</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="schema-upload">Upload from computer</Label>
          <Input
            id="schema-upload"
            type="file"
            accept=".xlsx, .xls"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                onFileUpload(e.target.files[0]);
              }
            }}
            disabled={isLoading}
            className="mt-1 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
          />
        </div>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or
            </span>
          </div>
        </div>
        <Button 
          variant="outline" 
          className="w-full"
          onClick={onLoadSchemaFromUrl}
          disabled={isLoading}
        >
          {isLoading ? ( <Loader2 className="mr-2 h-4 w-4 animate-spin" />) : (<DownloadCloud className="mr-2 h-4 w-4" />)}
          Load from URL
        </Button>
        {uploadedFileName && (
          <p className="text-sm text-muted-foreground text-center pt-2">
            Loaded Schema: <span className="font-medium">{uploadedFileName}</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}


function GenerateQueryView({
  onFileUpload,
  onLoadSchemaFromUrl,
  uploadedFileName,
  prompt,
  setPrompt,
  isLoading,
  onSubmit,
  reportQuery,
  dashboardQuery
}: Pick<QueryTabProps, 'onFileUpload' | 'onLoadSchemaFromUrl' | 'uploadedFileName' | 'prompt' | 'setPrompt' | 'isLoading' | 'onSubmit' | 'reportQuery' | 'dashboardQuery'>) {
  return (
    <div className="space-y-6">
      <SchemaUploadCard
        onFileUpload={onFileUpload}
        onLoadSchemaFromUrl={onLoadSchemaFromUrl}
        uploadedFileName={uploadedFileName}
        isLoading={isLoading}
        stepNumber={1}
        description="Provide an Excel file with your database schema by uploading it or loading from a default URL. Each sheet should represent a table, with 'Field Name' and 'Description' columns."
      />

      <Card>
        <CardHeader>
          <CardTitle>2. Write Prompt</CardTitle>
          <CardDescription>
            Describe in plain English what you want to find out from your data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="prompt-input">Natural Language Prompt</Label>
            <Textarea
              id="prompt-input"
              placeholder="e.g., 'Show me all users from California who signed up last month'"
              className="min-h-[100px]"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button onClick={onSubmit} disabled={isLoading || !uploadedFileName} size="lg">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="mr-2 h-4 w-4" />
          )}
          Generate Query
        </Button>
      </div>

      {reportQuery && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Report Query</CardTitle>
            <CardDescription>
              This query is for fetching detailed records for the report table.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md overflow-x-auto">
              <code className="text-sm font-mono text-muted-foreground">{reportQuery}</code>
            </pre>
          </CardContent>
        </Card>
      )}

      {dashboardQuery && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Dashboard Query</CardTitle>
            <CardDescription>
             This query is for fetching aggregated data for the dashboard chart.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md overflow-x-auto">
              <code className="text-sm font-mono text-muted-foreground">{dashboardQuery}</code>
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function RawQueryView({ savedQueries, onAddQuery, onDeleteQuery, onRunRawQuery, onVerifyQuery, verificationResult, verifyingQueryId, isLoading, onFileUpload, onLoadSchemaFromUrl, uploadedFileName }: Pick<QueryTabProps, 'savedQueries' | 'onAddQuery' | 'onDeleteQuery' | 'onRunRawQuery' | 'onVerifyQuery' | 'verificationResult' | 'verifyingQueryId' | 'isLoading' | 'onFileUpload' | 'onLoadSchemaFromUrl' | 'uploadedFileName'>) {
  return (
    <div className="space-y-6">
        <SchemaUploadCard
            onFileUpload={onFileUpload}
            onLoadSchemaFromUrl={onLoadSchemaFromUrl}
            uploadedFileName={uploadedFileName}
            isLoading={isLoading}
            description='Optionally provide a schema by uploading or loading from URL to enable more accurate verification for your raw queries.'
        />
        <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
            <CardTitle>Raw SQL Queries</CardTitle>
            <CardDescription>
                Manage, run, and verify your saved raw SQL queries directly.
            </CardDescription>
            </div>
            <AddQueryDialog onSave={onAddQuery} />
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
            {savedQueries.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                No saved queries yet. Click "Add Query" to create one.
                </p>
            ) : (
                <div className="border rounded-md">
                {savedQueries.map((q, index) => (
                    <div key={q.id} className={`${index < savedQueries.length - 1 ? 'border-b' : ''}`}>
                    <div className="flex items-center justify-between p-4">
                        <div className="flex-1 overflow-hidden">
                        <p className="font-medium">{q.name}</p>
                        <p className="text-sm text-muted-foreground font-mono truncate">{q.query}</p>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                        <Button variant="ghost" size="icon" onClick={() => onVerifyQuery(q.id, q.query)} disabled={isLoading || !!verifyingQueryId} aria-label="Verify Query">
                            {verifyingQueryId === q.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                            <ShieldCheck className="h-4 w-4 text-blue-500" />
                            )}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => onRunRawQuery(q.query)} disabled={isLoading || !!verifyingQueryId} aria-label="Run Query">
                            <Play className="h-4 w-4 text-green-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => onDeleteQuery(q.id)} disabled={isLoading || !!verifyingQueryId} aria-label="Delete Query">
                            <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                        </div>
                    </div>
                    {verificationResult[q.id] && (
                        <div className="px-4 pb-4">
                        <div
                            className={cn(
                            'mt-2 p-3 rounded-md border',
                            verificationResult[q.id]?.isValid
                                ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'
                                : 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
                            )}
                        >
                            <h4
                            className={cn(
                                'font-semibold text-sm mb-2',
                                verificationResult[q.id]?.isValid
                                ? 'text-green-800 dark:text-green-300'
                                : 'text-red-800 dark:text-red-300'
                            )}
                            >
                            Verification Result:
                            </h4>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {verificationResult[q.id]?.explanation}
                            </p>
                        </div>
                        </div>
                    )}
                    </div>
                ))}
                </div>
            )}
            </div>
        </CardContent>
        </Card>
    </div>
  );
}

export function QueryTab(props: QueryTabProps) {
  return (
    <Tabs defaultValue="generate" className="w-full">
      <TabsList className="grid w-full grid-cols-2 md:w-fit md:mx-auto">
        <TabsTrigger value="generate">Generate Query</TabsTrigger>
        <TabsTrigger value="raw">Raw Query</TabsTrigger>
      </TabsList>
      <TabsContent value="generate" className="mt-6">
        <GenerateQueryView {...props} />
      </TabsContent>
      <TabsContent value="raw" className="mt-6">
        <RawQueryView {...props} />
      </TabsContent>
    </Tabs>
  );
}
