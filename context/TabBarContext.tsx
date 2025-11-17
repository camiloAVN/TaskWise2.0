import React, { createContext, ReactNode, useContext, useState } from 'react';
import { StyleSheet, View } from 'react-native';

interface TabBarContextType {
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
}

const TabBarContext = createContext<TabBarContextType | undefined>(undefined);

export const useTabBar = () => {
  const context = useContext(TabBarContext);
  if (!context) {
    throw new Error('useTabBar must be used within TabBarProvider');
  }
  return context;
};

interface TabBarProviderProps {
  children: ReactNode;
  tabBarComponent: ReactNode;
}

export const TabBarProvider: React.FC<TabBarProviderProps> = ({ 
  children, 
  tabBarComponent 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <TabBarContext.Provider value={{ isVisible, setIsVisible }}>
      <View style={styles.container}>
        {children}
        {/* TabBar renderizado aquí, fuera del flujo normal */}
        {isVisible && (
          <View style={styles.tabBarWrapper}>
            {tabBarComponent}
          </View>
        )}
      </View>
    </TabBarContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  tabBarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 999999,
    elevation: 999999,
    pointerEvents: 'box-none',
  },
});