import api from './api';
import { Student, StudentCreate, StudentWithSubjects } from '../types';

export const studentService = {
  async createStudent(studentData: StudentCreate): Promise<Student> {
    const response = await api.post<Student>('/students', studentData);
    return response.data;
  },

  async getStudents(): Promise<StudentWithSubjects[]> {
    const response = await api.get<StudentWithSubjects[]>('/students');
    return response.data;
  },

  async removeStudent(studentId: number): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/students/${studentId}`);
    return response.data;
  }
};