import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function StatementsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Statements</Text>
      <Text>Placeholder for statements.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 18 },
  title: { fontSize: 20, fontFamily: 'Geist-Bold', color: '#0B2E4F', fontWeight: '700' },
});
