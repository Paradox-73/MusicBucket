import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SavedTrack {
  added_at: string;
  track: Track;
}

interface Track {
  id: string;
  name: string;
  artists: { id: string; name: string; }[];
  popularity: number;
  album: { release_date: string; };
  duration_ms: number;
}

interface Personality {
  title: string;
  description: string;
}

const getDiversityLevel = (artistDiversity: number) => {
  if (artistDiversity > 60) return "High";
  if (artistDiversity > 40) return "Mid";
  return "Low";
};

const getTotalSongsLevel = (totalTracks: number) => {
  if (totalTracks > 2500) return "High";
  if (totalTracks > 1000) return "Mid";
  return "Low";
};

const getPopularityLevel = (avgPopularity: number) => {
  if (avgPopularity > 60) return "High";
  if (avgPopularity > 40) return "Mid";
  return "Low";
};

const getDecade = (avgReleaseYear: number) => {
  const decade = Math.floor(avgReleaseYear / 10) * 10;
  if (decade < 1960) return "Historian";
  if (decade < 1980) return "Groovy";
  if (decade < 1990) return "Neon";
  if (decade < 2000) return "Grunge";
  if (decade < 2010) return "Y2K";
  return "Modern";
};

const personalityDescriptions: { [key: string]: string } = {
  // Decade-based Adjectives
  "Historian": "You're digging up musical fossils, and loving every minute of it.",
  "Classicist": "You're so old school, you make the Historian look modern.",
  "Golden-Ager": "You've got that flapper flair and a playlist to match.",
  "Timeless": "Your music taste is like a fine wine, it only gets better with age.",
  "Revolutionary": "You're a musical rebel, shaking things up with sounds from a bygone era.",
  "Groovy": "You're rockin' and rollin' with the best of them, a true pioneer of cool.",
  "Psychedelic": "Your playlist is a trip, man, full of peace, love, and mind-bending tunes.",
  "Flower-Child": "You're all about good vibes and classic rock, a true child of the 70s.",
  "Neon": "You're living in a material world, with a soundtrack of synths and big hair.",
  "Grunge": "You're channeling your inner angst with flannel and a killer alt-rock playlist.",
  "Y2K": "You're bringing back the bling and the beats from the turn of the millennium.",
  "Modern": "You're plugged into the present, with a finger on the pulse of today's hits.",
  "Zeitgeist": "You're ahead of the curve, defining the sound of tomorrow, today.",

  // Popularity
  "Mainstream": "You love the anthems that get everyone moving, and you're not afraid to sing along.",
  "Alternative": "Your average song popularity is perfectly balanced, like all things should be. You're a musical Goldilocks, finding that 'just right' sweet spot.",
  "Underground": "You're a true discoverer, unearthing hidden gems before they hit the airwaves.",

  // Diversity
  "Devoted": "You know what you like, and you stick to it. Why wander when you've found perfection?",
  "Explorer": "You explore new sounds, but always return to your favorites, a balanced musical journey.",
  "Eclectic": "Your taste knows no bounds, embracing artists from every corner of the musical universe.",

  // Total Songs
  "Curator": "You carefully select each track, building a refined collection, quality over quantity.",
  "Collector": "Your collection is growing into a serious musical archive, a treasure trove of tunes.",
  "Hoarder": "Your vast library is a testament to your dedication to music, you collect 'em all!",
};

const getPersonality = (metrics: any, uniqueSongCount: number): Personality => {
  const songsLvl = getTotalSongsLevel(uniqueSongCount);
  const diversityLvl = getDiversityLevel(metrics.artistDiversity);
  const popLvl = getPopularityLevel(metrics.avgPopularity);
  const decadeWord = getDecade(metrics.avgReleaseYear);

  const songsWord = songsLvl === "Low" ? "Curator" : songsLvl === "Mid" ? "Collector" : "Hoarder";
  const diversityWord = diversityLvl === "Low" ? "Devoted" : diversityLvl === "Mid" ? "Explorer" : "Eclectic";
  const popWord = popLvl === "Low" ? "Underground" : popLvl === "Mid" ? "Alternative" : "Mainstream";

  const title = `The ${decadeWord} ${popWord} ${diversityWord} ${songsWord}`;
  const description = `${personalityDescriptions[songsWord]} ${personalityDescriptions[diversityWord]} ${personalityDescriptions[popWord]} ${personalityDescriptions[decadeWord]}`;

  return { title, description };
};

