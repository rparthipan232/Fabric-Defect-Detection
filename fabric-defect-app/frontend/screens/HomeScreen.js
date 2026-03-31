import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import UploadButton from '../components/UploadButton';
import CustomCameraView from '../components/CameraView';
import { uploadImageForDetection, liveScanFrame } from '../services/api';

export default function HomeScreen({ navigation }) {
    const [imageUri, setImageUri] = useState(null);
    const [isCameraVisible, setIsCameraVisible] = useState(false);
    const [isLiveScan, setIsLiveScan] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();
    const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();
    const [loading, setLoading] = useState(false);
    const [liveScanResult, setLiveScanResult] = useState(null);
    const [sessionHistory, setSessionHistory] = useState([]);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    const requestCamera = async (live = false) => {
        if (!permission?.granted) {
            const result = await requestPermission();
            if (!result.granted) {
                Alert.alert("Permission Required", "Camera access is needed.");
                return;
            }
        }
        
        if (live && !mediaPermission?.granted) {
            const result = await requestMediaPermission();
            if (!result.granted) {
                Alert.alert("Permission Required", "Storage access is needed to save detected defects.");
                return;
            }
        }

        setIsLiveScan(live);
        setLiveScanResult(null);
        setSessionHistory([]); // Clear history for new session
        setIsCameraVisible(true);
    };

    const stopLiveScan = () => {
        setIsCameraVisible(false);
        setIsLiveScan(false);
        
        // Always go to the detections history page to see what was captured
        navigation.navigate('Detections', { 
            sessionHistory: sessionHistory
        });
    };

    const handlePictureTaken = (uri) => {
        setImageUri(uri);
        setIsCameraVisible(false);
    };

    const handleAutoFrame = async (uri) => {
        try {
            const responseData = await liveScanFrame(uri);
            if (responseData.success) {
                setLiveScanResult(responseData);
                
                if (responseData.has_defects) {
                    // Record detections with timestamps for the final list
                    const timestamp = new Date().toLocaleTimeString();
                    const newDetections = responseData.defects.map(d => ({
                        ...d,
                        time: timestamp,
                        id: Math.random().toString(36).substr(2, 9)
                    }));
                    
                    setSessionHistory(prev => [...newDetections, ...prev]);
                    console.log(`Defect Found: ${responseData.defects[0].name}`);
                }
            }
        } catch (error) {
            console.error("Auto scan API error:", error);
        }
    };

    const handleDetect = async () => {
        if (!imageUri) {
            Alert.alert("No Image", "Please select or capture an image first.");
            return;
        }

        setLoading(true);
        try {
            const responseData = await uploadImageForDetection(imageUri);
            setLoading(false);
            
            navigation.navigate('Result', { 
                resultData: responseData, 
                originalImage: imageUri 
            });

        } catch (error) {
            setLoading(false);
            Alert.alert("Error", "Failed to connect to the server.");
        }
    };

    if (isCameraVisible) {
        return (
            <CustomCameraView 
                onPictureTaken={handlePictureTaken} 
                isLiveScan={isLiveScan}
                onAutoFrame={handleAutoFrame}
                onCancel={isLiveScan ? stopLiveScan : () => setIsCameraVisible(false)}
                lastResult={liveScanResult}
            />
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Fabric Defect Detection</Text>
                <Text style={styles.subtitle}>AI-Powered Fabric Quality Control</Text>
            </View>

            <View style={styles.imageContainer}>
                {imageUri ? (
                    <Image source={{ uri: imageUri }} style={styles.image} />
                ) : (
                    <View style={styles.placeholder}>
                        <Text style={styles.placeholderText}>No image selected</Text>
                    </View>
                )}
            </View>

            <View style={styles.controls}>
                <UploadButton 
                    title="🔴 Start Live Scanning" 
                    onPress={() => requestCamera(true)} 
                    style={styles.liveBtn}
                />

                <UploadButton 
                    title="📸 Single Capture" 
                    onPress={() => requestCamera(false)} 
                    style={styles.button}
                />
                
                <UploadButton 
                    title="📂 Choose from Gallery" 
                    onPress={pickImage} 
                    style={styles.button}
                />

                <UploadButton 
                    title="🔍 Analyze Current Image" 
                    onPress={handleDetect} 
                    disabled={!imageUri || loading}
                    style={[styles.detectBtn, (!imageUri || loading) && styles.disabledBtn]}
                />
            </View>

            {loading && (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#4C6EF5" />
                    <Text style={styles.loaderText}>Analyzing Fabric...</Text>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#F5F7FA',
        alignItems: 'center',
        padding: 20,
    },
    header: {
        marginTop: 40,
        marginBottom: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2D3748',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#718096',
    },
    imageContainer: {
        width: '100%',
        height: 250,
        backgroundColor: '#E2E8F0',
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    placeholder: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    placeholderText: {
        color: '#A0AEC0',
        fontSize: 16,
    },
    controls: {
        width: '100%',
    },
    liveBtn: {
        backgroundColor: '#E53E3E',
        marginBottom: 10,
    },
    button: {
        backgroundColor: '#CBD5E0',
        marginBottom: 10,
    },
    detectBtn: {
        backgroundColor: '#4C6EF5',
        marginTop: 10,
        paddingVertical: 18,
    },
    disabledBtn: {
        backgroundColor: '#A0AEC0',
    },
    loaderContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255,255,255,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    loaderText: {
        marginTop: 12,
        fontSize: 18,
        fontWeight: '600',
        color: '#4C6EF5',
    }
});
