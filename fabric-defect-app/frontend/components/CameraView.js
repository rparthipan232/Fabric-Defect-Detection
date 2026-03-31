import React, { useState, useRef, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { CameraView as ExpoCamera } from 'expo-camera';

export default function CameraView({ onPictureTaken, onCancel, isLiveScan, onAutoFrame, lastResult }) {
    const [facing, setFacing] = useState('back');
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [scanStatus, setScanStatus] = useState('Waiting for camera...');
    const [frameCount, setFrameCount] = useState(0);
    const cameraRef = useRef(null);
    const isProcessing = useRef(false);
    const intervalRef = useRef(null);

    const takePicture = async () => {
        if (cameraRef.current && isCameraReady) {
            try {
                const data = await cameraRef.current.takePictureAsync({ quality: 0.8 });
                onPictureTaken(data.uri);
            } catch (e) {
                console.log("Capture error:", e);
            }
        }
    };

    const handleCameraReady = useCallback(() => {
        setIsCameraReady(true);
        setScanStatus('Scanning...');
    }, []);

    useEffect(() => {
        if (!isLiveScan || !onAutoFrame || !isCameraReady) return;

        intervalRef.current = setInterval(async () => {
            if (isProcessing.current || !cameraRef.current) return;

            isProcessing.current = true;
            try {
                const data = await cameraRef.current.takePictureAsync({ 
                    quality: 0.3, // Better for AI vision
                    base64: false, 
                    skipProcessing: true 
                });
                setFrameCount(prev => prev + 1);
                await onAutoFrame(data.uri);
            } catch (e) {
                console.log("Scan error:", e.message);
            } finally {
                isProcessing.current = false;
            }
        }, 1000); // 1-second interval for perfect stability on WiFi

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isLiveScan, onAutoFrame, isCameraReady]);

    const renderDetectionBoxes = () => {
        if (!lastResult?.defects) return null;

        return lastResult.defects.map((defect, index) => {
            if (!defect.box) return null;
            
            const [x1, y1, x2, y2] = defect.box;
            // Map normalized coordinates (0-1) to percentage-based layouts
            return (
                <View 
                    key={index} 
                    style={[
                        styles.detectionBox, 
                        {
                            left: `${x1 * 100}%`,
                            top: `${y1 * 100}%`,
                            width: `${(x2 - x1) * 100}%`,
                            height: `${(y2 - y1) * 100}%`,
                        }
                    ]}
                >
                    <View style={styles.labelContainer}>
                        <Text style={styles.labelText}>{defect.name} ({defect.confidence})</Text>
                    </View>
                </View>
            );
        });
    };

    return (
        <View style={styles.container}>
            <ExpoCamera
                style={styles.camera}
                facing={facing}
                ref={cameraRef}
                onCameraReady={handleCameraReady}
                ratio="16:9"
            />
            
            {/* Overlay UI elements (Siblings to Camera for fixed positioning) */}
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
                {isLiveScan && renderDetectionBoxes()}
            </View>

            {isLiveScan && (
                <View style={styles.statusBar}>
                    <View style={styles.statusPill}>
                        <View style={[styles.pulseCircle, lastResult?.has_defects && styles.defectCircle]} />
                        <Text style={styles.statusText}>
                            {lastResult?.has_defects ? '⚠️ DEFECT DETECTED' : '✅ SECURE'}
                        </Text>
                    </View>
                    <Text style={styles.frameText}>Scan #{frameCount}</Text>
                </View>
            )}

            <View style={[styles.buttonContainer, isLiveScan && styles.liveScanContainer]}>
                <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                    <Text style={styles.buttonText}>{isLiveScan ? '⏹ STOP SCAN' : '✕ EXIT'}</Text>
                </TouchableOpacity>

                {!isLiveScan && (
                    <TouchableOpacity
                        style={[styles.captureButton, !isCameraReady && styles.disabledCapture]}
                        onPress={takePicture}
                        disabled={!isCameraReady}
                    >
                        <View style={styles.captureInner} />
                    </TouchableOpacity>
                )}

                {!isLiveScan && (
                    <TouchableOpacity
                        style={styles.flipButton}
                        onPress={() => setFacing(f => f === 'back' ? 'front' : 'back')}
                    >
                        <Text style={styles.buttonText}>🔄 FLIP</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, width: '100%' },
    camera: { flex: 1 },
    detectionBox: {
        position: 'absolute',
        borderWidth: 2,
        borderColor: '#FF0000',
        borderRadius: 4,
        zIndex: 10,
    },
    labelContainer: {
        position: 'absolute',
        top: -22,
        left: -2,
        backgroundColor: '#FF0000',
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
    },
    labelText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    statusBar: {
        position: 'absolute',
        top: 40,
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 20,
    },
    statusPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
    },
    pulseCircle: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#4CAF50',
        marginRight: 8,
    },
    defectCircle: {
        backgroundColor: '#F44336',
    },
    statusText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    frameText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
    },
    buttonContainer: {
        flex: 1,
        backgroundColor: 'transparent',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        paddingBottom: 40,
    },
    liveScanContainer: {
        justifyContent: 'center',
    },
    captureButton: {
        width: 70, height: 70, borderRadius: 35,
        backgroundColor: 'rgba(255,255,255,0.5)',
        alignItems: 'center', justifyContent: 'center',
    },
    disabledCapture: { opacity: 0.4 },
    captureInner: {
        width: 60, height: 60, borderRadius: 30, backgroundColor: '#fff',
    },
    cancelButton: {
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingVertical: 12, paddingHorizontal: 24,
        borderRadius: 30,
    },
    flipButton: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingVertical: 10, paddingHorizontal: 18,
        borderRadius: 20,
    },
    buttonText: {
        fontSize: 16, color: 'white', fontWeight: 'bold',
        letterSpacing: 1,
    },
});
