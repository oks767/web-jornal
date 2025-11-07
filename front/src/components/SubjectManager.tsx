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
import { Add, Delete, Subject } from '@mui/icons-material';
import { Subject as SubjectType, SubjectCreate } from '../types';
import { journalService } from '../services/journal';

interface SubjectManagerProps {
  onSubjectsUpdate?: () => void;
}

const SubjectManager: React.FC<SubjectManagerProps> = ({ onSubjectsUpdate }) => {
  const [subjects, setSubjects] = useState<SubjectType[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [subjectName, setSubjectName] = useState('');

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async (): Promise<void> => {
    try {
      const data = await journalService.getSubjects();
      setSubjects(data);
    } catch (err) {
      setError('Не удалось загрузить список предметов');
    }
  };

  const handleCreateSubject = async (): Promise<void> => {
    if (!subjectName.trim()) return;

    try {
      setLoading(true);
      await journalService.createSubject({ name: subjectName });
      setDialogOpen(false);
      setSubjectName('');
      await loadSubjects();
      // Вызываем callback для обновления в родительском компоненте
      if (onSubjectsUpdate) {
        onSubjectsUpdate();
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Не удалось создать предмет');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubject = async (subjectId: number): Promise<void> => {
    if (window.confirm('Вы уверены, что хотите удалить этот предмет?')) {
      try {
        await journalService.deleteSubject(subjectId);
        await loadSubjects();
        // Вызываем callback для обновления в родительском компоненте
        if (onSubjectsUpdate) {
          onSubjectsUpdate();
        }
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Не удалось удалить предмет');
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Мои предметы</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setDialogOpen(true)}
        >
          Создать предмет
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {subjects.map((subject) => (
          <Card key={subject.id} sx={{ minWidth: 200 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Subject sx={{ mr: 1 }} />
                <Typography variant="h6">
                  {subject.name}
                </Typography>
              </Box>
              <IconButton
                size="small"
                onClick={() => handleDeleteSubject(subject.id)}
                color="error"
              >
                <Delete />
              </IconButton>
            </CardContent>
          </Card>
        ))}
      </Box>

      {subjects.length === 0 && (
        <Typography textAlign="center" sx={{ mt: 4 }}>
          У вас пока нет созданных предметов. Создайте первый предмет!
        </Typography>
      )}

      {/* Диалог создания предмета */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Создать новый предмет</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Название предмета"
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
            fullWidth
            sx={{ mt: 2, minWidth: 300 }}
            placeholder="Например: Математика, Физика, История..."
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleCreateSubject();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Отмена</Button>
          <Button 
            onClick={handleCreateSubject} 
            variant="contained"
            disabled={loading || !subjectName.trim()}
          >
            Создать
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubjectManager;