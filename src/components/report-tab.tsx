import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { QueryResult } from '@/lib/types';
import { Skeleton } from './ui/skeleton';
import { Button } from './ui/button';
import { FileDown } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ReportTabProps {
  queryResult: QueryResult | null;
  isLoading: boolean;
}

export function ReportTab({ queryResult, isLoading }: ReportTabProps) {
  const handleExport = () => {
    if (!queryResult || queryResult.length === 0) return;

    const dataToExport = queryResult.map(row => {
      const newRow: { [key: string]: any } = {};
      for (const key in row) {
        const newKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        newRow[newKey] = row[key];
      }
      return newRow;
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'ReportData');
    XLSX.writeFile(workbook, 'report.xlsx');
  };

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
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Query Results</CardTitle>
          <CardDescription>
            Here is the raw data returned from your query.
          </CardDescription>
        </div>
        <Button onClick={handleExport} variant="outline" size="sm">
          <FileDown className="mr-2" />
          Export to Excel
        </Button>
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
