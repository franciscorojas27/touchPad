import { z } from "zod";
import React, { useEffect, useState } from "react";
import { Modal, View, Text, TextInput, Button, StyleSheet } from "react-native";
type PropsServerIP = {
    visible: boolean
    onRequestClose: () => void
    handlerServerIp: (Ip: string) => void
    connectionError: string
}
export default function AddressModal({ visible, onRequestClose, handlerServerIp, connectionError }: PropsServerIP) {
    useEffect(() => {
        if (connectionError) {
            setError(connectionError)
        }
    }, [connectionError])

    const [inputValue, setInputValue] = useState("");
    const [error, setError] = useState('');
    const ipSchema = z.ipv4();
    const ipAddressValidation = (inputValue: string) => {
        const result = ipSchema.safeParse(inputValue);
        return result.success;
    }


    const handlerSave = () => {
        if (!ipAddressValidation(inputValue)) {
            setError('La dirección IP no es válida.');
            return;
        }
        setError('');
        const value = `ws://${inputValue}:8080`
        handlerServerIp(value)
    }

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onRequestClose}>
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={styles.modalText}>¡Bienvenido!</Text>
                    <Text style={styles.modalDescription}>Por favor, introduce tu ip del servidor aqui:</Text>

                    <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        autoCapitalize="none"
                        autoCorrect={false}
                        onChangeText={(text) => { setInputValue(text); if (error) setError(''); }}
                        value={inputValue}
                        placeholder="192.168.0.1"
                    />

                    <Button
                        title="Cerrar y guardar"
                        onPress={() => handlerSave()}
                    />
                    {error ? (
                        <Text style={styles.textError}>{error}</Text>
                    ) : connectionError ? (
                        <Text style={styles.textError}>{connectionError}</Text>
                    ) : null}
                </View>
            </View>
        </Modal>
    )
}
const styles = StyleSheet.create({
    text: {
        color: '#000000ff',
        fontSize: 20,
        fontWeight: 'bold',
        margin: 10,
    },
    textError: {
        color: '#ff0000ff',
        fontSize: 10,
        fontWeight: 'bold',
        margin: 10,
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo oscuro semitransparente
    },
    container: {
        flex: 1,
        cursor: 'pointer',
        backgroundColor: '#000000ff',
        alignItems: 'center',
        justifyContent: 'center',
    }, modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold',
    },
    modalDescription: {
        marginBottom: 10,
        textAlign: 'center',
    },
    input: {
        height: 40,
        margin: 12,
        borderWidth: 1,
        color: '#000000ff',
        padding: 10,
        width: 250,
        borderRadius: 5,
        borderColor: '#ccc',
    },
});
