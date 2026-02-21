import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ColourLegend() {
    const legendData = [
        { label: 'High', value: '0.75 - 1.0', color: '#FF0000' },
        { label: 'Medium', value: '0.45 - 0.74', color: '#FFA500' },
        { label: 'Low', value: '0.0 - 0.44', color: '#FFFF00' },
    ];

    return (
        <View style = {colourStyles.legendContainer}>
            <Text style={colourStyles.title}>Color Legend</Text>
            {legendData.map((item, index) => (
                <View key={index} style={colourStyles.legendRow}>
                    {/* 1. Color First*/}
                    <View style = {[colourStyles.colorSquare, { backgroundColor: item.color }]} />

                    {/*2. Bump Severity Label Text to the Right */}
                    <Text style={colourStyles.legendText}>
                        {item.label} ({item.value})
                    </Text>
                </View>
            ))}
        </View>
    );
}

const colourStyles = StyleSheet.create({
    legendContainer: {
        position: 'absolute',
        top: 50,
        left: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.2)',
        zIndex: 1000,
        elevation: 5,
        minWidth: 150,
    },
    title: {
        color: '#131111',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
        textTransform: 'uppercase',
    },
    legendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    colorSquare: {
        width: 14,
        height: 14,
        borderRadius: 3,
        marginRight: 10,
    },
    legendText: {
        color: '#1a1a1a',
        fontSize: 13,
        fontWeight: '600',
        lineHeight: 16,
    },
});
