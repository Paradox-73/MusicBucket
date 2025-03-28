# MusicBucket 🎵

**Project Status**: This project is currently under active development. While the core features are being implemented, some functionality may be incomplete or subject to change. 

MusicBucket is a comprehensive music discovery and tracking platform that helps music enthusiasts explore new genres, track their listening habits, and deepen their appreciation for artists. By combining data visualization, personalized recommendations, and interactive features, MusicBucket transforms how users engage with their music listening journey.

## 🌟 Features

### Dashboard Analytics
- Comprehensive visualization of your listening patterns across different timeframes (4 weeks, 6 months, 1 year)
- Detailed analysis of music taste including metrics like danceability, tempo, energy, and more
- Achievement tracking to celebrate your musical exploration milestones

### MusicBucket Lists
- Create and manage personalized music bucket lists across different categories
- Filter and organize by artists, albums, genres, tracks, podcasts, and playlists
- Share your bucketlists with the community
- Auto-generate Spotify playlists based on your bucket selections

### Recommendation Roulette
- Interactive wheel-based recommendation system
- Customizable filters for discovering new music
- Smart recommendations based on listening history
- Direct integration with Spotify for instant listening

### RabbitHole
- Intuitive interface for continuous music discovery through hover-to-play functionality
- Personalized recommendations based on saved tracks and listening history
- Integration with global charts and new releases
- Quick-save feature for seamless music collection building

### Artist Depth Analysis
- Detailed artist cards showing your listening relationship
- Track your exploration score for each artist
- Discover lesser-known tracks from your favorite artists
- Generate playlists to deepen your artist knowledge

### Culture Clash
- Interactive globe interface using Three.js and Globe.GL for immersive geographical music exploration
- Curated playlists featuring popular songs from selected countries
- Insights into regional music culture and influential artists
- Access to global music charts and trending tracks

### RoadTrip
- Create location-based mixtapes using MapBox API integration
- Discover local artists along your planned route
- Generate playlists based on geographical music trends
- Export playlists for offline listening during your journey

### Music Personality
- Generate shareable music taste visualizations
- Create custom musical avatars
- Access BetterBlend for enhanced playlist creation
- Export personalized music reports

## 🛠 Tech Stack

- **Frontend**: React.js with Redux Toolkit
- **Mobile**: React Native
- **Backend**: Node.js with Express.js
- **Database**: MongoDB
- **Authentication**: Firebase Authentication
- **API Integrations**: 
  - Spotify Web API
  - MapBox API
  - Globe.GL
  - Three.js
- **Styling**: Tailwind CSS
- **Visualization**: D3.js, Chart.js
- **Deployment**: AWS/Heroku
- **Testing**: Jest, React Testing Library
- **CI/CD**: GitHub Actions

## 🔄 Git Setup for Collaborators

### Getting Started with the Repository
1. Clone the repository:
   ```
   git clone https://github.com/your-username/MusicBucket.git
   cd MusicBucket
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   - For the main project:
     ```
     cp src/.env.example src/.env
     ```
   - For each feature module:
     ```
     cp Bucket_List/.env.example Bucket_List/.env
     cp Rabbit_Hole/.env.example Rabbit_Hole/.env
     cp Exploration_Score/.env.example Exploration_Score/.env
     cp Road_Trip_Mixtape/.env.example Road_Trip_Mixtape/.env
     cp Recommendation_Roulette/.env.example Recommendation_Roulette/.env
     cp Artist_Exploration/.env.example Artist_Exploration/.env
     cp Culture_Clash/.env.example Culture_Clash/.env
     ```
   - Fill in your own API keys and secrets in each .env file

4. Start the development server:
   ```
   npm run dev
   ```

### Contributing
1. Create a new branch for your feature:
   ```
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit them:
   ```
   git add .
   git commit -m "Description of your changes"
   ```

3. Push your branch to GitHub:
   ```
   git push origin feature/your-feature-name
   ```

4. Create a Pull Request on GitHub to merge your changes to the main branch

### Security Best Practices
- Never commit sensitive information like API keys or secrets
- All environment variables should be set in the .env file which is ignored by git
- Use environment variables for all sensitive configuration
- Reach out to the project maintainer if you need access to API keys for development

## 🔑 Key Technical Implementations

- **Complex State Management**: Implemented Redux Toolkit for handling application-wide state and user preferences
- **Real-time Data Processing**: Built efficient algorithms for processing and analyzing music listening data
- **Interactive Visualizations**: Created dynamic data visualizations using D3.js, Chart.js, and Globe.GL
- **API Integration**: Developed robust integration with Spotify Web API, MapBox API including rate limiting and error handling
- **3D Globe Rendering**: Implemented Three.js and Globe.GL for immersive geographical music exploration
- **Responsive Design**: Implemented mobile-first design principles using Tailwind CSS
- **Authentication Flow**: Built secure OAuth implementation for Spotify authentication
- **Database Design**: Created optimized MongoDB schemas for efficient data retrieval and storage
- **Geolocation Services**: Integrated MapBox API for route planning and local music discovery

## 🎯 Problem Solution

MusicBucket addresses several key challenges in music discovery and tracking:

1. **Discovery Paralysis**: Simplifies music discovery through interactive and gamified features
2. **Surface-Level Listening**: Encourages deeper artist exploration through the Artist Depth feature
3. **Echo Chambers**: Promotes musical diversity through the Culture Clash feature
4. **Tracking Difficulty**: Provides comprehensive analytics and visualization of listening habits
5. **Disconnected Experience**: Integrates seamlessly with Spotify for a unified music experience
6. **Geographic Disconnect**: Bridges the gap between location and music through RoadTrip feature
7. **Discovery Friction**: Streamlines music exploration with the RabbitHole feature

## 🙏 Acknowledgments

- Spotify Web API for providing the music data infrastructure
- MapBox API for enabling geographical features
- Globe.GL and Three.js communities for 3D visualization capabilities
- The open-source community for various tools and libraries used in this project

## 💡 Inspiration & Attribution

While MusicBucket builds upon ideas from various music platforms and tools, we believe in transparent attribution. This project was inspired by features from several existing platforms, which we've reimagined and enhanced to create a unique music discovery experience. Key inspirations include:

- Last.fm's music tracking capabilities
- Spotify's Discover Weekly algorithm
- Apple Music's visualization style
- Various music analysis tools and platforms

We acknowledge these inspirations while ensuring our implementation brings new value through unique combinations, enhanced features, and novel approaches to music discovery.
