import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Share } from 'react-native';

export default function HistoryScreen({ route, navigation }) {
    const { sessionHistory } = route.params;

    const shareResults = async () => {
        const text = sessionHistory.map(d => `- ${d.name} at ${d.time}`).join('\n');
        try {
            await Share.share({
                message: `Fabric Defect Report:\nTotal Defects: ${sessionHistory.length}\n\n${text}`,
            });
        } catch (error) {
            console.error(error.message);
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.defectCard}>
            <View style={styles.defectHeader}>
                <Text style={styles.defectName}>{item.name.toUpperCase()}</Text>
                <Text style={styles.defectTime}>{item.time}</Text>
            </View>
            <View style={styles.confidenceBarContainer}>
                <View style={[styles.confidenceBar, { width: `${item.confidence * 100}%` }]} />
                <Text style={styles.confidenceText}>Confidence: {(item.confidence * 100).toFixed(0)}%</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.headerBar}>
                <Text style={styles.headerTitle}>Detection History</Text>
                <Text style={styles.headerSubtitle}>{sessionHistory.length} items logged</Text>
            </View>

            <FlatList
                data={sessionHistory}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={<Text style={styles.emptyText}>No defects captured in this session.</Text>}
            />

            <View style={styles.footer}>
                <TouchableOpacity style={styles.shareButton} onPress={shareResults}>
                    <Text style={styles.buttonText}>📤 Export Report</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.homeButton} onPress={() => navigation.navigate('Home')}>
                    <Text style={styles.buttonText}>🏠 Return Home</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    headerBar: {
        backgroundColor: '#4C6EF5',
        padding: 24,
        paddingTop: 30,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        elevation: 10,
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: 'bold',
    },
    headerSubtitle: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        marginTop: 4,
    },
    listContent: {
        padding: 16,
    },
    historyTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#64748B',
        marginBottom: 12,
        textTransform: 'uppercase',
    },
    defectCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#F44336',
        elevation: 2,
    },
    defectHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    defectName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    defectTime: {
        fontSize: 12,
        color: '#64748B',
    },
    confidenceBarContainer: {
        height: 16,
        backgroundColor: '#F1F5F9',
        borderRadius: 8,
        overflow: 'hidden',
        justifyContent: 'center',
    },
    confidenceBar: {
        height: '100%',
        backgroundColor: 'rgba(244, 67, 54, 0.2)',
        position: 'absolute',
    },
    confidenceText: {
        fontSize: 10,
        color: '#1E293B',
        marginLeft: 8,
    },
    footer: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
    },
    shareButton: {
        flex: 1,
        backgroundColor: '#10B981',
        paddingVertical: 14,
        borderRadius: 12,
        marginRight: 8,
        alignItems: 'center',
    },
    homeButton: {
        flex: 1,
        backgroundColor: '#4C6EF5',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    }
});
