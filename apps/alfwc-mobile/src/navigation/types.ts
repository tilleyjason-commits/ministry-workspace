import type { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
  Home: undefined;
  Sermons: undefined;
  Events: undefined;
  Give: undefined;
  More: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  PlanVisit: undefined;
  PrayerRequest: undefined;
  ConnectCard: undefined;
  MemberHub: undefined;
  About: undefined;
  Settings: undefined;
};