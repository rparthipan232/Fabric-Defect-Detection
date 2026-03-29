import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const UploadButton = ({ title, onPress, disabled, style }) => {
    return (
        <TouchableOpacity 
            style={[styles.button, style, disabled && styles.disabled]} 
            onPress={onPress}
            disabled={disabled}
        >
            <Text style={styles.text}>{title}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#4C6EF5',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    disabled: {
        backgroundColor: '#A0AEC0',
    },
    text: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    }
});

export default UploadButton;
