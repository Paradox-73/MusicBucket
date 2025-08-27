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
    <Card className="p-6 mt-8 bg-gradient-to-br from-purple-200/10 to-blue-200/10 dark:from-[#800080]/10 dark:to-[#00cccc]/10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
        {recommendation.images?.[0]?.url ? (
          <img
            src={recommendation.images[0].url}
            alt={recommendation.name}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg"
          />
        ) : (
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-gray-200/50 dark:bg-black/50 flex items-center justify-center">
            <Music className="w-8 h-8 text-blue-500 dark:text-[#00cccc]" />
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{recommendation.name}</h3>
          {recommendation.artists && (
            <p className="text-gray-500 dark:text-gray-400">
              {recommendation.artists.map(a => a.name).join(', ')}
            </p>
          )}
          {recommendation.publisher && (
            <p className="text-gray-500 dark:text-gray-400">By {recommendation.publisher}</p>
          )}
          {recommendation.owner && (
            <p className="text-gray-500 dark:text-gray-400">By {recommendation.owner.display_name}</p>
          )}
          {recommendation.type && (
            <p className="text-gray-500 dark:text-gray-400 text-sm">Type: {recommendation.type}</p>
          )}
        </div>
        {recommendation.external_urls?.spotify && (
          <a
            href={recommendation.external_urls.spotify}
            target="_blank"
            rel="noopener noreferrer"
            className="self-end sm:self-center text-blue-500 dark:text-[#00cccc] hover:text-purple-600 dark:hover:text-[#800080] transition-colors"
          >
            <ExternalLink className="w-6 h-6" />
          </a>
        )}
      </div>
    </Card>
  );
}