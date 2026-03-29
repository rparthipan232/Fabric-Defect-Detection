import axios from 'axios';
import { Platform } from 'react-native';

// Dynamically determine the API base URL based on the platform
// - Web: Uses localhost
// - Android Emulator: Uses 10.0.2.2
// - Physical Device: NEEDS TO BE YOUR MACHINE'S LOCAL IP (e.g., http://192.168.1.100:8000)
const API_BASE_URL = Platform.OS === 'web' 
    ? 'http://localhost:8000' 
    : 'http://192.168.1.5:8000';  // Updated to your actual Wi-Fi IP address!

export const uploadImageForDetection = async (imageUri) => {
    try {
        const formData = new FormData();
        
        let filename = imageUri.split('/').pop() || 'uploaded_image.jpg';
        
        // If imageUri is a base64 data string (common on Web), the filename parsing above extracts the huge base64 string
        if (imageUri.startsWith('data:')) {
            filename = 'capture.jpg';
        }
        
        // Infer the type of the image
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        // IMPORTANT: Web and Mobile handle form data objects differently.
        if (Platform.OS === 'web') {
            // Fetch the image to get a browser-compatible Blob
            const response = await fetch(imageUri);
            const blob = await response.blob();
            formData.append('file', blob, filename);
        } else {
            // For mobile
            formData.append('file', {
                uri: imageUri,
                name: filename,
                type: type,
            });
        }

        const response = await axios.post(`${API_BASE_URL}/predict`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    } catch (error) {
        console.error("API Error: ", error);
        throw error;
    }
};
