// app/+not-found.tsx

import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: '¡Oops!' }} />
      <View style={styles.container}>
        <Text style={styles.title}>Esta pantalla no existe.</Text>
        <Link href="/(tabs)/Home" style={styles.link}>
          <Text style={styles.linkText}>Volver al inicio</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#000',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#d9f434',
    marginBottom: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 16,
    color: '#d9f434',
    textDecorationLine: 'underline',
  },
});