// Welcome screen - Rules and info about the bounty hunt

// React is the core library - always needed for JSX
import React from 'react';

// React Native components - these are the building blocks (like HTML tags but for mobile)
// View = like a <div> in HTML - a container
// Text = like <p> or <span> - displays text (ALL text MUST be in <Text> in React Native)
// StyleSheet = creates optimized styles (like CSS but as JavaScript objects)
// ScrollView = makes content scrollable when it overflows
// TouchableOpacity = button that fades when pressed (gives visual feedback)
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';

// Expo StatusBar - controls the phone's status bar (battery, time, etc.)
import { StatusBar } from 'expo-status-bar';
import imperialLogo from '../assets/images/BackgroundImperialLogo.png';
import arrowIcon from '../assets/icons/ArrowIcon.png';
import startButtonImage from '../assets/icons/StartButton.png';

// FUNCTIONAL COMPONENT - modern way to create components in React
// { onStart } is "destructured props" - same as: props.onStart
// This function receives props from parent and returns JSX
const WelcomeScreen = ({ onStart }) => {
  
  // JSX RETURN - everything between return() is what gets displayed
  // Must return a SINGLE root element (wrapped in one View here)
  return (
    // Root View - fills entire screen (flex: 1 means "take all available space")
    <View style={styles.container}>
      
      {/* StatusBar component - style="light" makes status bar icons white */}
      <StatusBar style="light" />

      <View style={styles.welcomeContainer}>
        <View style={styles.topContent}>
          <Image source={imperialLogo} style={styles.logo} resizeMode="contain" />
          <Text style={styles.logoSubtitle}>isb udit</Text>
          <Text style={styles.title}>ISB AUDIT</Text>

          <View style={styles.spacer} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}></Text>
            <View style={styles.ruleItem}>
              <Image source={arrowIcon} style={styles.bulletIcon} resizeMode="contain" />
              <Text style={styles.ruleText}>Tap a character to select it</Text>
            </View>
            <View style={styles.ruleItem}>
              <Image source={arrowIcon} style={styles.bulletIcon} resizeMode="contain" />
              <Text style={styles.ruleText}>Enter the code shown by the character</Text>
            </View>
            <View style={styles.ruleItem}>
              <Image source={arrowIcon} style={styles.bulletIcon} resizeMode="contain" />
              <Text style={styles.ruleText}>Complete the audit to finish the hunt</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.startButtonTouchable} onPress={onStart} activeOpacity={0.85}>
          <Image source={startButtonImage} style={styles.startButtonImage} resizeMode="contain" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// STYLESHEET - Creates optimized style objects (like CSS but in JavaScript)
// Access styles like: styles.container, styles.title, etc.
const styles = StyleSheet.create({
  
  // Container - root element styles
  container: {
    flex: 1, // flex: 1 = take up all available space (essential for fullscreen)
    backgroundColor: 'transparent',
  },
  
  // ScrollView content wrapper
  scrollContent: {
    flexGrow: 1, // Allows content to grow and enables scrolling when needed
  },
  
  // Main content container
  welcomeContainer: {
    flex: 1, // Take all available space
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: '25%',
    paddingBottom: 40,
    backgroundColor: 'transparent',
  },

  topContent: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexGrow: 0,
  },
  
  // Title text
  title: {
    fontSize: 32, // Font size in pixels
    fontFamily: 'Waukegan LDO Black',
    color: '#ffffff',
    textAlign: 'center', // Horizontal centering
    marginBottom: 30, // Space below element
    textTransform: 'uppercase', // Makes text UPPERCASE
    letterSpacing: 2, // Space between letters (makes it look more dramatic)
  },

  logo: {
    width: 180,
    height: 72,
    marginBottom: 16,
  },

  logoSubtitle: {
    color: '#d8d8d8',
    fontSize: 13,
    letterSpacing: 2,
    textTransform: 'lowercase',
    fontFamily: 'Aurebesh',
    marginBottom: 10,
     textAlign: 'left',
  },

  spacer: {
    height: 18,
  },
  
  // Content wrapper
  content: {
    marginBottom: 30, // Space below
  },
  
  // Section container (for intro and rules)
  section: {
    marginBottom: 25, // Space between sections
    alignItems: 'flex-start',
    width: '100%',
  },
  
  // Intro paragraph text
  introText: {
    fontSize: 16,
    lineHeight: 24, // Space between lines of text (makes it more readable)
    color: '#333', // Dark gray
  },
  
  // Section title (like "How to Play")
  sectionTitle: {
    fontSize: 24,
    fontWeight: '300',
    color: '#ffffff',
    marginBottom: 15,
    textAlign: 'left',
    fontFamily: 'Outfit-ExtraLight',
  },
  
  // Rule item container (bullet + text in a row)
  ruleItem: {
    flexDirection: 'row', // IMPORTANT: Arranges children horizontally (default is 'column' = vertical)
    marginBottom: 12, // Space between each rule
    paddingLeft: 0,
    justifyContent: 'flex-start',
    width: '100%',
  },
  
  // Bullet point
  bulletIcon: {
    width: 16,
    height: 16,
    marginRight: 15,
  },
  
  // Rule text
  ruleText: {
    flex: 1, // Takes remaining space in the row (pushes to fill width)
    fontSize: 15,
    lineHeight: 22,
    color: '#f1f1f1',
    textAlign: 'left',
    fontFamily: 'Outfit-ExtraLight',
  },
  
  // Info box (highlighted note section)
  infoBox: {
    backgroundColor: '#f8f9fa', // Light gray background
    padding: 20,
    borderRadius: 10, // Rounded corners
    borderLeftWidth: 4, // Left border only
    borderLeftColor: '#e74c3c', // Red left border (accent)
  },
  
  // Info box text
  infoText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#555',
  },
  
  // "Note:" label in bold red
  infoLabel: {
    color: '#e74c3c',
    fontWeight: 'bold',
  },
  
  // Start button
  startButtonTouchable: {
    alignSelf: 'center',
    marginTop: 8,
  },

  startButtonImage: {
    width: 240,
    height: 72,
  },
});

// EXPORT - makes this component available to other files
// "export default" means this is the main export from this file
export default WelcomeScreen;
  