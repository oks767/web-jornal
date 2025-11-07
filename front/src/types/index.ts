export interface User {
  id: number;
  username: string;
  email: string;
}

export interface UserCreate {
  username: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface Subject {
  id: number;
  name: string;
  teacher_id: number;
}

export interface SubjectCreate {
  name: string;
}

export interface JournalEntry {
  id: number;
  subject_id: number;
  date: string;
  topic: string;
  attendance: string;
  homework: string;
  subject_name?: string; // Добавим для отображения названия предмета
}

export interface JournalEntryCreate {
  subject_id: number;
  date: string;
  topic: string;
  attendance: string;
  homework: string;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: UserCreate) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  loading: boolean;
}

export interface Student {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

export interface StudentCreate {
  first_name: string;
  last_name: string;
  email: string;
}

export interface StudentWithSubjects extends Student {
  subjects: string[];
}