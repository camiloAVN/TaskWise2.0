import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ProfileHeaderProps {
  avatar?: string;
  name: string;
  onEditPress: () => void;
  onAvatarPress: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  avatar,
  name,
  onEditPress,
  onAvatarPress,
}) => {
  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <View style={styles.gradientContainer}>
        <View style={styles.gradientTop} />
      </View>

      {/* Avatar */}
      <TouchableOpacity
        style={styles.avatarContainer}
        onPress={onAvatarPress}
        activeOpacity={0.8}
      >
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={64} color="#000" />
          </View>
        )}
        
        {/* Edit Avatar Button */}
        <View style={styles.editAvatarButton}>
          <Ionicons name="camera" size={20} color="#000" />
        </View>
      </TouchableOpacity>

      {/* Name */}
      <Text style={styles.name}>{name}</Text>

      {/* Edit Profile Button */}
      <TouchableOpacity
        style={styles.editButton}
        onPress={onEditPress}
        activeOpacity={0.7}
      >
        <Ionicons name="create-outline" size={18} color="#000" />
        <Text style={styles.editButtonText}>Editar Perfil</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 30,
    position: 'relative',
  },
  gradientContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    overflow: 'hidden',
  },
  gradientTop: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1a1a1a',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#d9f434',
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#d9f434',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#d9f434',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#d9f434',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#000',
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d9f434',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
});