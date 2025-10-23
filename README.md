# Pomodoro Radio 🍅🎵

A soothing Pomodoro timer with integrated lofi music streaming, inspired by the [Lofi Girl Pomodoro live stream](https://www.youtube.com/watch?v=1oDrJba2PSs). This is a remix of the original [Lofi.FM](https://github.com/Lofi-FM/Lofi.FM) project, enhanced with Pomodoro timer functionality.

## Features

- 🎵 **24/7 Lofi Music Streaming** - Continuous lofi music from [Lofi.FM](https://github.com/Lofi-FM/Lofi.FM)
- ⏰ **Complete Pomodoro Timer** - 4 work sessions (25 min) with short breaks (5 min) and long break (15 min)
- 🎧 **Audio Controls** - Volume sliders for music, rain, and vinyl effects
- 🎛️ **Speed Control** - Adjustable playback speed (0.85x to 1.2x)
- 🌧️ **Ambient Sounds** - Rain and vinyl crackle effects
- 📱 **PWA Support** - Install as a web app on your device
- 🔔 **Sound Notifications** - Audio alerts for session transitions
- 📊 **Session Tracking** - Visual progress through work/break cycles

## Credits

This project is a remix of the original [Lofi.FM](https://github.com/Lofi-FM/Lofi.FM) repository by [@Lofi-FM](https://github.com/Lofi-FM), enhanced with Pomodoro timer functionality.

**Inspiration**: [Lofi Girl Pomodoro Live Stream](https://www.youtube.com/watch?v=1oDrJba2PSs) - The iconic 24/7 lofi study stream that inspired this project.

## How to Run Locally

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- A local web server (options below)

### Option 1: Using Python (Recommended)

If you have Python installed:

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

Then open: `http://localhost:8000`

### Option 2: Using Node.js

If you have Node.js installed:

```bash
# Install a simple HTTP server
npm install -g http-server

# Run the server
http-server -p 8000
```

Then open: `http://localhost:8000`

### Option 3: Using PHP

If you have PHP installed:

```bash
php -S localhost:8000
```

Then open: `http://localhost:8000`

### Option 4: Using Live Server (VS Code)

If you're using VS Code:

1. Install the "Live Server" extension
2. Right-click on `index.html`
3. Select "Open with Live Server"

### Option 5: Using any other local server

You can use any local web server that serves static files:
- XAMPP
- WAMP
- MAMP
- Any other local development server

## Project Structure

```
PomodoroRadio/
├── index.html          # Main HTML file
├── app.js              # JavaScript application logic
├── styles.css          # Additional CSS styles
├── manifest.webmanifest # PWA manifest
├── sw.js               # Service worker for PWA
├── assets/             # Audio assets
│   ├── ding.wav        # Timer completion sound
│   ├── alarmbeep.wav   # Break completion sound
│   ├── rain.wav        # Rain ambient sound
│   ├── vinyl.wav       # Vinyl crackle sound
│   └── tomato.png      # App icon
└── README.md           # This file
```

## Usage

1. **Start a Session**: Click the ▶️ button to begin your Pomodoro session
2. **Adjust Audio**: Use the sliders to control music, rain, and vinyl volume
3. **Set Speed**: Adjust playback speed for your preferred tempo
4. **Track Progress**: Watch the timer card for session information
5. **Take Breaks**: The app automatically transitions between work and break periods

## Pomodoro Cycle

- **Work Periods**: 25 minutes of focused work
- **Short Breaks**: 5 minutes between work sessions
- **Long Break**: 15 minutes after 4 work sessions
- **Cycle**: Automatically repeats after completion

## Technical Features

- **Web Audio API**: Real-time audio processing and mixing
- **Service Worker**: Offline functionality and PWA support
- **Responsive Design**: Works on desktop and mobile devices
- **Progressive Web App**: Installable on any device
- **Real-time Metadata**: Live track information display
- **Audio Effects**: Rain and vinyl ambient sounds

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## Contributing

This project is a remix of the original [Lofi.FM](https://github.com/Lofi-FM/Lofi.FM) repository. Feel free to fork and modify for your own use!

## License

This project is based on the original [Lofi.FM](https://github.com/Lofi-FM/Lofi.FM) repository. Please refer to the original repository for licensing information.

---

**Enjoy your focused work sessions with the perfect lofi soundtrack! 🎵🍅**
