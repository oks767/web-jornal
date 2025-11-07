import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import { JournalEntry, JournalEntryCreate, Subject } from '../types';

interface EntryFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: JournalEntryCreate) => void;
  initialData?: Partial<JournalEntry>;
  subjects: Subject[]; // Добавляем пропс для предметов
}

const EntryForm: React.FC<EntryFormProps> = ({ 
  open, 
  onClose, 
  onSubmit, 
  initialData = {},
  subjects = []
}) => {
  const [formData, setFormData] = useState<JournalEntryCreate>({
    subject_id: initialData.subject_id || (subjects.length > 0 ? subjects[0].id : 0),
    date: initialData.date || '',
    topic: initialData.topic || '',
    attendance: initialData.attendance || '',
    homework: initialData.homework || ''
  });
  const [error, setError] = useState<string>('');

  // Обновляем formData когда меняются subjects или initialData
  useEffect(() => {
    if (open) {
      const currentSubjectId = initialData.subject_id || (subjects.length > 0 ? subjects[0].id : 0);
      const now = new Date();
      const localDateTime = initialData.date || new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      
      setFormData({
        subject_id: currentSubjectId,
        date: localDateTime,
        topic: initialData.topic || '',
        attendance: initialData.attendance || '',
        homework: initialData.homework || ''
      });
    }
  }, [open, initialData, subjects]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: any): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseInt(value) || 0
    }));
  };

  const handleSubmit = (e: React.FormEvent): void => {
  e.preventDefault();
  
  if (formData.subject_id === 0) {
    setError('Пожалуйста, выберите предмет');
    return;
  }
  
  if (!formData.topic.trim()) {
    setError('Пожалуйста, введите тему урока');
    return;
  }

  // Детальный лог данных
  console.log('Form data before submission:', JSON.stringify(formData, null, 2));
  console.log('Data types:', {
    subject_id: { value: formData.subject_id, type: typeof formData.subject_id },
    date: { value: formData.date, type: typeof formData.date },
    topic: { value: formData.topic, type: typeof formData.topic },
    attendance: { value: formData.attendance, type: typeof formData.attendance },
    homework: { value: formData.homework, type: typeof formData.homework }
  });

  setError('');
  onSubmit(formData);
};

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {initialData.id ? 'Редактировать запись в журнале' : 'Добавить запись в журнал'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth required>
              <InputLabel id="subject-select-label">Предмет</InputLabel>
              <Select
                labelId="subject-select-label"
                name="subject_id"
                value={formData.subject_id}
                label="Предмет"
                onChange={handleSelectChange}
              >
                {subjects.map((subject) => (
                  <MenuItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Дата и время занятия"
              name="date"
              type="datetime-local"
              value={formData.date}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              required
              helperText="Выберите дату и время проведения занятия"
            />

            <TextField
              label="Тема урока"
              name="topic"
              value={formData.topic}
              onChange={handleChange}
              required
              multiline
              rows={2}
              helperText="Введите тему проведенного урока"
            />

            <TextField
              label="Посещаемость"
              name="attendance"
              value={formData.attendance}
              onChange={handleChange}
              required
              multiline
              rows={3}
              helperText="Отметьте присутствующих студентов (например: Иванов - присутствовал, Петров - отсутствовал)"
              placeholder="Иванов - присутствовал&#10;Петров - отсутствовал&#10;Сидорова - присутствовала"
            />

            <TextField
              label="Домашнее задание"
              name="homework"
              value={formData.homework}
              onChange={handleChange}
              required
              multiline
              rows={3}
              helperText="Задание для самостоятельной работы студентов"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Отмена</Button>
          <Button type="submit" variant="contained" disabled={subjects.length === 0}>
            {initialData.id ? 'Обновить' : 'Создать'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EntryForm;