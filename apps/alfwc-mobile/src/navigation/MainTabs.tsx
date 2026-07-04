import { FontAwesome5 } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors, fonts } from '../theme/colors';
import EventsScreen from '../screens/EventsScreen';
import GiveScreen from '../screens/GiveScreen';
import HomeScreen from '../screens/HomeScreen';
import MoreScreen from '../screens/MoreScreen';
import SermonsScreen from '../screens/SermonsScreen';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.mint,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.navyDeep,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: 6,
          paddingTop: 8,
          height: 72,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: fonts.semibold,
          letterSpacing: 0.4,
          marginTop: -2,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName: string = 'home';
          if (route.name === 'Sermons') iconName = 'book-open';
          if (route.name === 'Events') iconName = 'calendar-alt';
          if (route.name === 'Give') iconName = 'hand-holding-heart';
          if (route.name === 'More') iconName = 'bars';

          return <FontAwesome5 name={iconName as never} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Sermons" component={SermonsScreen} />
      <Tab.Screen name="Events" component={EventsScreen} />
      <Tab.Screen name="Give" component={GiveScreen} />
      <Tab.Screen name="More" component={MoreScreen} />
    </Tab.Navigator>
  );
}