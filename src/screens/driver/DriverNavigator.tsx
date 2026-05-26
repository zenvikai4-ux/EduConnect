import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar, Switch, Alert, Linking } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useStore } from '../../store';
import { BUS_ROUTE } from '../../data/demoData';

const Tab = createBottomTabNavigator();
const C = { brand:'#1E3A8A', success:'#059669', successBg:'#D1FAE5', warning:'#D97706', danger:'#DC2626', dark:'#0F172A', darkCard:'#1E293B', darkBorder:'#334155', darkMuted:'#94A3B8', darkText:'#F1F5F9', white:'#FFFFFF' };

const RouteScreen: React.FC = () => {
  const { user, logout } = useStore();
  const [gpsOn, setGpsOn] = useState(false);
  const [stops, setStops] = useState(BUS_ROUTE.stops);
  const completed = stops.filter(s => s.completed).length;

  const toggleGPS = (val: boolean) => {
    if (val) { Alert.alert('GPS Tracking On', 'Parents can now see your live location.'); }
    setGpsOn(val);
  };

  const markArrived = (id: string, name: string) => {
    setStops(prev => prev.map(s => s.id === id ? { ...s, completed: true } : s));
    Alert.alert(`✅ Arrived at ${name}`, 'Parents have been notified.');
  };

  const callSchool = () => Linking.openURL('tel:08041234567');

  return (
    <View style={{ flex: 1, backgroundColor: C.dark }}>
      <StatusBar barStyle="light-content" />
      <View style={{ backgroundColor: C.darkCard, paddingTop: 52, paddingBottom: 20, paddingHorizontal: 18 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View>
            <Text style={{ fontSize: 10, color: C.darkMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 }}>BUS DRIVER</Text>
            <Text style={{ fontSize: 24, fontWeight: '900', color: C.darkText, marginTop: 2 }}>{user?.name ?? 'Ramu Yadav'}</Text>
            <Text style={{ fontSize: 12, color: C.darkMuted, marginTop: 2 }}>{BUS_ROUTE.routeName} · {BUS_ROUTE.vehicle}</Text>
          </View>
          <TouchableOpacity style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }} onPress={logout}>
            <Text style={{ fontSize: 11, color: C.darkMuted, fontWeight: '700' }}>LOGOUT</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>

        {/* GPS Toggle */}
        <View style={s.darkCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={[s.gpsDot, { backgroundColor: gpsOn ? C.success : '#475569' }]} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '800', color: C.darkText }}>GPS Location Sharing</Text>
              <Text style={{ fontSize: 12, color: C.darkMuted, marginTop: 2 }}>{gpsOn ? '🟢 Live — Parents can see your location' : '⚫ Offline — Parents cannot track'}</Text>
            </View>
            <Switch value={gpsOn} onValueChange={toggleGPS} trackColor={{ false: '#334155', true: '#065f46' }} thumbColor={gpsOn ? C.success : '#64748B'} />
          </View>
        </View>

        {/* Stats */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
          {[
            { val: stops.length, label: 'Total Stops', color: C.darkText   },
            { val: completed,    label: 'Completed',   color: C.success     },
            { val: stops.length - completed, label: 'Remaining', color: '#F59E0B' },
          ].map((st, i) => (
            <View key={i} style={[s.darkCard, { flex: 1, alignItems: 'center', paddingVertical: 14 }]}>
              <Text style={{ fontSize: 26, fontWeight: '900', color: st.color }}>{st.val}</Text>
              <Text style={{ fontSize: 10, color: C.darkMuted, fontWeight: '600', marginTop: 2 }}>{st.label}</Text>
            </View>
          ))}
        </View>

        {/* Progress bar */}
        <View style={[s.darkCard, { padding: 14 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ color: C.darkText, fontWeight: '700', fontSize: 13 }}>Route Progress</Text>
            <Text style={{ color: C.success, fontWeight: '800', fontSize: 13 }}>{Math.round((completed / stops.length) * 100)}%</Text>
          </View>
          <View style={{ height: 8, backgroundColor: C.darkBorder, borderRadius: 4, overflow: 'hidden' }}>
            <View style={{ width: `${(completed / stops.length) * 100}%`, height: 8, backgroundColor: C.success, borderRadius: 4 }} />
          </View>
        </View>

        {/* Route stops */}
        <Text style={{ fontSize: 15, fontWeight: '800', color: C.darkText, marginBottom: 10, marginTop: 4 }}>📍 Today's Route</Text>
        <View style={s.darkCard}>
          {stops.map((stop, i) => {
            const isCurrent = !stop.completed && stops.slice(0, i).every(s => s.completed);
            return (
              <View key={stop.id} style={[{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 }, i < stops.length - 1 && { borderBottomWidth: 0.5, borderColor: C.darkBorder }]}>
                <View style={[s.stopDot, { backgroundColor: stop.completed ? C.success : isCurrent ? '#F59E0B' : C.darkBorder, borderWidth: isCurrent ? 2 : 0, borderColor: '#F59E0B' }]}>
                  {stop.completed ? <Text style={{ color: '#fff', fontSize: 12, fontWeight: '900' }}>✓</Text> : <Text style={{ color: isCurrent ? '#F59E0B' : C.darkMuted, fontSize: 11, fontWeight: '800' }}>{i + 1}</Text>}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: stop.completed ? '500' : '800', color: stop.completed ? C.darkMuted : C.darkText }}>{stop.name}</Text>
                  <Text style={{ fontSize: 11, color: C.darkMuted, marginTop: 2 }}>{stop.time}</Text>
                </View>
                {isCurrent && !stop.completed && (
                  <TouchableOpacity style={s.arrivedBtn} onPress={() => markArrived(stop.id, stop.name)} activeOpacity={0.85}>
                    <Text style={{ color: '#fff', fontSize: 12, fontWeight: '800' }}>Arrived ✓</Text>
                  </TouchableOpacity>
                )}
                {stop.completed && <Text style={{ fontSize: 20 }}>✅</Text>}
              </View>
            );
          })}
        </View>

        {/* Contact school */}
        <TouchableOpacity style={[s.darkCard, { flexDirection: 'row', alignItems: 'center', gap: 14 }]} onPress={callSchool} activeOpacity={0.85}>
          <Text style={{ fontSize: 28 }}>📞</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '800', color: C.darkText }}>Call School Office</Text>
            <Text style={{ fontSize: 12, color: C.darkMuted }}>Greenfield International School</Text>
          </View>
          <Text style={{ color: C.success, fontWeight: '700', fontSize: 13 }}>Call →</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const SupportScreen: React.FC = () => {
  const [message, setMessage] = useState('');
  return (
    <View style={{ flex: 1, backgroundColor: C.dark, padding: 18 }}>
      <StatusBar barStyle="light-content" />
      <View style={{ paddingTop: 52, marginBottom: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: '900', color: C.darkText }}>🎫 Support</Text>
        <Text style={{ fontSize: 12, color: C.darkMuted, marginTop: 4 }}>Report issues to school admin</Text>
      </View>
      {[
        { icon: '🚌', issue: 'Bus breakdown / mechanical issue', color: C.danger },
        { icon: '🗺️', issue: 'Route change request', color: C.warning },
        { icon: '👦', issue: 'Student pickup issue', color: C.brand },
        { icon: '⏰', issue: 'Running late — notify parents', color: '#F59E0B' },
      ].map((item, i) => (
        <TouchableOpacity key={i} style={[s.darkCard, { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 10 }]}
          onPress={() => Alert.alert('Report Sent', `Your report "${item.issue}" has been sent to school admin.`)} activeOpacity={0.85}>
          <Text style={{ fontSize: 26 }}>{item.icon}</Text>
          <Text style={{ flex: 1, fontSize: 13, fontWeight: '700', color: C.darkText }}>{item.issue}</Text>
          <Text style={{ color: item.color, fontWeight: '700' }}>Report →</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export const DriverNavigator: React.FC = () => (
  <Tab.Navigator screenOptions={{ headerShown: false,
    tabBarStyle: { backgroundColor: C.darkCard, borderTopWidth: 0.5, borderTopColor: C.darkBorder, height: 64, paddingBottom: 8, paddingTop: 6 },
    tabBarActiveTintColor: C.success, tabBarInactiveTintColor: C.darkMuted,
    tabBarLabelStyle: { fontSize: 10, fontWeight: '700' },
  }}>
    <Tab.Screen name="Route"   component={RouteScreen}   options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🗺️</Text>, tabBarLabel: 'My Route' }} />
    <Tab.Screen name="Support" component={SupportScreen} options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🎫</Text>, tabBarLabel: 'Support' }} />
  </Tab.Navigator>
);

const s = StyleSheet.create({
  darkCard: { backgroundColor: C.darkCard, borderRadius: 16, padding: 16, marginBottom: 12 },
  gpsDot: { width: 12, height: 12, borderRadius: 6 },
  stopDot: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  arrivedBtn: { backgroundColor: C.success, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
});
