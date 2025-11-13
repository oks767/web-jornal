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
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Add, Delete, Person } from '@mui/icons-material';
import { Student, StudentCreate, ClassWithStudents } from '../types';
import { studentService } from '../services/students';
import { classService } from '../services/classes';

const StudentManager: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassWithStudents[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<StudentCreate>({
    first_name: '',
    last_name: '',
    email: '',
    class_id: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (): Promise<void> => {
    try {
      const [studentsData, classesData] = await Promise.all([
        studentService.getStudents(),
        classService.getClasses()
      ]);
      setStudents(studentsData);
      setClasses(classesData);
    } catch (err) {
      setError('Не удалось загрузить данные');
    }
  };

  const handleCreateStudent = async (): Promise<void> => {
    try {
      setLoading(true);
      await studentService.createStudent(formData);
      setDialogOpen(false);
      setFormData({ first_name: '', last_name: '', email: '', class_id: 0 });
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Не удалось добавить ученика');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStudent = async (studentId: number): Promise<void> => {
    if (window.confirm('Вы уверены, что хотите удалить этого ученика из вашего класса?')) {
      try {
        await studentService.removeStudent(studentId);
        loadData();
      } catch (err) {
        setError('Не удалось удалить ученика');
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Управление учениками</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setDialogOpen(true)}
          disabled={classes.length === 0}
        >
          Добавить ученика
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {classes.length === 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Сначала создайте классы, чтобы добавлять учеников
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {students.map((student) => (
          <Card key={student.id} sx={{ minWidth: 200 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Person sx={{ mr: 1 }} />
                <Typography variant="h6">
                  {student.first_name} {student.last_name}
                </Typography>
              </Box>
              <Typography variant="body2" color="textSecondary">
                {student.email}
              </Typography>
              {student.class_name && (
                <Typography variant="body2" color="primary" sx={{ mt: 0.5 }}>
                  Класс: {student.class_name}
                </Typography>
              )}
              <IconButton
                size="small"
                onClick={() => handleRemoveStudent(student.id)}
                sx={{ mt: 1 }}
                color="error"
              >
                <Delete />
              </IconButton>
            </CardContent>
          </Card>
        ))}
      </Box>

      {students.length === 0 && classes.length > 0 && (
        <Typography textAlign="center" sx={{ mt: 4 }}>
          В ваших классах пока нет учеников
        </Typography>
      )}

      {/* Диалог добавления ученика */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Добавить ученика в класс</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1, minWidth: 300 }}>
            <TextField
              label="Имя"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              required
            />
            <TextField
              label="Фамилия"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              required
            />
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <FormControl fullWidth required>
              <InputLabel>Класс</InputLabel>
              <Select
                value={formData.class_id}
                label="Класс"
                onChange={(e) => setFormData({ ...formData, class_id: Number(e.target.value) })}
              >
                {classes.map((classItem) => (
                  <MenuItem key={classItem.id} value={classItem.id}>
                    {classItem.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Отмена</Button>
          <Button 
            onClick={handleCreateStudent} 
            variant="contained"
            disabled={loading || !formData.first_name.trim() || !formData.last_name.trim() || !formData.email.trim() || !formData.class_id}
          >
            Добавить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentManager;