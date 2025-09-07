'use client';

interface FloatingOrbProps {
  size?: number;
  className?: string;
}

export function FloatingOrb({ size = 100, className = '' }: FloatingOrbProps) {
  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      {/* 外層旋轉環 */}
      <div
        className="absolute inset-0 animate-spin"
        style={{
          animation: 'spin 20s linear infinite',
        }}
      >
        {Array.from({ length: 8 }, (_, i) => {
          const angle = (i / 8) * 2 * Math.PI;
          const radius = size * 0.3;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          return (
            <div
              key={i}
              className="absolute w-1 h-1 bg-foreground/20 rounded-full"
              style={{
                left: `${size / 2 + x}px`,
                top: `${size / 2 + y}px`,
              }}
            />
          );
        })}
      </div>

      {/* 內層反向旋轉環 */}
      <div
        className="absolute inset-0"
        style={{
          animation: 'spin 15s linear infinite reverse',
        }}
      >
        {Array.from({ length: 6 }, (_, i) => {
          const angle = (i / 6) * 2 * Math.PI;
          const radius = size * 0.2;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          return (
            <div
              key={i}
              className="absolute w-0.5 h-0.5 bg-foreground/30 rounded-full"
              style={{
                left: `${size / 2 + x}px`,
                top: `${size / 2 + y}px`,
              }}
            />
          );
        })}
      </div>

      {/* 中心點 */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-foreground/40 rounded-full animate-pulse" />
    </div>
  );
}

// 更簡潔的版本
export function MinimalOrb({ size = 80, className = '' }: FloatingOrbProps) {
  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      {/* 三個同心圓環，不同旋轉速度 */}
      {[0, 1, 2].map((ring) => (
        <div
          key={ring}
          className="absolute inset-0 rounded-full border border-foreground/10"
          style={{
            animation: `spin ${8 + ring * 4}s linear infinite ${ring % 2 === 0 ? '' : 'reverse'}`,
            transform: `scale(${0.4 + ring * 0.2})`,
          }}
        >
          {/* 在每個環上放置點 */}
          {Array.from({ length: 6 + ring * 2 }, (_, i) => {
            const angle = (i / (6 + ring * 2)) * 2 * Math.PI;
            const radius = (size * (0.4 + ring * 0.2)) / 2;
            return (
              <div
                key={i}
                className="absolute w-0.5 h-0.5 bg-foreground/20 rounded-full"
                style={{
                  left: `${size / 2 + Math.cos(angle) * radius - 1}px`,
                  top: `${size / 2 + Math.sin(angle) * radius - 1}px`,
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
