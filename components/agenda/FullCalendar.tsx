import React from 'react';
import { StyleSheet } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';

interface FullCalendarProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  onMonthChange?: (year: number, month: number) => void; 
  markedDates: { [date: string]: any };
}

export const FullCalendar: React.FC<FullCalendarProps> = ({
  selectedDate,
  onDateSelect,
  onMonthChange, 
  markedDates,
}) => {
  const handleDayPress = (day: DateData) => {
    onDateSelect(day.dateString);
  };


  const handleMonthChange = (date: DateData) => {
    console.log('📅 Month changed:', date.year, date.month);
    onMonthChange?.(date.year, date.month);
  };

  return (
    <Calendar
      current={selectedDate}
      onDayPress={handleDayPress}
      onMonthChange={handleMonthChange} 
      markedDates={{
        ...markedDates,
        [selectedDate]: {
          ...markedDates[selectedDate],
          selected: true,
          selectedColor: '#d9f434',
        },
      }}
      theme={{
        calendarBackground: '#000',
        textSectionTitleColor: '#666',
        selectedDayBackgroundColor: '#d9f434',
        selectedDayTextColor: '#000',
        todayTextColor: '#d9f434',
        dayTextColor: '#fff',
        textDisabledColor: '#333',
        monthTextColor: '#fff',
        textMonthFontWeight: 'bold',
        textMonthFontSize: 18,
        arrowColor: '#d9f434',
        dotColor: '#d9f434',
        selectedDotColor: '#000',
      }}
      style={styles.calendar}

      minDate={undefined}
      maxDate={undefined}
    />
  );
};

const styles = StyleSheet.create({
  calendar: {
    borderRadius: 16,
    paddingBottom: 10,
  },
});