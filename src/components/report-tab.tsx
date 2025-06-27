import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { QueryResult } from '@/lib/types';
import { Skeleton } from './ui/skeleton';

interface ReportTabProps {
  queryResult: QueryResult | null;
  isLoading: boolean;
}

export function ReportTab({ queryResult, isLoading }: ReportTabProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/2" />
           <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!queryResult || queryResult.length === 0) {
    return (
      <Card className="flex items-center justify-center h-96">
        <CardContent className="text-center">
          <p className="text-muted-foreground">No data to display. Please run a query first.</p>
        </CardContent>
      </Card>
    );
  }

  const headers = Object.keys(queryResult[0]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Query Results</CardTitle>
        <CardDescription>
          Here is the raw data returned from your query.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                {headers.map((header) => (
                  <TableHead key={header} className="font-bold">{header.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {queryResult.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {headers.map((header) => (
                    <TableCell key={header}>{String(row[header])}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
