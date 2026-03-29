import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { CameraView as ExpoCamera } from 'expo-camera';

export default function CameraView({ onPictureTaken, onCancel }) {
    const [facing, setFacing] = useState('back');
    const cameraRef = useRef(null);

    const takePicture = async () => {
        if (cameraRef.current) {
            const options = { quality: 0.8, base64: true };
            const data = await cameraRef.current.takePictureAsync(options);
            onPictureTaken(data.uri); // Send back URI to parent
        }
    };

    return (
        <View style={styles.container}>
            <ExpoCamera style={styles.camera} facing={facing} ref={cameraRef}>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                        <Text style={styles.text}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                        <View style={styles.captureInner} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.flipButton} 
                        onPress={() => {
                            setFacing(facing === 'back' ? 'front' : 'back');
                        }}>
                        <Text style={styles.text}>Flip</Text>
                    </TouchableOpacity>
                </View>
            </ExpoCamera>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
    },
    camera: {
        flex: 1,
    },
    buttonContainer: {
        flex: 1,
        backgroundColor: 'transparent',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        paddingBottom: 30,
    },
    captureButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(255,255,255,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    captureInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#fff',
    },
    cancelButton: {
        marginBottom: 20,
        padding: 10,
    },
    flipButton: {
        marginBottom: 20,
        padding: 10,
    },
    text: {
        fontSize: 18,
        color: 'white',
        fontWeight: 'bold',
    },
});
