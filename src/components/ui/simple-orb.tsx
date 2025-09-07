'use client';

interface SimpleOrbProps {
  size?: number;
  className?: string;
}

export function SimpleOrb({ size = 80, className = '' }: SimpleOrbProps) {
  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      {/* 外環 */}
      <div
        className="absolute inset-0 animate-spin border border-foreground/10 rounded-full"
        style={{
          animation: 'spin 8s linear infinite',
          borderStyle: 'dashed',
        }}
      />

      {/* 中環 */}
      <div
        className="absolute inset-2 animate-spin border border-foreground/15 rounded-full"
        style={{
          animation: 'spin 6s linear infinite reverse',
          borderStyle: 'dotted',
        }}
      />

      {/* 內環 */}
      <div
        className="absolute inset-4 animate-spin border border-foreground/20 rounded-full"
        style={{
          animation: 'spin 4s linear infinite',
        }}
      />

      {/* 中心點 */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-foreground/25 rounded-full animate-pulse" />

      {/* 軌道上的點 */}
      {[0, 1, 2].map((ring) => (
        <div
          key={ring}
          className="absolute inset-0"
          style={{
            animation: `spin ${12 + ring * 3}s linear infinite ${ring % 2 === 0 ? '' : 'reverse'}`,
          }}
        >
          {Array.from({ length: 4 + ring }, (_, i) => {
            const angle = (i / (4 + ring)) * 2 * Math.PI;
            const radius = (size * (0.3 + ring * 0.1)) / 2;
            return (
              <div
                key={`${ring}-${i}`}
                className="absolute w-1 h-1 bg-foreground/20 rounded-full"
                style={{
                  left: `${size / 2 + Math.cos(angle) * radius - 2}px`,
                  top: `${size / 2 + Math.sin(angle) * radius - 2}px`,
                }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

// 點陣球體
export function DotSphere({ size = 100, className = '' }: SimpleOrbProps) {
  const dots = [];

  // 創建球面上的點
  for (let i = 0; i < 20; i++) {
    const phi = Math.acos(-1 + (2 * i) / 19); // 0 to π
    const theta = Math.sqrt(19 * Math.PI) * phi; // 螺旋分布

    const x = Math.cos(theta) * Math.sin(phi);
    const y = Math.sin(theta) * Math.sin(phi);
    const z = Math.cos(phi);

    // 投影到2D
    const scale = 1 / (1 + z * 0.5);
    const projectedX = x * scale * size * 0.3;
    const projectedY = y * scale * size * 0.3;

    dots.push({
      x: projectedX,
      y: projectedY,
      scale: 0.5 + scale * 0.5,
      opacity: 0.2 + scale * 0.3,
      delay: i * 0.1,
    });
  }

  return (
    <div
      className={`relative ${className}`}
      style={{
        width: size,
        height: size,
        animation: 'spin 20s linear infinite',
      }}
    >
      {dots.map((dot) => (
        <div
          key={dot.delay}
          className="absolute bg-foreground rounded-full animate-pulse"
          style={{
            width: `${dot.scale * 4}px`,
            height: `${dot.scale * 4}px`,
            left: `${size / 2 + dot.x}px`,
            top: `${size / 2 + dot.y}px`,
            opacity: dot.opacity,
            animationDelay: `${dot.delay}s`,
            animationDuration: '2s',
          }}
        />
      ))}
    </div>
  );
}
