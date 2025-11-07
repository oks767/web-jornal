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
  Alert
} from '@mui/material';
import { Add, Delete, Person } from '@mui/icons-material';
import { Student, StudentCreate } from '../types';
import { studentService } from '../services/students';

const StudentManager: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<StudentCreate>({
    first_name: '',
    last_name: '',
    email: ''
  });

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async (): Promise<void> => {
    try {
      const data = await studentService.getStudents();
      setStudents(data);
    } catch (err) {
      setError('Не удалось загрузить список учеников');
    }
  };

  const handleCreateStudent = async (): Promise<void> => {
    try {
      setLoading(true);
      await studentService.createStudent(formData);
      setDialogOpen(false);
      setFormData({ first_name: '', last_name: '', email: '' });
      loadStudents();
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
        loadStudents();
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
        >
          Добавить ученика
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

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

      {students.length === 0 && (
        <Typography textAlign="center" sx={{ mt: 4 }}>
          В вашем классе пока нет учеников
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
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Отмена</Button>
          <Button 
            onClick={handleCreateStudent} 
            variant="contained"
            disabled={loading}
          >
            Добавить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentManager;