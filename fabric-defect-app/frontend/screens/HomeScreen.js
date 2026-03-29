import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useCameraPermissions } from 'expo-camera';
import UploadButton from '../components/UploadButton';
import CustomCameraView from '../components/CameraView';
import { uploadImageForDetection } from '../services/api';

export default function HomeScreen({ navigation }) {
    const [imageUri, setImageUri] = useState(null);
    const [isCameraVisible, setIsCameraVisible] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();
    const [loading, setLoading] = useState(false);

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

    const requestCameraAndShow = async () => {
        if (!permission?.granted) {
            const result = await requestPermission();
            if (!result.granted) {
                Alert.alert("Permission Required", "Camera access is needed to take a picture.");
                return;
            }
        }
        setIsCameraVisible(true);
    };

    const handlePictureTaken = (uri) => {
        setImageUri(uri);
        setIsCameraVisible(false);
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
            Alert.alert("Error", "Failed to connect to the detection server.");
            console.error(error);
        }
    };

    if (isCameraVisible) {
        return <CustomCameraView onPictureTaken={handlePictureTaken} onCancel={() => setIsCameraVisible(false)} />;
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Fabric Defect Detection</Text>
                <Text style={styles.subtitle}>Upload or capture an image of fabric</Text>
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
                    title="📸 Capture Image" 
                    onPress={requestCameraAndShow} 
                    style={styles.button}
                />
                
                <UploadButton 
                    title="📂 Choose from Gallery" 
                    onPress={pickImage} 
                    style={styles.button}
                />

                <UploadButton 
                    title="🔍 Detect Defects" 
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
        height: 300,
        backgroundColor: '#E2E8F0',
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 5,
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
    button: {
        backgroundColor: '#CBD5E0',
        marginBottom: 10,
    },
    detectBtn: {
        backgroundColor: '#4C6EF5',
        marginTop: 20,
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
