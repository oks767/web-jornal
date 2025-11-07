import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  IconButton,
  Grid,
  Alert,
  Chip,
  Tabs,
  Tab
} from '@mui/material';
import { Add, Edit, Delete, Subject, Group } from '@mui/icons-material';
import { journalService } from '../services/journal';
import { JournalEntry, JournalEntryCreate } from '../types';
import EntryForm from '../components/EntryForm';
import SubjectManager from '../components/SubjectManager';
import StudentManager from '../components/StudentManager';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`journal-tabpanel-${index}`}
      aria-labelledby={`journal-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const Journal: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [currentTab, setCurrentTab] = useState<number>(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (): Promise<void> => {
    try {
      setLoading(true);
      const [entriesData, subjectsData] = await Promise.all([
        journalService.getEntries(),
        journalService.getSubjects()
      ]);
      
      setEntries(entriesData);
      setSubjects(subjectsData);
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError('Не удалось загрузить данные');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEntry = async (entryData: JournalEntryCreate): Promise<void> => {
  try {
    await journalService.createEntry(entryData);
    setFormOpen(false);
    loadData();
  } catch (err: any) {
    console.error('Error creating entry:', err);
    console.error('Error details:', err.response?.data);
    
    // Покажем детали ошибки от сервера
    const errorDetail = err.response?.data?.detail;
    if (Array.isArray(errorDetail)) {
      // Если ошибки валидации в виде массива
      const errorMessages = errorDetail.map((error: any) => 
        `${error.loc.join('.')}: ${error.msg}`
      ).join(', ');
      setError(`Ошибка валидации: ${errorMessages}`);
    } else if (typeof errorDetail === 'string') {
      // Если ошибка в виде строки
      setError(`Ошибка: ${errorDetail}`);
    } else {
      setError('Не удалось создать запись: ' + (err.response?.data?.detail || 'Unknown error'));
    }
  }
};

  const handleUpdateEntry = async (entryData: JournalEntryCreate): Promise<void> => {
    if (!editingEntry) return;
    
    try {
      await journalService.updateEntry(editingEntry.id, entryData);
      setFormOpen(false);
      setEditingEntry(null);
      loadData();
    } catch (err: any) {
      console.error('Error updating entry:', err);
      setError('Не удалось обновить запись');
    }
  };

  const handleDeleteEntry = async (entryId: number): Promise<void> => {
    if (window.confirm('Вы уверены, что хотите удалить эту запись?')) {
      try {
        await journalService.deleteEntry(entryId);
        loadData();
      } catch (err: any) {
        setError('Не удалось удалить запись');
      }
    }
  };

  const handleEditClick = (entry: JournalEntry): void => {
    setEditingEntry(entry);
    setFormOpen(true);
  };

  const handleFormClose = (): void => {
    setFormOpen(false);
    setEditingEntry(null);
  };

  const handleFormSubmit = (data: JournalEntryCreate): void => {
    if (editingEntry) {
      handleUpdateEntry(data);
    } else {
      handleCreateEntry(data);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number): void => {
    setCurrentTab(newValue);
  };

  if (loading) {
    return <Typography>Загрузка...</Typography>;
  }

  return (
    <Box>
      <Tabs value={currentTab} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab icon={<Subject />} label="Журнал" />
        <Tab icon={<Group />} label="Ученики" />
        <Tab icon={<Subject />} label="Предметы" />
      </Tabs>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Вкладка журнала */}
      <TabPanel value={currentTab} index={0}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4">Журнал занятий</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setFormOpen(true)}
            disabled={subjects.length === 0}
          >
            Добавить запись
          </Button>
        </Box>

        {subjects.length === 0 && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Сначала создайте предметы во вкладке "Предметы", чтобы добавлять записи в журнал
          </Alert>
        )}

        <Grid container spacing={3}>
          {entries.map((entry) => (
            <Grid item xs={12} md={6} key={entry.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {subjects.find(s => s.id === entry.subject_id)?.name || `Предмет #${entry.subject_id}`}
                      </Typography>
                      <Chip 
                        label={new Date(entry.date).toLocaleDateString('ru-RU')} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                    </Box>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handleEditClick(entry)}
                        title="Редактировать"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteEntry(entry.id)}
                        title="Удалить"
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  <Typography variant="body2" sx={{ mt: 2 }} paragraph>
                    <strong>Тема урока:</strong> {entry.topic}
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>Домашнее задание:</strong> {entry.homework}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Посещаемость:</strong> 
                    <Box component="span" sx={{ whiteSpace: 'pre-wrap', display: 'block', mt: 0.5 }}>
                      {entry.attendance}
                    </Box>
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {entries.length === 0 && subjects.length > 0 && (
          <Typography textAlign="center" sx={{ mt: 4 }}>
            Записей в журнале пока нет. Создайте первую запись!
          </Typography>
        )}
      </TabPanel>

      {/* Вкладка учеников */}
      <TabPanel value={currentTab} index={1}>
        <StudentManager />
      </TabPanel>

      {/* Вкладка предметов */}
      <TabPanel value={currentTab} index={2}>
        <SubjectManager onSubjectsUpdate={loadData} />
      </TabPanel>

      <EntryForm
        open={formOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        initialData={editingEntry || {}}
        subjects={subjects}
      />
    </Box>
  );
};

export default Journal;