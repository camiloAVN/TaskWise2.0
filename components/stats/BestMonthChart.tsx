import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface MonthData {
  month: string;
  completed: number;
  percentage: number;
}

interface BestMonthsChartProps {
  months: MonthData[];
}

export const BestMonthsChart: React.FC<BestMonthsChartProps> = ({ months }) => {
  const maxCompleted = Math.max(...months.map(m => m.completed));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏆 Mejores Meses</Text>

      <View style={styles.chart}>
        {months.map((monthData, index) => {
          const barHeight = (monthData.completed / maxCompleted) * 100;

          return (
            <View key={index} style={styles.barContainer}>
              <View style={styles.barWrapper}>
                <View style={[styles.bar, { height: `${barHeight}%` }]}>
                  <Text style={styles.barValue}>{monthData.completed}</Text>
                </View>
              </View>
              <Text style={styles.monthLabel}>{monthData.month}</Text>
              <Text style={styles.percentageLabel}>{monthData.percentage}%</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 200,
    gap: 8,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
  },
  barWrapper: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  bar: {
    width: '100%',
    backgroundColor: '#d9f434',
    borderRadius: 8,
    minHeight: 20,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 6,
  },
  barValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
  },
  monthLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  percentageLabel: {
    fontSize: 10,
    color: '#666',
  },
});