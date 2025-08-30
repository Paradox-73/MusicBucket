import { TierRow } from './TierRow';

export const TierCanvas = ({ tiers }) => {
  return (
    <div className="flex-grow flex flex-col gap-1">
      {tiers.map(tier => (
        <TierRow key={tier.id} tier={tier} />
      ))}
    </div>
  );
};
