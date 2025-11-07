import api from './api';
import { JournalEntry, JournalEntryCreate, Subject, SubjectCreate } from '../types';

export const journalService = {
  // Предметы
  async createSubject(subjectData: SubjectCreate): Promise<Subject> {
    const response = await api.post<Subject>('/subjects', subjectData);
    return response.data;
  },

  async getSubjects(): Promise<Subject[]> {
    try {
      const response = await api.get<Subject[]>('/subjects');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404 || error.response?.status === 405) {
        // Если endpoint не существует, возвращаем пустой массив
        console.warn('Subjects endpoint not available, using empty array');
        return [];
      }
      throw error;
    }
  },

  async deleteSubject(subjectId: number): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/subjects/${subjectId}`);
    return response.data;
  },

async createEntry(entryData: JournalEntryCreate): Promise<JournalEntry> {
  console.log('Sending entry data to server:', entryData);
  try {
    const response = await api.post<JournalEntry>('/entries', entryData);
    console.log('Server response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating entry:', error);
    console.error('Error response:', error.response);
    throw error;
  }
},

  async getEntries(): Promise<JournalEntry[]> {
    const response = await api.get<JournalEntry[]>('/entries');
    return response.data;
  },

  async getEntry(entryId: number): Promise<JournalEntry> {
    const response = await api.get<JournalEntry>(`/entries/${entryId}`);
    return response.data;
  },

  async updateEntry(entryId: number, entryData: JournalEntryCreate): Promise<JournalEntry> {
    const response = await api.put<JournalEntry>(`/entries/${entryId}`, entryData);
    return response.data;
  },

  async deleteEntry(entryId: number): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/entries/${entryId}`);
    return response.data;
  }
};