export const calculateMusicTasteMetrics = (tracks: SavedTrack[]) => {
  if (tracks.length === 0) return null;

  const totalTracks = tracks.length;
  const uniqueArtists = new Set(tracks.flatMap(item => item.track.artists.map(artist => artist.id)));
  
  const validPopularities = tracks.map(item => item.track.popularity).filter(p => typeof p === 'number' && !isNaN(p));
  const avgPopularity = validPopularities.length > 0 ? validPopularities.reduce((sum, p) => sum + p, 0) / validPopularities.length : 0;

  const validReleaseYears = tracks.map(item => new Date(item.track.album.release_date).getFullYear()).filter(y => typeof y === 'number' && !isNaN(y));
  const avgReleaseYear = validReleaseYears.length > 0 ? validReleaseYears.reduce((sum, y) => sum + y, 0) / validReleaseYears.length : 0;

  const artistDiversity = (uniqueArtists.size / totalTracks) * 100; // Keep for personality calculation

  const totalDurationMs = tracks.reduce((sum, item) => sum + (item.track.duration_ms || 0), 0);
  const avgDurationMs = totalTracks > 0 ? totalDurationMs / totalTracks : 0;

  const additionsByMonth: { [key: string]: { count: number } } = {};
  tracks.forEach(item => {
    const month = new Date(item.added_at).toISOString().slice(0, 7);
    if (!additionsByMonth[month]) {
      additionsByMonth[month] = { count: 0 };
    }
    additionsByMonth[month].count++;
  });

  const monthlyAdditionsData = Object.entries(additionsByMonth)
    .map(([month, data]) => ({ month, count: data.count }))
    .sort((a, b) => a.month.localeCompare(b.month));

  // Calculate Top 5 Most Repeated Artist
  const artistCounts = new Map<string, { count: number, name: string }>();
  tracks.forEach(item => {
    item.track.artists.forEach(artist => {
      const artistData = artistCounts.get(artist.id) || { count: 0, name: artist.name };
      artistCounts.set(artist.id, { ...artistData, count: artistData.count + 1 });
    });
  });
  const top5Artists = Array.from(artistCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Calculate Top 5 Most Repeated Album
  const albumCounts = new Map<string, { count: number, name: string }>();
  tracks.forEach(item => {
    if (item.track.album) {
      const album = item.track.album;
      const albumData = albumCounts.get(album.id) || { count: 0, name: album.name };
      albumCounts.set(album.id, { ...albumData, count: albumData.count + 1 });
    }
  });
  const top5Albums = Array.from(albumCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Calculate Top 5 Most Frequent Songs
  const songCounts = new Map<string, { count: number, name: string }>();
  tracks.forEach(item => {
    const songData = songCounts.get(item.track.id) || { count: 0, name: item.track.name };
    songCounts.set(item.track.id, { ...songData, count: songData.count + 1 });
  });
  const top5Songs = Array.from(songCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalTracks,
    uniqueArtists: Array.from(uniqueArtists),
    avgPopularity: Math.round(avgPopularity),
    avgReleaseYear: Math.round(avgReleaseYear),
    artistDiversity: Math.round(artistDiversity), // Keep for personality calculation
    monthlyAdditionsData,
    avgDurationMs,
    totalDurationMs,
    top5Artists,
    top5Albums,
    top5Songs,
  };
};

const formatDuration = (ms: number) => {
  if (isNaN(ms) || ms < 0) return '0:00';
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}:${(parseInt(seconds) < 10 ? '0' : '')}${seconds}`;
};

const formatTotalDuration = (ms: number) => {
  if (isNaN(ms) || ms < 0) return '0 hours';
  const hours = (ms / (1000 * 60 * 60)).toFixed(1);
  return `${hours} hours`;
};

interface MusicTasteAnalyzerProps {
  savedTracks: SavedTrack[];
  uniqueSongCount: number;
}

export const MusicTasteAnalyzer: React.FC<MusicTasteAnalyzerProps> = ({ savedTracks, uniqueSongCount }) => {
  if (!savedTracks || savedTracks.length === 0) return <div className="text-center py-10">Not enough data to analyze your taste.</div>;

  const metrics = calculateMusicTasteMetrics(savedTracks);
  if (!metrics) return null;

  const personality = getPersonality(metrics, uniqueSongCount);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center"
    >
      <h2 className="text-3xl font-bold mb-2">{personality.title}</h2>
      <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">{personality.description}</p>

      <h3 className="text-2xl font-bold mb-4">Your Stats</h3>
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div>
          <div className="text-2xl font-bold">{uniqueSongCount}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Songs</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{metrics.avgPopularity}/100</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Avg. Popularity</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{metrics.uniqueArtists.length}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Unique Artists</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{metrics.avgReleaseYear}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Avg. Release Year</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{formatTotalDuration(metrics.totalDurationMs)}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Listening Time</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{formatDuration(metrics.avgDurationMs)}</div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Track Length</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-xl font-bold mb-4">Top 5 Most Repeated Songs</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics.top5Songs} layout="vertical">
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={150} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" name="Times Repeated" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div>
          <h3 className="text-xl font-bold mb-4">Top 5 Most Repeated Artists</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics.top5Artists} layout="vertical">
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={150} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#82ca9d" name="Times Repeated" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div>
          <h3 className="text-xl font-bold mb-4">Top 5 Most Repeated Albums</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics.top5Albums} layout="vertical">
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={150} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#ffc658" name="Times Repeated" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
};
