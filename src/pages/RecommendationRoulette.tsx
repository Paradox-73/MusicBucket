import { RootLayout } from "../components/Recommendation_Roulette/layout/RootLayout";
import { SpinWheel } from "../components/Recommendation_Roulette/roulette/SpinWheel";

const RecommendationRoulette = () => {
  return (
    <RootLayout>
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-500 dark:from-[#800080] dark:to-[#00cccc] text-transparent bg-clip-text">
          Recommendation Roulette
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-12">
          Spin the wheel and discover your next favorite music! Let fate (or our algorithm) guide
          your musical journey.
        </p>
        <SpinWheel />
      </div>
    </RootLayout>
  );
};

export default RecommendationRoulette;