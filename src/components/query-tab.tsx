import { Loader2, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

interface QueryTabProps {
  onFileUpload: (file: File) => void;
  uploadedFileName: string | null;
  prompt: string;
  setPrompt: (prompt: string) => void;
  reportQuery: string;
  dashboardQuery: string;
  isLoading: boolean;
  onSubmit: () => void;
}

export function QueryTab({
  onFileUpload,
  uploadedFileName,
  prompt,
  setPrompt,
  reportQuery,
  dashboardQuery,
  isLoading,
  onSubmit,
}: QueryTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>1. Upload Schema</CardTitle>
          <CardDescription>
            Upload an Excel file with your database schema. Each sheet should represent a table, with 'Field Name' and 'Description' columns.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="schema-upload">Schema File (.xlsx, .xls)</Label>
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
              className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            />
            {uploadedFileName && (
              <p className="text-sm text-muted-foreground mt-2">
                Uploaded: <span className="font-medium">{uploadedFileName}</span>
              </p>
            )}
          </div>
        </CardContent>
      </Card>

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
