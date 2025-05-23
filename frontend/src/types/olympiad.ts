// src/types/olympiad.ts
export interface OlympiadResponse {
  id: number;
  title: string;
  description?: string;
  start_date: string;  // Будет приходить как строка ISO format
  end_date: string;
  registration_deadline: string;
  level: string;
  subject: string;
  university: string;
  registration_link: string;
  status: string;
}

export interface FilterSettings {
  levels?: string[];
  subjects?: string[];
  universities?: string[];
}

export interface UserFilters extends FilterSettings {
  selected_olympiads?: number[];
}