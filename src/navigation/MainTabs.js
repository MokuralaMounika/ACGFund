import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

import DashboardScreen from '../screens/DashboardScreen';
import UsersScreen from '../screens/UsersScreen';
import DonorBalancesScreen from '../screens/DonorBalancesScreen';
import AdvisorsBalanceScreen from '../screens/AdvisorsBalanceScreen';
import StatementsScreen from '../screens/StatementsScreen';

const Tab = createBottomTabNavigator();

export default function MainTabs({ route, navigation }) {
  const user = route?.params?.user;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        headerTitleAlign: 'center',
        headerStyle: { backgroundColor: '#0B2E4F' },
        headerTintColor: '#fff',
        tabBarActiveTintColor: '#7A1E1E',
        tabBarInactiveTintColor: '#7f8c8d',
        tabBarStyle: { backgroundColor: '#fff' },

        tabBarIcon: ({ focused, color, size }) => {
          let iconName = 'circle';

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';

          } else if (route.name === 'Users') {
            iconName = focused ? 'people' : 'people-outline';

          } else if (route.name === 'DonorBalances') {
            iconName = 'logo-usd'; // dollar icon

          } else if (route.name === 'AdvisorsBalance') {
            iconName = focused ? 'settings' : 'settings-outline'; // settings icon

          } else if (route.name === 'Statements') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        initialParams={{ user }}
        options={{ title: 'Dashboard' }}
      />

      <Tab.Screen
        name="Users"
        component={UsersScreen}
        initialParams={{ user }}
        options={{ title: 'Users' }}
      />

      <Tab.Screen
        name="DonorBalances"
        component={DonorBalancesScreen}
        initialParams={{ user }}
        options={{ title: 'Donor Balances' }}
      />

      <Tab.Screen
        name="AdvisorsBalance"
        component={AdvisorsBalanceScreen}
        initialParams={{ user }}
        options={{ title: 'Advisors Balance' }}
      />

      <Tab.Screen
        name="Statements"
        component={StatementsScreen}
        initialParams={{ user }}
        options={{ title: 'Statements' }}
      />
    </Tab.Navigator>
  );
}
