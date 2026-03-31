import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';

export default function ResultScreen({ route }) {
    const { resultData, originalImage } = route.params;

    // Fast API returns base64 image or null
    const resultImageBase64 = resultData.result_image_base64;
    const isHistory = resultData.isHistory;
    const defects = resultData.defects || [];
    const hasDefects = defects.length > 0;

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{isHistory ? 'Scan Session Summary' : 'Detection Result'}</Text>
            </View>

            <View style={styles.statusBox}>
                {hasDefects ? (
                    <Text style={styles.errorText}>⚠️ {defects.length} Defects Found</Text>
                ) : (
                    <Text style={styles.successText}>✅ No Defect Detected</Text>
                )}
            </View>

            {!isHistory && originalImage && (
                <View style={styles.imagesContainer}>
                    <View style={styles.imageBox}>
                        <Text style={styles.imageLabel}>Original uploaded:</Text>
                        <Image source={{ uri: originalImage }} style={styles.image} />
                    </View>

                    {resultImageBase64 && (
                        <View style={styles.imageBox}>
                            <Text style={styles.imageLabel}>Analysis result:</Text>
                            <Image source={{ uri: resultImageBase64 }} style={styles.image} />
                        </View>
                    )}
                </View>
            )}

            <View style={styles.defectsList}>
                <Text style={styles.listTitle}>{isHistory ? 'Complete History Log:' : 'Defects Summary:'}</Text>
                {defects.length > 0 ? (
                    defects.map((defect, index) => (
                        <View key={index} style={styles.defectItem}>
                            <View>
                                <Text style={styles.defectName}>{defect.name}</Text>
                                {isHistory && <Text style={styles.defectTime}>{defect.time}</Text>}
                            </View>
                            <Text style={styles.defectConf}>{(defect.confidence * 100).toFixed(0)}%</Text>
                        </View>
                    ))
                ) : (
                    <Text style={styles.emptyText}>Nothing to show.</Text>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#F5F7FA',
        padding: 20,
        paddingBottom: 40,
    },
    header: {
        marginTop: 10,
        marginBottom: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#2D3748',
    },
    statusBox: {
        width: '100%',
        paddingVertical: 18,
        paddingHorizontal: 10,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    errorText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#E53E3E', // Red for defect
    },
    successText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#38A169', // Green for no defect
    },
    imagesContainer: {
        width: '100%',
        marginBottom: 20,
    },
    imageBox: {
        marginBottom: 24,
    },
    imageLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4A5568',
        marginBottom: 8,
    },
    image: {
        width: '100%',
        height: 250,
        resizeMode: 'contain',
        backgroundColor: '#E2E8F0',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#CBD5E0',
    },
    defectsList: {
        backgroundColor: '#FFF5F5',
        borderRadius: 12,
        padding: 16,
        width: '100%',
        borderWidth: 1,
        borderColor: '#FEB2B2',
    },
    listTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#E53E3E',
    },
    defectItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#FED7D7',
    },
    defectName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#C53030',
        textTransform: 'capitalize',
    },
    defectTime: {
        fontSize: 12,
        color: '#718096',
        marginTop: 2,
    },
    emptyText: {
        textAlign: 'center',
        padding: 20,
        color: '#A0AEC0',
    }
});
