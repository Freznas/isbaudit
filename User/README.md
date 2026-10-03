# SGBountyhunt - User App

Stormtrooper bounty hunt game application for guests.

## Project Structure

```
User/
├── public/
│   └── assets/
│       ├── sounds/          # Sound effects (success, error)
│       └── images/          # Trooper images
├── src/
│   ├── screens/             # Main screen components
│   │   ├── WelcomeScreen.jsx
│   │   ├── EventSelectionScreen.jsx
│   │   ├── GameScreen.jsx
│   │   └── SuccessScreen.jsx
│   ├── components/          # Reusable UI components
│   │   ├── TrooperCard.jsx
│   │   ├── CodeInput.jsx
│   │   ├── EventCard.jsx
│   │   └── Button.jsx
│   ├── services/            # API and business logic
│   │   ├── api.js
│   │   ├── eventService.js
│   │   └── gameService.js
│   ├── utils/               # Helper functions
│   │   ├── soundPlayer.js
│   │   └── validation.js
│   ├── hooks/               # Custom React hooks
│   │   ├── useGame.js
│   │   └── useSound.js
│   ├── styles/              # CSS/styling files
│   ├── App.jsx
│   └── main.jsx
└── README.md
```

## Features

- Welcome screen with rules and information
- Event/hunt selection (if multiple events available)
- Interactive game screen with trooper images
- Code validation with sound feedback
- Success screen for completed hunts

## Setup

Instructions coming soon...
