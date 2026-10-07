import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, Image, useWindowDimensions, Platform } from 'react-native';
import { useFonts } from 'expo-font';
import * as ScreenOrientation from 'expo-screen-orientation';
import WelcomeScreen from './screens/WelcomeScreen';
import GameScreen from './screens/GameScreen';
import { getEvents } from './services/eventService';
import appBackground from './assets/images/Background.jpg';
import backgroundTop from './assets/images/BackgroundTop.png';
import backgroundBottom from './assets/images/BackgroundBottom.png';
import backgroundSwedishGarrison from './assets/images/BackgroundSwedishGarrison.png';

function App() {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isWideScreen = windowWidth >= 768;
  const isLandscape = Platform.OS !== 'web' && windowWidth > windowHeight;
  const backgroundTopHeight = isWideScreen ? 72 : Math.max(40, Math.round(windowHeight * 0.065));
  const backgroundBottomHeight = isWideScreen ? 58 : Math.max(34, Math.round(windowHeight * 0.055));
  const backgroundSwedishGarrisonWidth = isWideScreen ? 188 : Math.min(140, Math.round(windowWidth * 0.3));
  const backgroundSwedishGarrisonHeight = isWideScreen ? 111 : Math.min(86, Math.round(windowWidth * 0.176));

  const [fontsLoaded] = useFonts({
    'Waukegan LDO Black': require('./assets/fonts/Waukegan LDO Black.ttf'),
    Aurebesh: require('./assets/fonts/Aurebesh.ttf'),
    'Outfit-ExtraLight': require('./assets/fonts/Outfit-ExtraLight.ttf'),
  });
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [activeEvents, setActiveEvents] = useState([]);

  useEffect(() => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.screen?.orientation?.lock) {
        window.screen.orientation.lock('portrait').catch(() => {});
      }
      return undefined;
    }

    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {});
    return undefined;
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  const getActiveEvents = (events) => {
    return (events || []).filter((event) => event?.isActive !== false && event?.active !== false);
  };

  const getEventFromUrl = (events) => {
    if (typeof window === 'undefined') {
      return null;
    }

    const params = new URLSearchParams(window.location.search || '');
    const requestedEvent = params.get('event') || params.get('eventId');

    if (!requestedEvent) {
      return null;
    }

    const normalizedRequestedEvent = String(requestedEvent).trim();
    return (
      (events || []).find((event) => String(event?.id).trim() === normalizedRequestedEvent) || null
    );
  };

  const getNearestEvent = (events) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const datedEvents = events
      .map((event, index) => {
        const eventDate = event.eventDate
          ? new Date(`${event.eventDate}T00:00:00`)
          : null;
        return { event, index, eventDate };
      })
      .filter(({ eventDate }) => eventDate && !Number.isNaN(eventDate.getTime()));

    const upcoming = datedEvents
      .filter(({ eventDate }) => eventDate >= today)
      .sort((a, b) => a.eventDate - b.eventDate || a.index - b.index);

    if (upcoming.length > 0) {
      return upcoming[0].event;
    }

    const past = datedEvents
      .sort((a, b) => b.eventDate - a.eventDate || a.index - b.index);

    return past[0]?.event || events[0] || null;
  };

  const handleStart = async () => {
    try {
      const events = await getEvents();
      const onlyActiveEvents = getActiveEvents(events);
      setActiveEvents(onlyActiveEvents);

      const eventFromUrl = getEventFromUrl(onlyActiveEvents);
      if (eventFromUrl) {
        setSelectedEvent(eventFromUrl.id);
        setCurrentScreen('game');
        return;
      }

      if (onlyActiveEvents.length > 0) {
        setSelectedEvent(getNearestEvent(onlyActiveEvents)?.id || null);
        setCurrentScreen('game');
        return;
      }

      setSelectedEvent(null);
      setCurrentScreen('game');
    } catch (_error) {
      // Keep existing flow if Firestore is unavailable.
      setSelectedEvent(null);
      setCurrentScreen('game');
    }
  };

  const handleBackToWelcome = () => {
    setCurrentScreen('welcome');
  };

  const handleSelectEvent = (eventId) => {
    setSelectedEvent(eventId);
    setCurrentScreen('game');
  };

  const handleBackToEvents = () => {
    setCurrentScreen('welcome');
  };

  const renderScreen = () => {
    if (isLandscape) {
      return (
        <View style={styles.rotateScreen}>
          <Text style={styles.rotateTitle}>Rotate your device</Text>
          <Text style={styles.rotateText}>This app is locked to portrait mode.</Text>
        </View>
      );
    }

    switch (currentScreen) {
      case 'welcome':
        return <WelcomeScreen onStart={handleStart} />;
      case 'game':
        return <GameScreen eventId={selectedEvent} onBack={handleBackToEvents} />;
      default:
        return <WelcomeScreen onStart={handleStart} />;
    }
  };

  return (
    <ImageBackground source={appBackground} style={styles.app} resizeMode="cover">
      <Image
        source={backgroundTop}
        style={[styles.backgroundTop, { height: backgroundTopHeight }]}
        resizeMode="contain"
        pointerEvents="none"
      />
      <Image
        source={backgroundBottom}
        style={[styles.backgroundBottom, { height: backgroundBottomHeight }]}
        resizeMode="contain"
        pointerEvents="none"
      />
      <Image
        source={backgroundSwedishGarrison}
        style={[
          styles.backgroundSwedishGarrison,
          { width: backgroundSwedishGarrisonWidth, height: backgroundSwedishGarrisonHeight },
          { transform: [{ scale: 1.12 }] },
          isWideScreen && styles.backgroundSwedishGarrisonWide,
        ]}
        resizeMode="contain"
        pointerEvents="none"
      />
      <View style={styles.screen}>{renderScreen()}</View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    overflow: 'hidden',
  },
  screen: {
    flex: 1,
  },
  rotateScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  rotateTitle: {
    color: '#f2f9ff',
    fontSize: 28,
    fontFamily: 'Waukegan LDO Black',
    textAlign: 'center',
    marginBottom: 10,
  },
  rotateText: {
    color: '#d8f1ff',
    fontSize: 14,
    fontFamily: 'Outfit-ExtraLight',
    textAlign: 'center',
  },
  backgroundTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: '100%',
    zIndex: 1,
  },
  backgroundBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    zIndex: 1,
  },
  backgroundSwedishGarrison: {
    position: 'absolute',
    right: 10,
    bottom: 23,
    zIndex: 1,
  },
  backgroundSwedishGarrisonWide: {
    bottom: 26,
  },
});

export default App;
