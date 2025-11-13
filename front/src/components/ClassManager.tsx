import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Card,
  CardContent,
  IconButton,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip
} from '@mui/material';
import { Add, Delete, ExpandMore, Person } from '@mui/icons-material';
import { ClassWithStudents, StudentCreate } from '../types';
import { classService } from '../services/classes';

interface ClassManagerProps {
  onClassesUpdate?: () => void;
}

const ClassManager: React.FC<ClassManagerProps> = ({ onClassesUpdate }) => {
  const [classes, setClasses] = useState<ClassWithStudents[]>([]);
  const [classDialogOpen, setClassDialogOpen] = useState(false);
  const [studentDialogOpen, setStudentDialogOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [className, setClassName] = useState('');
  const [studentData, setStudentData] = useState<StudentCreate>({
    first_name: '',
    last_name: '',
    email: '',
    class_id: 0
  });

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async (): Promise<void> => {
    try {
      setLoading(true);
      const data = await classService.getClasses();
      setClasses(data || []); // Убедимся что всегда массив
    } catch (err: any) {
      console.error('Error loading classes:', err);
      setError('Не удалось загрузить список классов');
      setClasses([]); // Устанавливаем пустой массив при ошибке
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async (): Promise<void> => {
    if (!className.trim()) return;

    try {
      setLoading(true);
      await classService.createClass({ name: className });
      setClassDialogOpen(false);
      setClassName('');
      await loadClasses();
      // Вызываем callback для обновления в родительском компоненте
      if (onClassesUpdate) {
        onClassesUpdate();
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Не удалось создать класс');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStudent = async (): Promise<void> => {
    if (!selectedClassId) return;

    try {
      setLoading(true);
      await classService.createStudent({
        ...studentData,
        class_id: selectedClassId
      });
      setStudentDialogOpen(false);
      setStudentData({ first_name: '', last_name: '', email: '', class_id: 0 });
      await loadClasses();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Не удалось добавить ученика');
    } finally {
      setLoading(false);
    }
  };

  const openStudentDialog = (classId: number): void => {
    setSelectedClassId(classId);
    setStudentDialogOpen(true);
  };

  if (loading && classes.length === 0) {
    return <Typography>Загрузка классов...</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Управление классами</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setClassDialogOpen(true)}
        >
          Создать класс
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {classes && classes.length > 0 ? (
          classes.map((classItem) => (
            <Accordion key={classItem.id}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                  {classItem.name}
                </Typography>
                <Chip 
                  label={`${classItem.students?.length || 0} учеников`} 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                />
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="subtitle1">Ученики класса:</Typography>
                  <Button
                    size="small"
                    startIcon={<Add />}
                    onClick={() => openStudentDialog(classItem.id)}
                  >
                    Добавить ученика
                  </Button>
                </Box>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {classItem.students && classItem.students.length > 0 ? (
                    classItem.students.map((student) => (
                      <Card key={student.id} sx={{ minWidth: 200 }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Person sx={{ mr: 1 }} />
                            <Typography>
                              {student.first_name} {student.last_name}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="textSecondary">
                            {student.email}
                          </Typography>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      В классе пока нет учеников
                    </Typography>
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>
          ))
        ) : (
          <Typography textAlign="center" sx={{ mt: 4 }}>
            У вас пока нет созданных классов. Создайте первый класс!
          </Typography>
        )}
      </Box>

      {/* Диалог создания класса */}
      <Dialog open={classDialogOpen} onClose={() => setClassDialogOpen(false)}>
        <DialogTitle>Создать новый класс</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Название класса"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            fullWidth
            sx={{ mt: 2, minWidth: 300 }}
            placeholder="Например: 1-А, 2-Б, 5-В..."
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleCreateClass();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClassDialogOpen(false)}>Отмена</Button>
          <Button 
            onClick={handleCreateClass} 
            variant="contained"
            disabled={loading || !className.trim()}
          >
            Создать
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог добавления ученика */}
      <Dialog open={studentDialogOpen} onClose={() => setStudentDialogOpen(false)}>
        <DialogTitle>Добавить ученика в класс</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1, minWidth: 300 }}>
            <TextField
              label="Имя"
              value={studentData.first_name}
              onChange={(e) => setStudentData({ ...studentData, first_name: e.target.value })}
              required
            />
            <TextField
              label="Фамилия"
              value={studentData.last_name}
              onChange={(e) => setStudentData({ ...studentData, last_name: e.target.value })}
              required
            />
            <TextField
              label="Email"
              type="email"
              value={studentData.email}
              onChange={(e) => setStudentData({ ...studentData, email: e.target.value })}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStudentDialogOpen(false)}>Отмена</Button>
          <Button 
            onClick={handleCreateStudent} 
            variant="contained"
            disabled={loading || !studentData.first_name.trim() || !studentData.last_name.trim() || !studentData.email.trim()}
          >
            Добавить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClassManager;