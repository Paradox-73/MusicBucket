import React, { useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { createSpotifyApi } from '../../lib/Dashboard/spotify';
import { SpotifyAuth } from '../../lib/spotify/auth';

interface ArtistNetworkGraphProps {
  artistIds: string[];
}

interface GraphData {
  nodes: { id: string; name: string; color?: string }[];
  links: { source: string; target: string }[];
}

export const ArtistNetworkGraph: React.FC<ArtistNetworkGraphProps> = ({ artistIds }) => {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const spotifyAuth = SpotifyAuth.getInstance();

  useEffect(() => {
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const fetchGraphData = async () => {
      const token = await spotifyAuth.getAccessToken();
      if (!token) return;
      const spotifyApi = createSpotifyApi(token);

      const nodes: { id: string; name: string; color?: string }[] = [];
      const links: { source: string; target: string }[] = [];
      const processedArtists = new Set<string>();

      // Limit to top 20 artists to avoid too many API calls
      const artistsToFetch = artistIds.slice(0, 20);

      for (const artistId of artistsToFetch) {
        if (processedArtists.has(artistId)) continue;

        try {
          const artist = await spotifyApi.getArtist(artistId);
          nodes.push({ id: artist.data.id, name: artist.data.name, color: '#f00' });
          processedArtists.add(artist.data.id);

          const relatedArtists = await spotifyApi.getArtistRelatedArtists(artist.data.id);
          relatedArtists.data.artists.forEach(relatedArtist => {
            if (!processedArtists.has(relatedArtist.id)) {
              nodes.push({ id: relatedArtist.id, name: relatedArtist.name, color: '#00f' });
              processedArtists.add(relatedArtist.id);
            }
            links.push({ source: artist.data.id, target: relatedArtist.id });
          });
          await sleep(500); // Add a delay to prevent hitting rate limits
        } catch (error) {
          console.error(`Failed to fetch data for artist ${artistId}`, error);
        }
      }

      setGraphData({ nodes, links });
    };

    if (artistIds.length > 0) {
      fetchGraphData();
    }
  }, [artistIds, spotifyAuth]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Your Artist Network</h2>
      {graphData.nodes.length > 0 ? (
        <ForceGraph2D
          graphData={graphData}
          nodeLabel="name"
          nodeAutoColorBy="name"
          linkDirectionalParticles={1}
        />
      ) : (
        <p>Loading artist network...</p>
      )}
    </div>
  );
};