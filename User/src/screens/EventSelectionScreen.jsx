// Event selection screen - Choose between ongoing events/hunts
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { getEvents } from '../services/eventService';

const fallbackEvents = [
    { id: 1, name: 'Tatooine Hunt', details: '5 Characters', isActive: true },
    { id: 2, name: 'Death Star Pursuit', details: '8 Characters', isActive: true },
    { id: 3, name: 'Endor Chase', details: '12 Characters', isActive: true },
];

const EventSelectionScreen = ({ onSelectEvent, onBack }) => {
    const [events, setEvents] = useState(fallbackEvents);
    const [loading, setLoading] = useState(true);
    const [infoMessage, setInfoMessage] = useState('');

    useEffect(() => {
        let mounted = true;

        async function loadEvents() {
            try {
                setLoading(true);
                const remoteEvents = await getEvents();
                const activeEvents = (remoteEvents || []).filter((event) => event?.isActive !== false && event?.active !== false);
                
                if (!mounted) {
                    return;
                }

                            if (Array.isArray(activeEvents) && activeEvents.length > 0) {
                                // sort events by date if available
                                const eventsWithDate = activeEvents.map(e => ({ ...e, eventDate: e.eventDate || null }));
                                setEvents(eventsWithDate);
                                setInfoMessage('');
                            } else {
                    setEvents(fallbackEvents);
                    setInfoMessage('Inga events från Firestore ännu, visar standardlista.');
                }
            } catch (error) {
                if (!mounted) {
                    return;
                }

                console.error('Error loading events:', error);
                setEvents(fallbackEvents);
                setInfoMessage('Kunde inte nå Firestore, visar standardlista.');
            } finally {
                setLoading(false);
            }
        }

        loadEvents();

        return () => {
            mounted = false;
        };
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>

                <Text style={styles.title}>Select Your Hunt</Text>
                <Text style={styles.subtitle}>Choose a bounty hunt to begin</Text>
                {infoMessage ? <Text style={styles.info}>{infoMessage}</Text> : null}
                {loading ? <Text style={styles.loading}>Loading events...</Text> : null}
                
                <View style={styles.eventsContainer}>
                    {/** Highlight today's or next event */}
                    {(() => {
                        const parsed = events.map(ev => {
                            const dateStr = ev.eventDate || null;
                            let dateObj = null;
                            if (dateStr) {
                                // parse YYYY-MM-DD as local date
                                dateObj = new Date(dateStr + 'T00:00:00');
                            }
                            return { ...ev, _dateObj: dateObj };
                        });

                        const today = new Date();
                        today.setHours(0,0,0,0);

                        // find upcoming events (>= today)
                        const upcoming = parsed.filter(e => e._dateObj instanceof Date && !isNaN(e._dateObj)).sort((a,b)=>a._dateObj - b._dateObj);
                        const upcomingNearest = upcoming.find(e => e._dateObj >= today) || null;

                        // if no upcoming, fallback to nearest past
                        let selected = upcomingNearest;
                        if (!selected) {
                            const past = parsed.filter(e => e._dateObj instanceof Date && e._dateObj < today).sort((a,b)=>b._dateObj - a._dateObj);
                            selected = past.length > 0 ? past[0] : (parsed.length>0 ? parsed[0] : null);
                        }

                        const rest = parsed.filter(e => !selected || String(e.id) !== String(selected.id));

                        return (
                            <>
                                {selected ? (
                                    <TouchableOpacity key={selected.id} style={[styles.eventCard, styles.highlightCard]} onPress={() => onSelectEvent(selected.id)}>
                                        <Text style={styles.eventName}>{selected.name}</Text>
                                        {selected.eventDate ? <Text style={styles.eventDetails}>Date: {selected.eventDate}</Text> : null}
                                        <Text style={styles.selectText}>Today's / Next Event — Tap to Start →</Text>
                                    </TouchableOpacity>
                                ) : null}

                                {rest.map((event) => (
                                    <TouchableOpacity
                                        key={event.id}
                                        style={styles.eventCard}
                                        onPress={() => onSelectEvent(event.id)}
                                    >
                                        <Text style={styles.eventName}>{event.name}</Text>
                                        {event.eventDate ? <Text style={styles.eventDetails}>Date: {event.eventDate}</Text> : <Text style={styles.eventDetails}>{String(event.details || '').replace(/\s*•\s*(Easy|Medium|Hard)\s*/i, '').trim()}</Text>}
                                        <Text style={styles.selectText}>Tap to Start →</Text>
                                    </TouchableOpacity>
                                ))}
                            </>
                        );
                    })()}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    scrollContent: {
        flexGrow: 1,
        padding: 20,
        paddingTop: 60,
    },
    backButton: {
        alignSelf: 'flex-start',
        paddingVertical: 10,
        paddingHorizontal: 14,
        marginBottom: 10,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    backButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#ffffff',
        textAlign: 'center',
        marginBottom: 10,
        textTransform: 'uppercase',
    },
    subtitle: {
        fontSize: 16,
        color: '#cccccc',
        textAlign: 'center',
        marginBottom: 30,
    },
    info: {
        fontSize: 14,
        color: '#ffd166',
        textAlign: 'center',
        marginBottom: 16,
    },
    loading: {
        fontSize: 14,
        color: '#aaa',
        textAlign: 'center',
        marginBottom: 16,
    },
    eventsContainer: {
        gap: 15,
    },
    eventCard: {
        backgroundColor: '#ffffff',
        borderRadius: 15,
        padding: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    eventName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 8,
    },
    eventDetails: {
        fontSize: 16,
        color: '#555',
        marginBottom: 10,
    },
    selectText: {
        fontSize: 16,
        color: '#e74c3c',
        fontWeight: '600',
        textAlign: 'right',
    },
});

export default EventSelectionScreen;
