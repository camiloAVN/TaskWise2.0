import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { User } from '../../types/user';

interface UserHeaderProps {
  user: User;
  onProfilePress?: () => void;
}

export const UserHeader: React.FC<UserHeaderProps> = ({ user, onProfilePress }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.userInfo}
        onPress={onProfilePress}
        activeOpacity={0.7}
      >
        {/* Avatar */}
        {user.avatar ? (
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={24} color="#000" />
          </View>
        )}
        
        {/* User Info */}
        <View style={styles.textContainer}>
          <Text style={styles.greeting}>Hola,</Text>
          <Text style={styles.name}>{user.name}</Text>
        </View>
      </TouchableOpacity>
      
      {/* Notifications/Settings */}
      <TouchableOpacity style={styles.iconButton}>
        <Ionicons name="notifications-outline" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#d9f434',
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#d9f434',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    marginLeft: 12,
  },
  greeting: {
    fontSize: 14,
    color: '#666',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
  },
});