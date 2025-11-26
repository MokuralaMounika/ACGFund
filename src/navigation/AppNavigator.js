import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
import MainTabs from './MainTabs';
import ProfileScreen from '../screens/ProfileScreen';

// Details Screens
import DonorBalanceDetailsScreen from '../screens/DonorBalanceDetailsScreen';
import UserDetailsScreen from '../screens/UserDetailsScreen';
import AdvisorsBalanceDetailsScreen from '../screens/AdvisorsBalanceDetailsScreen'; 
import CustomReportsScreen from "../screens/CustomReportsScreen";
import ProcessDataScreen from "../screens/ProcessDataScreen";
import FundPriceScreen from "../screens/FundPriceScreen"; 

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>

        {/* Login Screen */}
        <Stack.Screen name="Login" component={LoginScreen} />

        {/* Main App */}
        <Stack.Screen name="Main" component={MainTabs} />

        {/* Profile Screen */}
        <Stack.Screen name="Profile" component={ProfileScreen} />

        {/* Donor Balance Details */}
        <Stack.Screen 
          name="DonorBalanceDetails" 
          component={DonorBalanceDetailsScreen}
        />

        {/* User Details Screen */}
        <Stack.Screen 
          name="UserDetails" 
          component={UserDetailsScreen}
        />

        {/* Advisor Balance Details Screen */}
        <Stack.Screen 
          name="AdvisorBalanceDetails" 
          component={AdvisorsBalanceDetailsScreen}
        />

        <Stack.Screen name="CustomReports" component={CustomReportsScreen} />
        <Stack.Screen name="ProcessData" component={ProcessDataScreen} />
        <Stack.Screen name="FundPrice" component={FundPriceScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
