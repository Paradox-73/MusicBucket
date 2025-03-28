export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-[600px]">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#800080]"></div>
    </div>
  );
}