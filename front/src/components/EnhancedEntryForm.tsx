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
  Alert,
  Typography,
  Card,
  CardContent,
  ToggleButton,
  ToggleButtonGroup,
  Chip
} from '@mui/material';
import { Check, Close } from '@mui/icons-material';
import { JournalEntry, JournalEntryCreate, Subject, ClassWithStudents, GradeInfo } from '../types';
import { classService } from '../services/classes';

interface EnhancedEntryFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: JournalEntryCreate) => void;
  initialData?: Partial<JournalEntry>;
  subjects: Subject[];
}

const EnhancedEntryForm: React.FC<EnhancedEntryFormProps> = ({ 
  open, 
  onClose, 
  onSubmit, 
  initialData = {},
  subjects = []
}) => {
  // Создаем начальные данные с правильными типами
 const getInitialFormData = (): JournalEntryCreate => {
  return {
    subject_id: initialData.subject_id || (subjects.length > 0 ? subjects[0].id : 0),
    class_id: initialData.class_id || 0,
    date: initialData.date || '',
    topic: initialData.topic || '',
    attendance: initialData.attendance || {},
    homework: initialData.homework || '',
    grades: initialData.grades || {}  
  };
};

  const [formData, setFormData] = useState<JournalEntryCreate>(getInitialFormData());
  const [classes, setClasses] = useState<ClassWithStudents[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassWithStudents | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (open) {
      loadClasses();
      // Сбрасываем форму при открытии
      setFormData(getInitialFormData());
    }
  }, [open, initialData, subjects]);

  useEffect(() => {
    // Когда загрузились классы, выбираем класс из initialData если есть
    if (classes.length > 0 && initialData.class_id) {
      const foundClass = classes.find(c => c.id === initialData.class_id);
      setSelectedClass(foundClass || null);
    }
  }, [classes, initialData.class_id]);

  const loadClasses = async (): Promise<void> => {
    try {
      setLoading(true);
      const data = await classService.getClasses();
      setClasses(data);
    } catch (err) {
      console.error('Error loading classes:', err);
      setError('Не удалось загрузить список классов');
    } finally {
      setLoading(false);
    }
  };

  const handleClassChange = (classId: number): void => {
    const selected = classes.find(c => c.id === classId) || null;
    setSelectedClass(selected);
    setFormData(prev => ({
      ...prev,
      class_id: classId,
      attendance: {}, // Сбрасываем посещаемость при смене класса
      grades: {}      // Сбрасываем оценки
    }));
  };

  const handleAttendanceChange = (studentId: number, status: string): void => {
    setFormData(prev => ({
      ...prev,
      attendance: {
        ...prev.attendance,
        [studentId]: status
      }
    }));
  };

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
      [name]: name === 'subject_id' || name === 'class_id' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    
    if (formData.subject_id === 0) {
      setError('Пожалуйста, выберите предмет');
      return;
    }

    if (formData.class_id === 0) {
      setError('Пожалуйста, выберите класс');
      return;
    }
    
    if (!formData.topic.trim()) {
      setError('Пожалуйста, введите тему урока');
      return;
    }

    // Проверяем, что все ученики отмечены
    if (selectedClass && selectedClass.students && 
        Object.keys(formData.attendance).length !== selectedClass.students.length) {
      setError('Пожалуйста, отметьте посещаемость всех учеников');
      return;
    }
    
    setError('');
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        {initialData.id ? 'Редактировать запись в журнале' : 'Добавить запись в журнал'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            {/* Основные поля */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
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

              <FormControl fullWidth required>
                <InputLabel id="class-select-label">Класс</InputLabel>
                <Select
                  labelId="class-select-label"
                  name="class_id"
                  value={formData.class_id}
                  label="Класс"
                  onChange={(e) => handleClassChange(Number(e.target.value))}
                >
                  <MenuItem value={0}>Выберите класс</MenuItem>
                  {classes.map((classItem) => (
                    <MenuItem key={classItem.id} value={classItem.id}>
                      {classItem.name} ({classItem.students?.length || 0} учеников)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <TextField
              label="Дата и время занятия"
              name="date"
              type="datetime-local"
              value={formData.date}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              required
            />

            <TextField
              label="Тема урока"
              name="topic"
              value={formData.topic}
              onChange={handleChange}
              required
              multiline
              rows={2}
            />

            {/* Посещаемость */}
            {selectedClass && selectedClass.students && selectedClass.students.length > 0 && (
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Посещаемость - {selectedClass.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    Отметьте присутствующих и отсутствующих учеников
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {selectedClass.students.map((student) => (
                      <Box
                        key={student.id}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          p: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                          bgcolor: 'background.default'
                        }}
                      >
                        {/* Информация об ученике */}
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {student.last_name} {student.first_name}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {student.email}
                          </Typography>
                        </Box>

                        {/* Кнопки посещаемости */}
                        <ToggleButtonGroup
                          value={formData.attendance[student.id] || ''}
                          exclusive
                          onChange={(e, newStatus) => {
                            if (newStatus !== null) {
                              handleAttendanceChange(student.id, newStatus);
                            }
                          }}
                          aria-label={`Посещаемость ${student.first_name} ${student.last_name}`}
                        >
                          <ToggleButton 
                            value="present" 
                            aria-label="Присутствовал"
                            sx={{ 
                              minWidth: 120,
                              '&.Mui-selected': {
                                bgcolor: 'success.main',
                                color: 'white',
                                '&:hover': { bgcolor: 'success.dark' }
                              }
                            }}
                          >
                            <Check sx={{ mr: 1 }} />
                            Присутствовал
                          </ToggleButton>
                          <ToggleButton 
                            value="absent" 
                            aria-label="Отсутствовал"
                            sx={{ 
                              minWidth: 120,
                              '&.Mui-selected': {
                                bgcolor: 'error.main',
                                color: 'white',
                                '&:hover': { bgcolor: 'error.dark' }
                              }
                            }}
                          >
                            <Close sx={{ mr: 1 }} />
                            Отсутствовал
                          </ToggleButton>
                        </ToggleButtonGroup>

                        {/* Статус */}
                        <Chip
                          label={formData.attendance[student.id] === 'present' ? '✅ Присутствовал' : 
                                 formData.attendance[student.id] === 'absent' ? '❌ Отсутствовал' : 'Не отмечен'}
                          color={formData.attendance[student.id] === 'present' ? 'success' : 
                                 formData.attendance[student.id] === 'absent' ? 'error' : 'default'}
                          variant="outlined"
                          sx={{ minWidth: 140 }}
                        />
                      </Box>
                    ))}
                  </Box>

                  {/* Статистика */}
                  <Box sx={{ mt: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="body2">
                      Отмечено: {Object.keys(formData.attendance).length} из {selectedClass.students.length} учеников
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            )}

            {selectedClass && (!selectedClass.students || selectedClass.students.length === 0) && (
              <Alert severity="warning">
                В выбранном классе нет учеников. Сначала добавьте учеников в класс.
              </Alert>
            )}

            <TextField
              label="Домашнее задание"
              name="homework"
              value={formData.homework}
              onChange={handleChange}
              required
              multiline
              rows={3}
              placeholder="Задание для самостоятельной работы..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Отмена</Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading || subjects.length === 0 || classes.length === 0}
          >
            {initialData.id ? 'Обновить' : 'Создать'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EnhancedEntryForm;