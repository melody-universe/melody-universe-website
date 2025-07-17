import { type ReactNode, useRef } from "react";

export function useParallax(): ReactNode {
  const ref = useRef<null | ReactNode>(null);
  if (!ref.current) {
    ref.current = createParallax();
  }

  return ref.current;
}

function createParallax(): ReactNode {
  /** TODO: Adjust this to the screen size */
  const width = 2000;
  const height = 2000;

  const stars: {
    animationDelay: number;
    layerIndex: number;
    x: number;
    y: number;
  }[] = [];

  const layers: { brightness: number; density: number }[] = [
    { brightness: 1, density: 3 },
    { brightness: 0.5, density: 4 },
    { brightness: 0.25, density: 6 },
  ];

  for (const [layerIndex, layer] of layers.entries()) {
    for (let x = 0; x < width; x += 100) {
      for (let y = 0; y < height; y += 100) {
        for (let i = 0; i < layer.density; i++) {
          stars.push({
            animationDelay: Math.random() * 2,
            layerIndex,
            x: x + Math.random() * 100,
            y: y + Math.random() * 100,
          });
        }
      }
    }
  }

  return (
    <div className="absolute top-0 left-0">
      <div className="h-screen w-screen overflow-hidden">
        <svg height={2000} width={2000} xmlns="http://www.w3.org/2000/svg">
          <defs>
            {layers.map((layer, i) => (
              <radialGradient
                cx={0.5}
                cy={0.5}
                id={`layer-${i}`}
                key={i}
                r={0.5}
                spreadMethod="pad"
              >
                <stop
                  offset={0}
                  stopColor="#fff"
                  stopOpacity={layer.brightness}
                />
                <stop offset={1} stopColor="#fff" stopOpacity={0} />
              </radialGradient>
            ))}
          </defs>
          <g>
            {stars.map(({ animationDelay, layerIndex, x, y }, i) => (
              <circle
                className="animate-pulse"
                cx={x}
                cy={y}
                fill={`url(#layer-${layerIndex})`}
                key={i}
                r={1.5}
                style={{ animationDelay: `${animationDelay}s` }}
                suppressHydrationWarning
              />
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
}
