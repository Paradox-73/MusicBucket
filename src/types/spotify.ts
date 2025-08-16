export interface SpotifyProfile {
  display_name: string;
  id: string;
  email: string;
  href: string;
  images: {
    url: string;
    height: number;
    width: number;
  }[];
  type: string;
  uri: string;
  followers: {
    href: string | null;
    total: number;
  };
}