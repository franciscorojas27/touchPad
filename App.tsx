import { StatusBar } from 'expo-status-bar';
import { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, PanResponder, GestureResponderEvent, Button } from 'react-native';
import AddressModal from './components/modals/AddressModal';
import useWebSocket from './hooks/useWebSocket';

export default function App() {
  const [modalVisible, setModalVisible] = useState(false);
  const { ipAddress, setIpAddress, sendMessage, connectionError, isOpen } = useWebSocket();

  useEffect(() => {
    if (!ipAddress) setModalVisible(true);
    else if (connectionError) setModalVisible(true);
    else if (isOpen) setModalVisible(false);
  }, [ipAddress, connectionError, isOpen]);

  const handleServerIp = (Ip: string) => { setIpAddress(Ip); setModalVisible(false); };
  const handleCloseModal = () => setModalVisible(false);

  const lastPos = useRef<[number, number] | null>(null);
  const buffer = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });
  const deadzone = 1;
  const frameInterval = 1000 / 60; // 60FPS
  const lastSent = useRef<number>(0);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt: GestureResponderEvent) => {
      const { pageX, pageY } = evt.nativeEvent;
      lastPos.current = [pageX, pageY];
    },
    onPanResponderMove: (evt: GestureResponderEvent) => {
      const { pageX, pageY } = evt.nativeEvent;
      if (!lastPos.current) return;

      let dx = pageX - lastPos.current[0];
      let dy = pageY - lastPos.current[1];

      // Ignora micro-movimientos
      if (Math.abs(dx) < deadzone && Math.abs(dy) < deadzone) return;

      buffer.current.dx += dx;
      buffer.current.dy += dy;
      lastPos.current = [pageX, pageY];

      const now = Date.now();
      if (now - lastSent.current >= frameInterval) {
        // Envía el movimiento acumulado
        sendMessage(`move,${buffer.current.dx},${buffer.current.dy}`);
        buffer.current.dx = 0;
        buffer.current.dy = 0;
        lastSent.current = now;
      }
    },
    onPanResponderRelease: () => { lastPos.current = null; buffer.current = { dx: 0, dy: 0 }; },
    onPanResponderTerminate: () => { lastPos.current = null; buffer.current = { dx: 0, dy: 0 }; },
  });

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }}
        {...panResponder.panHandlers}>
        <AddressModal
          visible={modalVisible}
          onRequestClose={handleCloseModal}
          handlerServerIp={handleServerIp}
          connectionError={connectionError}
        />
      </View>
      <View style={styles.bottomButtons}>
        <Button onPress={() => sendMessage(`click,left`)} title="Click" color="#1e90ff" />
        <Button onPress={() => sendMessage(`key,Left`)} title="    ←      " color="#1e90ff" />
        <Button onPress={() => sendMessage(`key,Right`)} title="    →      " color="#1e90ff" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  bottomButtons: {
    position: 'absolute', bottom: 30, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16,
  },
});
