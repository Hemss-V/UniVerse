import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, FlatList, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import SpaceBackground from '../components/SpaceBackground';
import GlassmorphicView from '../components/GlassmorphicView';
import ProfessorCard from '../components/ProfessorCard';
import colors from '../config/colors';

// Firestore imports
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';

const DUMMY_PROFESSORS = [
    {
        name: "Dr. Alan Turing",
        designation: "Professor of Computer Science",
        email: "turing@college.edu",
        phoneNumber: "+1 234 567 890",
        courses: ["Artificial Intelligence", "Theory of Computation", "Cryptography"],
        department: "Computer Science",
        officeLocation: "Enigma Hall, Room 101"
    },
    {
        name: "Dr. Grace Hopper",
        designation: "Associate Professor",
        email: "hopper@college.edu",
        phoneNumber: "+1 987 654 321",
        courses: ["Compiler Design", "COBOL Programming"],
        department: "Software Engineering",
        officeLocation: "Navy Plaza, Room 303"
    },
    {
        name: "Prof. Richard Feynman",
        designation: "Head of Physics Dept",
        email: "feynman@college.edu",
        phoneNumber: "+1 555 012 345",
        courses: ["Quantum Mechanics", "Electromagnetism"],
        department: "Physics",
        officeLocation: "Caltech Tower, Level 5"
    }
];

export default function FindProfessorScreen({ navigation }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [professors, setProfessors] = useState([]);
    const [filteredProfessors, setFilteredProfessors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfessors();
    }, []);

    const fetchProfessors = async () => {
        try {
            setLoading(true);
            const querySnapshot = await getDocs(collection(db, 'professors'));
            const profList = [];
            querySnapshot.forEach((doc) => {
                profList.push({ id: doc.id, ...doc.data() });
            });
            setProfessors(profList);
            setFilteredProfessors(profList);
        } catch (error) {
            console.error("Error fetching professors: ", error);
            Alert.alert("Error", "Could not load professors list.");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (text) => {
        setSearchQuery(text);
        if (text === '') {
            setFilteredProfessors(professors);
        } else {
            const filtered = professors.filter(prof =>
                prof.name.toLowerCase().includes(text.toLowerCase()) ||
                prof.courses.some(course => course.toLowerCase().includes(text.toLowerCase())) ||
                prof.department.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredProfessors(filtered);
        }
    };

    const seedData = async () => {
        try {
            setLoading(true);
            for (const prof of DUMMY_PROFESSORS) {
                await addDoc(collection(db, 'professors'), prof);
            }
            Alert.alert("Success", "Sample data added successfully!");
            fetchProfessors();
        } catch (error) {
            console.error("Error seeding data: ", error);
            Alert.alert("Error", "Could not seed data.");
        } finally {
            setLoading(false);
        }
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.headerTop}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Find Professor</Text>
            </View>

            <GlassmorphicView style={styles.searchContainer} intensity={20}>
                <Ionicons name="search" size={20} color="rgba(255,255,255,0.5)" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search by name, course or department..."
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    value={searchQuery}
                    onChangeText={handleSearch}
                    autoCapitalize="none"
                />
                {searchQuery !== '' && (
                    <TouchableOpacity onPress={() => handleSearch('')}>
                        <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.5)" />
                    </TouchableOpacity>
                )}
            </GlassmorphicView>
        </View>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            {loading ? (
                <ActivityIndicator size="large" color={colors.primary} />
            ) : (
                <>
                    <Ionicons name="search-outline" size={60} color="rgba(255,255,255,0.1)" />
                    <Text style={styles.emptyText}>No professors found</Text>
                    {professors.length === 0 && (
                        <TouchableOpacity style={styles.seedButton} onPress={seedData}>
                            <Text style={styles.seedButtonText}>Seed Sample Data</Text>
                        </TouchableOpacity>
                    )}
                </>
            )}
        </View>
    );

    return (
        <SpaceBackground>
            <SafeAreaView style={styles.container}>
                {renderHeader()}

                <FlatList
                    data={filteredProfessors}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <ProfessorCard
                            professor={item}
                            onPress={() => Alert.alert("Professor Info", `${item.name}\nLocation: ${item.officeLocation}`)}
                        />
                    )}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={renderEmpty}
                    showsVerticalScrollIndicator={false}
                />
            </SafeAreaView>
        </SpaceBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        padding: 20,
        backgroundColor: 'rgba(255,255,255,0.03)',
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    backButton: { marginRight: 15 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: colors.white },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        height: 50,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    searchIcon: { marginRight: 10 },
    searchInput: {
        flex: 1,
        color: colors.white,
        fontSize: 14,
    },
    listContent: {
        padding: 20,
        paddingTop: 10,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
    },
    emptyText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 16,
        marginTop: 10,
    },
    seedButton: {
        marginTop: 20,
        padding: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    seedButtonText: {
        color: colors.white,
        fontSize: 14,
    }
});
