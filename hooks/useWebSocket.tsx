import { useState, useEffect, useRef } from 'react';

export default function useWebSocket() {
    const [ipAddress, _setIpAddress] = useState<string>();
    const [connectionError, setConnectionError] = useState<string>('');
    const [attempt, setAttempt] = useState(0);
    const ws = useRef<WebSocket | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const pingTimer = useRef<ReturnType<typeof setInterval> | null>(null);
    const connectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hasOpenedRef = useRef(false);

    const setIpAddress = (next: string) => {
        // Limpia el error para que si vuelve a fallar con el mismo mensaje, React vuelva a notificar el cambio
        setConnectionError('');
        _setIpAddress(next);
        setAttempt(a => a + 1);
    };

    useEffect(() => {
        if (!ipAddress) return;
        if (pingTimer.current) { clearInterval(pingTimer.current); pingTimer.current = null; }
        if (connectTimer.current) { clearTimeout(connectTimer.current); connectTimer.current = null; }
        if (ws.current) { try { ws.current.close(); } catch {} ws.current = null; }
        hasOpenedRef.current = false;
    const socket = new WebSocket(`${ipAddress}`);
        ws.current = socket;

        socket.onerror = () => {
            setConnectionError('Error de conexión. Intenta otra IP.');
            _setIpAddress('');
        };
        socket.onopen = () => {
            hasOpenedRef.current = true;
            setIsOpen(true);
            setConnectionError('');
            if (connectTimer.current) { clearTimeout(connectTimer.current); connectTimer.current = null; }
            // keep-alive cada 25s
            if (pingTimer.current) clearInterval(pingTimer.current);
            pingTimer.current = setInterval(() => {
                try {
                    if (ws.current?.readyState === WebSocket.OPEN) {
                        ws.current.send('ping');
                    }
                } catch {}
            }, 25000);
        };
        socket.onclose = () => {
            setIsOpen(false);
            if (pingTimer.current) { clearInterval(pingTimer.current); pingTimer.current = null; }
            if (!hasOpenedRef.current) {
                setConnectionError('No se pudo conectar. Revisa la IP/servidor.');
                _setIpAddress('');
            } else {
                setConnectionError('La conexión se cerró. Revisa la IP/servidor.');
            }
        };

        connectTimer.current = setTimeout(() => {
            if (!hasOpenedRef.current) {
                try { socket.close(); } catch {}
                setConnectionError('Tiempo de espera agotado al conectar.');
                _setIpAddress('');
            }
        }, 7000);

        return () => {
            if (pingTimer.current) { clearInterval(pingTimer.current); pingTimer.current = null; }
            if (connectTimer.current) { clearTimeout(connectTimer.current); connectTimer.current = null; }
            try { socket.close(); } catch {}
        };
    }, [ipAddress, attempt]);

    const sendMessage = (message: string) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            try {
                ws.current.send(message);
            } catch (e) {
                console.error('Error enviando WS:', e);
            }
        } else {
            console.warn('WS no abierto. Estado:', ws.current?.readyState);
        }
    };
    return { ipAddress, setIpAddress, sendMessage, connectionError, isOpen };
};