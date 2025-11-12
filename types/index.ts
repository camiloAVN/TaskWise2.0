
// User
export * from './user';

// Achievement
export * from './achievement';

// Daily Mission
export * from './dailyMission';

// Streak
export * from './streak';

// Stats
export * from './stats';

// Tipos auxiliares para react-native-calendars
export interface MarkedDates {
  [date: string]: {
    marked?: boolean;
    dotColor?: string;
    selected?: boolean;
    selectedColor?: string;
    disabled?: boolean;
    disableTouchEvent?: boolean;
    customStyles?: any;
  };
}

// Helpers de fecha
export interface DateRange {
  startDate: string; // 'YYYY-MM-DD'
  endDate: string; // 'YYYY-MM-DD'
}

// Respuestas genéricas
export interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;