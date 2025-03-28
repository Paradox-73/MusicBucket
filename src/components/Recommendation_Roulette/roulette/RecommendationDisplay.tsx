import { Card } from "../ui/card";
import { ExternalLink, Music } from "lucide-react";

interface RecommendationDisplayProps {
  recommendation: {
    name: string;
    type?: string;
    artists?: { name: string }[];
    external_urls?: { spotify: string };
    images?: { url: string }[];
    publisher?: string; // For podcasts
    owner?: { display_name: string }; // For playlists
  } | null;
}

export function RecommendationDisplay({ recommendation }: RecommendationDisplayProps) {
  if (!recommendation) return null;

  return (
    <Card className="p-6 mt-8 bg-gradient-to-br from-[#800080]/10 to-[#00cccc]/10">
      <div className="flex items-center gap-4">
        {recommendation.images?.[0]?.url ? (
          <img
            src={recommendation.images[0].url}
            alt={recommendation.name}
            className="w-24 h-24 rounded-lg"
          />
        ) : (
          <div className="w-24 h-24 rounded-lg bg-black/50 flex items-center justify-center">
            <Music className="w-8 h-8 text-[#00cccc]" />
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-white">{recommendation.name}</h3>
          {recommendation.artists && (
            <p className="text-gray-400">
              {recommendation.artists.map(a => a.name).join(', ')}
            </p>
          )}
          {recommendation.publisher && (
            <p className="text-gray-400">By {recommendation.publisher}</p>
          )}
          {recommendation.owner && (
            <p className="text-gray-400">By {recommendation.owner.display_name}</p>
          )}
          {recommendation.type && (
            <p className="text-gray-400 text-sm">Type: {recommendation.type}</p>
          )}
        </div>
        {recommendation.external_urls?.spotify && (
          <a
            href={recommendation.external_urls.spotify}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#00cccc] hover:text-[#800080] transition-colors"
          >
            <ExternalLink className="w-6 h-6" />
          </a>
        )}
      </div>
    </Card>
  );
}