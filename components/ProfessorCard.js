import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GlassmorphicView from './GlassmorphicView';
import colors from '../config/colors';

const ProfessorCard = ({ professor, onPress }) => {
    return (
        <GlassmorphicView style={styles.card} intensity={25}>
            <View style={styles.content}>
                <View style={styles.imageContainer}>
                    {professor.profilePicture ? (
                        <Image source={{ uri: professor.profilePicture }} style={styles.image} />
                    ) : (
                        <View style={styles.placeholderImage}>
                            <Ionicons name="person" size={40} color="rgba(255,255,255,0.3)" />
                        </View>
                    )}
                </View>

                <View style={styles.info}>
                    <Text style={styles.name}>{professor.name}</Text>
                    <Text style={styles.designation}>{professor.designation}</Text>

                    <View style={styles.detailRow}>
                        <Ionicons name="mail-outline" size={14} color={colors.secondary} />
                        <Text style={styles.detailText}>{professor.email}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Ionicons name="call-outline" size={14} color={colors.secondary} />
                        <Text style={styles.detailText}>{professor.phoneNumber}</Text>
                    </View>

                    <View style={styles.coursesContainer}>
                        {professor.courses.slice(0, 2).map((course, index) => (
                            <View key={index} style={styles.courseBadge}>
                                <Text style={styles.courseText}>{course}</Text>
                            </View>
                        ))}
                        {professor.courses.length > 2 && (
                            <Text style={styles.moreCourses}>+{professor.courses.length - 2} more</Text>
                        )}
                    </View>
                </View>
            </View>

            <TouchableOpacity style={styles.findButton} onPress={onPress}>
                <Text style={styles.findButtonText}>Find</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.white} />
            </TouchableOpacity>
        </GlassmorphicView>
    );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: 15,
        borderRadius: 20,
        overflow: 'hidden',
        padding: 15,
    },
    content: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    imageContainer: {
        width: 80,
        height: 80,
        borderRadius: 15,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    placeholderImage: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    info: {
        flex: 1,
        marginLeft: 15,
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.white,
    },
    designation: {
        fontSize: 14,
        color: colors.secondary,
        marginBottom: 8,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    detailText: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
        marginLeft: 6,
    },
    coursesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
        alignItems: 'center',
    },
    courseBadge: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 5,
        marginRight: 5,
        marginBottom: 5,
    },
    courseText: {
        fontSize: 10,
        color: colors.white,
    },
    moreCourses: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.5)',
        marginBottom: 5,
    },
    findButton: {
        backgroundColor: colors.primary,
        flexDirection: 'row',
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    findButtonText: {
        color: colors.white,
        fontWeight: 'bold',
        marginRight: 5,
    }
});

export default ProfessorCard;
