import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { formatDateToCalendar, getTodayDate } from '../../utils/dateUtils';

interface WeekCalendarProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  onMonthChange?: (year: number, month: number) => void;
  markedDates: { [date: string]: boolean };
}

export const WeekCalendar: React.FC<WeekCalendarProps> = ({
  selectedDate,
  onDateSelect,
  onMonthChange, 
  markedDates,
}) => {
  const today = getTodayDate();


  useEffect(() => {
    const [year, month] = selectedDate.split('-').map(Number);
    onMonthChange?.(year, month);
  }, [selectedDate]);

  // Generar los 7 días de la semana actual
  const getWeekDays = () => {
    const selected = new Date(selectedDate + 'T00:00:00');
    const dayOfWeek = selected.getDay(); // 0 = domingo
    const startOfWeek = new Date(selected);
    startOfWeek.setDate(selected.getDate() - dayOfWeek);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDays.push({
        date: formatDateToCalendar(date),
        dayName: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][i],
        dayNumber: date.getDate(),
      });
    }
    return weekDays;
  };

  const weekDays = getWeekDays();

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {weekDays.map((day) => {
          const isSelected = day.date === selectedDate;
          const isToday = day.date === today;
          const hasTask = markedDates[day.date];

          return (
            <TouchableOpacity
              key={`week-day-${day.date}`}
              style={[
                styles.dayCard,
                isSelected && styles.dayCardSelected,
                isToday && !isSelected && styles.dayCardToday,
              ]}
              onPress={() => onDateSelect(day.date)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.dayName,
                  isSelected && styles.dayNameSelected,
                ]}
              >
                {day.dayName}
              </Text>
              <Text
                style={[
                  styles.dayNumber,
                  isSelected && styles.dayNumberSelected,
                  isToday && !isSelected && styles.dayNumberToday,
                ]}
              >
                {day.dayNumber}
              </Text>
              {hasTask && !isSelected && <View style={styles.dot} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  dayCard: {
    width: 56,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: '#1a1a1a',
    position: 'relative',
  },
  dayCardSelected: {
    backgroundColor: '#d9f434',
  },
  dayCardToday: {
    borderWidth: 2,
    borderColor: '#d9f434',
  },
  dayName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontWeight: '600',
  },
  dayNameSelected: {
    color: '#000',
  },
  dayNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  dayNumberSelected: {
    color: '#000',
  },
  dayNumberToday: {
    color: '#d9f434',
  },
  dot: {
    position: 'absolute',
    bottom: 6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#d9f434',
  },
});