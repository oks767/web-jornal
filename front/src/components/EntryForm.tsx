// import React, { useState, useEffect } from 'react';
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   TextField,
//   Button,
//   Box,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   Alert,
//   Typography,
//   Card,
//   CardContent,
//   ToggleButton,
//   ToggleButtonGroup
// } from '@mui/material';
// import { Check, Close } from '@mui/icons-material';
// import { JournalEntry, JournalEntryCreate, Subject, ClassWithStudents } from '../types';
// import { classService } from '../services/classes';

// interface EntryFormProps {
//   open: boolean;
//   onClose: () => void;
//   onSubmit: (data: JournalEntryCreate) => void;
//   initialData?: Partial<JournalEntry>;
//   subjects: Subject[];
// }

// const EntryForm: React.FC<EntryFormProps> = ({ 
//   open, 
//   onClose, 
//   onSubmit, 
//   initialData = {},
//   subjects = []
// }) => {
//   const [formData, setFormData] = useState<JournalEntryCreate>({
//     subject_id: initialData.subject_id || (subjects.length > 0 ? subjects[0].id : 0),
//     date: initialData.date || '',
//     topic: initialData.topic || '',
//     attendance: initialData.attendance || {},
//     homework: initialData.homework || '',
//     class_id: 0
//   });
//   const [classes, setClasses] = useState<ClassWithStudents[]>([]);
//   const [selectedClass, setSelectedClass] = useState<ClassWithStudents | null>(null);
//   const [error, setError] = useState<string>('');

//   useEffect(() => {
//     if (open) {
//       loadClasses();
//       const currentSubjectId = initialData.subject_id || (subjects.length > 0 ? subjects[0].id : 0);
//       const now = new Date();
//       const localDateTime = initialData.date || new Date(now.getTime() - now.getTimezoneOffset() * 60000)
//         .toISOString()
//         .slice(0, 16);
      
//       setFormData({
//         subject_id: currentSubjectId,
//         date: localDateTime,
//         topic: initialData.topic || '',
//         attendance: initialData.attendance || {},
//         homework: initialData.homework || '',
//         class_id: 0
//       });
//     }
//   }, [open, initialData, subjects]);

//   const loadClasses = async (): Promise<void> => {
//     try {
//       const data = await classService.getClasses();
//       setClasses(data);
//     } catch (err) {
//       setError('Не удалось загрузить список классов');
//     }
//   };

//   const handleClassChange = (classId: number): void => {
//     const selected = classes.find(c => c.id === classId) || null;
//     setSelectedClass(selected);
//     setFormData(prev => ({
//       ...prev,
//       class_id: classId,
//       attendance: {} // Сбрасываем посещаемость при смене класса
//     }));
//   };

//   const handleAttendanceChange = (studentId: number, status: string): void => {
//     setFormData(prev => ({
//       ...prev,
//       attendance: {
//         ...prev.attendance,
//         [studentId]: status
//       }
//     }));
//   };

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleSelectChange = (e: any): void => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: parseInt(value) || 0
//     }));
//   };

//   const handleSubmit = (e: React.FormEvent): void => {
//     e.preventDefault();
    
//     if (formData.subject_id === 0) {
//       setError('Пожалуйста, выберите предмет');
//       return;
//     }

//     if (formData.class_id === 0) {
//       setError('Пожалуйста, выберите класс');
//       return;
//     }
    
//     if (!formData.topic.trim()) {
//       setError('Пожалуйста, введите тему урока');
//       return;
//     }

//     // Проверяем, что все ученики отмечены
//     if (selectedClass && Object.keys(formData.attendance).length !== selectedClass.students.length) {
//       setError('Пожалуйста, отметьте посещаемость всех учеников');
//       return;
//     }
    
//     setError('');
//     onSubmit(formData);
//   };

//   return (
//     <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
//       <DialogTitle>
//         {initialData.id ? 'Редактировать запись в журнале' : 'Добавить запись в журнал'}
//       </DialogTitle>
//       <form onSubmit={handleSubmit}>
//         <DialogContent>
//           {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
//           <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
//             {/* Основные поля */}
//             <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
//               <FormControl fullWidth required>
//                 <InputLabel id="subject-select-label">Предмет</InputLabel>
//                 <Select
//                   labelId="subject-select-label"
//                   name="subject_id"
//                   value={formData.subject_id}
//                   label="Предмет"
//                   onChange={handleSelectChange}
//                 >
//                   {subjects.map((subject) => (
//                     <MenuItem key={subject.id} value={subject.id}>
//                       {subject.name}
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>

//               <FormControl fullWidth required>
//                 <InputLabel id="class-select-label">Класс</InputLabel>
//                 <Select
//                   labelId="class-select-label"
//                   name="class_id"
//                   value={formData.class_id}
//                   label="Класс"
//                   onChange={(e) => handleClassChange(Number(e.target.value))}
//                 >
//                   {classes.map((classItem) => (
//                     <MenuItem key={classItem.id} value={classItem.id}>
//                       {classItem.name} ({classItem.students.length} учеников)
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>
//             </Box>

//             <TextField
//               label="Дата и время занятия"
//               name="date"
//               type="datetime-local"
//               value={formData.date}
//               onChange={handleChange}
//               InputLabelProps={{ shrink: true }}
//               required
//             />

//             <TextField
//               label="Тема урока"
//               name="topic"
//               value={formData.topic}
//               onChange={handleChange}
//               required
//               multiline
//               rows={2}
//             />

//             {/* Посещаемость */}
//             {selectedClass && (
//               <Card variant="outlined">
//                 <CardContent>
//                   <Typography variant="h6" gutterBottom>
//                     Посещаемость - {selectedClass.name}
//                   </Typography>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
//                     {selectedClass.students.map((student) => (
//                       <Box
//                         key={student.id}
//                         sx={{
//                           display: 'flex',
//                           justifyContent: 'space-between',
//                           alignItems: 'center',
//                           p: 1,
//                           border: '1px solid',
//                           borderColor: 'divider',
//                           borderRadius: 1
//                         }}
//                       >
//                         <Typography>
//                           {student.last_name} {student.first_name}
//                         </Typography>
//                         <ToggleButtonGroup
//                           value={formData.attendance[student.id] || ''}
//                           exclusive
//                           onChange={(e, newStatus) => handleAttendanceChange(student.id, newStatus)}
//                           aria-label={`Посещаемость ${student.first_name} ${student.last_name}`}
//                         >
//                           <ToggleButton value="present" aria-label="Присутствовал">
//                             <Check sx={{ mr: 1 }} />
//                             Присутствовал
//                           </ToggleButton>
//                           <ToggleButton value="absent" aria-label="Отсутствовал">
//                             <Close sx={{ mr: 1 }} />
//                             Отсутствовал
//                           </ToggleButton>
//                         </ToggleButtonGroup>
//                       </Box>
//                     ))}
//                   </Box>
//                 </CardContent>
//               </Card>
//             )}

//             <TextField
//               label="Домашнее задание"
//               name="homework"
//               value={formData.homework}
//               onChange={handleChange}
//               required
//               multiline
//               rows={3}
//             />
//           </Box>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={onClose}>Отмена</Button>
//           <Button type="submit" variant="contained" disabled={subjects.length === 0 || classes.length === 0}>
//             {initialData.id ? 'Обновить' : 'Создать'}
//           </Button>
//         </DialogActions>
//       </form>
//     </Dialog>
//   );
// };

// export default EntryForm;