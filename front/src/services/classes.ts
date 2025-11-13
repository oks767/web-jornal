import api from './api';
import { Class, ClassCreate, ClassWithStudents, Student, StudentCreate } from '../types';

export const classService = {
  async createClass(classData: ClassCreate): Promise<Class> {
    try {
      const response = await api.post<Class>('/classes', classData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating class:', error);
      throw error;
    }
  },

  async getClasses(): Promise<ClassWithStudents[]> {
    try {
      const response = await api.get<ClassWithStudents[]>('/classes-with-students');
      return response.data || [];
    } catch (error: any) {
      console.error('Error loading classes:', error);
      // Если endpoint не существует, возвращаем пустой массив
      if (error.response?.status === 404 || error.response?.status === 405) {
        return [];
      }
      throw error;
    }
  },

  async createStudent(studentData: StudentCreate): Promise<Student> {
    try {
      const response = await api.post<Student>('/students', studentData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating student:', error);
      throw error;
    }
  }
};