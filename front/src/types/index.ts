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
  class_id: number;  // Добавьте это свойство
  date: string;
  topic: string;
  attendance: { [studentId: number]: string };
  homework: string;
  grades: { [studentId: number]: GradeInfo };  // Добавьте это свойство
  subject_name?: string;
  class_name?: string;
}

export interface JournalEntryCreate {
  subject_id: number;
  class_id: number;  // Добавьте это свойство
  date: string;
  topic: string;
  attendance: { [studentId: number]: string };
  homework: string;
  grades: { [studentId: number]: GradeInfo };  // Добавьте это свойство
}

export interface GradeInfo {
  grade?: string;
  comment?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: UserCreate) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  loading: boolean;
}


export interface Class {
  id: number;
  name: string;
}

export interface ClassCreate {
  name: string;
}

export interface Student {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  class_id: number;
  class_name?: string;
}

export interface StudentCreate {
  first_name: string;
  last_name: string;
  email: string;
  class_id: number;
}

export interface ClassWithStudents extends Class {
  students: Student[];
}

export interface StudentWithSubjects extends Student {
  subjects: string[];
}