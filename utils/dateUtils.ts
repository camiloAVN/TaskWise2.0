/**
 * Formatea una fecha a 'YYYY-MM-DD' (compatible con react-native-calendars)
 */
export const formatDateToCalendar = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Formatea una fecha a 'HH:mm' (24h)
 */
export const formatTimeToCalendar = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
 * Obtiene la fecha actual en formato 'YYYY-MM-DD'
 */
export const getTodayDate = (): string => {
  const now = new Date();
  
  // Forzar a usar la fecha local del dispositivo
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  const todayDate = `${year}-${month}-${day}`;
  
  console.log('🗓️ System date:', now.toString()); // Debug completo
  console.log('🗓️ Today date (local):', todayDate); // Debug
  
  return todayDate;
};
/**
 * Obtiene la hora actual en formato 'HH:mm'
 */
export const getCurrentTime = (): string => {
  return formatTimeToCalendar(new Date());
};

/**
 * Formatea un timestamp local completo 'YYYY-MM-DD HH:mm:ss'
 * Útil para campos completedAt, createdAt, updatedAt en la base de datos
 */
export const formatLocalTimestamp = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

/**
 * Convierte 'YYYY-MM-DD' a Date object
 */
export const parseCalendarDate = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number);
  // Crear fecha en hora local (no UTC)
    return new Date(year, month - 1, day);
};

/**
 * Combina fecha y hora en ISO string
 */
export const combineDateAndTime = (date: string, time: string): string => {
  return new Date(`${date}T${time}:00`).toISOString();
};

/**
 * Verifica si una fecha es hoy
 */
export const isToday = (dateString: string): boolean => {
  return dateString === getTodayDate();
};

/**
 * Verifica si una fecha es ayer
 */
export const isYesterday = (dateString: string): boolean => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return dateString === formatDateToCalendar(yesterday);
};

/**
 * Calcula la diferencia en días entre dos fechas
 */
export const daysDifference = (date1: string, date2: string): number => {
  const d1 = parseCalendarDate(date1);
  const d2 = parseCalendarDate(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Verifica si la fecha límite ya pasó
 */
export const isOverdue = (dueDate: string, dueTime?: string): boolean => {
  const now = new Date();
  const due = dueTime 
    ? new Date(combineDateAndTime(dueDate, dueTime))
    : parseCalendarDate(dueDate);
  
  return now > due;
};

/**
 * Verifica si una tarea se completó antes de tiempo
 */
export const wasCompletedEarly = (
  completedAt: string,
  dueDate?: string,
  dueTime?: string
): boolean => {
  if (!dueDate) return false;
  
  const completed = new Date(completedAt);
  const due = dueTime
    ? new Date(combineDateAndTime(dueDate, dueTime))
    : parseCalendarDate(dueDate);
  
  return completed < due;
};

/**
 * Obtiene el día de la semana (0 = domingo, 6 = sábado)
 */
export const getDayOfWeek = (dateString: string): number => {
  return parseCalendarDate(dateString).getDay();
};

/**
 * Obtiene el nombre del día de la semana
 */
export const getDayName = (dateString: string): string => {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return days[getDayOfWeek(dateString)];
};

/**
 * Obtiene la hora del día (0-23)
 */
export const getHourOfDay = (date: Date | string): number => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.getHours();
};

/**
 * Formatea una fecha de forma legible
 */
export const formatReadableDate = (dateString: string): string => {
  const date = parseCalendarDate(dateString);
  const today = getTodayDate();
  const yesterday = formatDateToCalendar(new Date(Date.now() - 86400000));
  
  if (dateString === today) return 'Hoy';
  if (dateString === yesterday) return 'Ayer';
  
  const options: Intl.DateTimeFormatOptions = { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  };
  return date.toLocaleDateString('es-ES', options);
};

/**
 * Obtiene un rango de fechas (útil para estadísticas)
 */
export const getDateRange = (period: 'week' | 'month' | 'year'): {
  startDate: string;
  endDate: string;
} => {
  const end = new Date();
  const start = new Date();
  
  switch (period) {
    case 'week':
      start.setDate(start.getDate() - 7);
      break;
    case 'month':
      start.setMonth(start.getMonth() - 1);
      break;
    case 'year':
      start.setFullYear(start.getFullYear() - 1);
      break;
  }
  
  return {
    startDate: formatDateToCalendar(start),
    endDate: formatDateToCalendar(end),
  };
};