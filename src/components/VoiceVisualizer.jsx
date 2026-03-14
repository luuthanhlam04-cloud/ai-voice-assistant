"use client";
export default function VoiceVisualizer({ isActive }) {
  if (!isActive) return <div className="h-8"></div>;
  
  return (
    <div className="flex items-center justify-center gap-1 h-8">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="w-1 bg-blue-500 rounded-full animate-bounce"
          style={{
            height: '100%',
            animationDelay: `${i * 0.1}s`,
            animationDuration: '0.6s'
          }}
        />
      ))}
    </div>
  );
}