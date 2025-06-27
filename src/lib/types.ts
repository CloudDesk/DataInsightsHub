export type QueryResultData = Record<string, string | number>;
export type QueryResult = QueryResultData[];
export type SavedQuery = {
  id: string;
  name: string;
  query: string;
};
