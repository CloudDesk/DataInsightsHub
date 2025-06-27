import { Loader2, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface QueryTabProps {
  schema: string;
  setSchema: (schema: string) => void;
  prompt: string;
  setPrompt: (prompt: string) => void;
  reportQuery: string;
  dashboardQuery: string;
  isLoading: boolean;
  onSubmit: () => void;
}

export function QueryTab({
  schema,
  setSchema,
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
          <CardTitle>1. Provide Schema</CardTitle>
          <CardDescription>
            Provide your database schema description below. The more detailed the schema, the more accurate the generated query will be.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="schema-input">Database Schema (DDL)</Label>
            <Textarea
              id="schema-input"
              placeholder="e.g., CREATE TABLE users (id INT, name VARCHAR(255), ...);"
              className="min-h-[150px] font-mono text-sm"
              value={schema}
              onChange={(e) => setSchema(e.target.value)}
              disabled={isLoading}
            />
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
        <Button onClick={onSubmit} disabled={isLoading} size="lg">
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
