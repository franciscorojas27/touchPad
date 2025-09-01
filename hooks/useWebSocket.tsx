import { useState, useEffect, useRef } from 'react';

export default function useWebSocket() {
    const [ipAddress, setIpAddress] = useState<string>();
    const [connectionError, setConnectionError] = useState<string>('');
    const ws = useRef<WebSocket | null>(null);

    useEffect(() => {
        if (!ipAddress) return;

        ws.current = new WebSocket(`${ipAddress}`);
        ws.current.onerror = (e) => {
            setConnectionError('Error de conexión. Intenta otra IP.');
            setIpAddress('');
        };
        ws.current.onopen = () => {
            setConnectionError('');
        };

        return () => ws.current?.close();
    }, [ipAddress]);
    const sendMessage = (message: string) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(message);
        } else {
            console.error("No se pudo enviar el mensaje. Conexión no abierta.");
        }
    };
    return { ipAddress, setIpAddress, sendMessage, connectionError };
};