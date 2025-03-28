export const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInYears = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 365);
  
  if (diffInYears < 1) {
    const diffInMonths = Math.floor(diffInYears * 12);
    return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`;
  }
  
  const years = Math.floor(diffInYears);
  return `${years} year${years !== 1 ? 's' : ''} ago`;
};