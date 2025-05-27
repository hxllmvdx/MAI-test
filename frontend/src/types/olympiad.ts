export interface Olympiad {
  id: number;
  title: string;
  start_date: string;
  end_date: string;
  duration: string;
  level: string;
  subjects: string[];
  university: string;
  registration_link: string;
  status: string;
}

export interface NotificationFilters {
  olympiads: string[];
  subjects: string[];
  levels: string[];
}

export interface ParticipationHistory {
  id: string;
  olympiadId: string;
  name: string;
  date: string;
  participationDate: string;
  result?: string;
}

export interface FilterSettings {
  levels?: string[];
  subjects?: string[];
  universities?: string[];
}