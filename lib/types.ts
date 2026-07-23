export type Category =
  | "Food"
  | "Transportation"
  | "Entertainment"
  | "Shopping"
  | "Bills"
  | "Other";

export interface Expense {
  id: string;
  /** ISO date string: YYYY-MM-DD */
  date: string;
  /** Amount in the major currency unit (e.g. dollars), always > 0 */
  amount: number;
  category: Category;
  description: string;
  /** ISO timestamp of when the record was created */
  createdAt: string;
}

/** Shape of the expense form before it is validated / persisted. */
export interface ExpenseInput {
  date: string;
  amount: string;
  category: Category;
  description: string;
}

export interface ExpenseFilters {
  search: string;
  category: Category | "All";
  startDate: string;
  endDate: string;
}
