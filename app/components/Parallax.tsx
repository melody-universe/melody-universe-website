import { type ReactNode, useEffect, useState } from "react";

export function Parallax(): ReactNode {
  const [[screenWidth, screenHeight], setScreenSize] = useState<
    [number, number]
  >([0, 0]);

  useEffect(function manageScreenSize() {
    refreshScreenSize();
    window.addEventListener("resize", refreshScreenSize);

    return () => window.removeEventListener("resize", refreshScreenSize);

    function refreshScreenSize() {
      setScreenSize([document.body.clientWidth, document.body.clientHeight]);
    }
  }, []);

  const [starMap, setStarMap] = useState<
    {
      animationDelay: number;
      color: number;
      layerIndex: number;
      x: number;
      y: number;
    }[][][]
  >([]);

  useEffect(() => {
    setStarMap((map) => {
      if (
        map.length > 0 &&
        map[0].length * tileSize > screenWidth &&
        map.length * tileSize > screenHeight
      ) {
        return map;
      }

      const newMap = map.map((row) => [...row]);

      if (map.length * tileSize <= screenHeight) {
        for (let y = map.length; y <= screenHeight / tileSize; y++) {
          newMap.push([]);
          for (let x = 0; x < newMap[0].length; x++) {
            newMap[y].push([]);
            for (let i = 0; i < layers.length; i++) {
              newMap[y][x].push({
                animationDelay: Math.random() * 2,
                color: Math.floor(Math.random() * colors),
                layerIndex: i,
                x: (x + Math.random()) * tileSize,
                y: (y + Math.random()) * tileSize,
              });
            }
          }
        }
      }

      if (newMap[0].length * tileSize <= screenWidth) {
        for (let x = map[0]?.length ?? 0; x <= screenWidth / tileSize; x++) {
          for (let y = 0; y < newMap.length; y++) {
            newMap[y].push([]);
            for (let i = 0; i < layers.length; i++) {
              newMap[y][x].push({
                animationDelay: Math.random() * 2,
                color: Math.floor(Math.random() * colors),
                layerIndex: i,
                x: (x + Math.random()) * tileSize,
                y: (y + Math.random()) * tileSize,
              });
            }
          }
        }
      }

      return newMap;
    });
  }, [screenWidth, screenHeight]);

  return (
    <div className="absolute top-0 left-0">
      <div className="h-screen w-screen overflow-hidden">
        <svg
          height={screenHeight}
          width={screenWidth}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {layers.map((layer, layerIndex) =>
              Array.from({ length: colors }).map((_, colorIndex) => (
                <radialGradient
                  cx={0.5}
                  cy={0.5}
                  id={`layer-${layerIndex}-color-${colorIndex}`}
                  key={`layer-${layerIndex}-color-${colorIndex}`}
                  r={0.5}
                  spreadMethod="pad"
                >
                  <stop
                    offset={0}
                    stopColor={hslToHex((colorIndex / colors) * 360, 80, 85)}
                    stopOpacity={layer.brightness}
                  />
                  <stop offset={1} stopColor="#fff" stopOpacity={0} />
                </radialGradient>
              )),
            )}
          </defs>
          <g>
            {starMap.flatMap((row, rowIndex) =>
              row.flatMap((column, columnIndex) =>
                column.map(({ animationDelay, color, layerIndex, x, y }, i) => (
                  <circle
                    className="animate-pulse"
                    cx={x}
                    cy={y}
                    fill={`url(#layer-${layerIndex}-color-${color})`}
                    key={`${rowIndex}_${columnIndex}_${i}`}
                    r={layers[layerIndex].radius}
                    style={{ animationDelay: `${animationDelay}s` }}
                  />
                )),
              ),
            )}
          </g>
        </svg>
      </div>
    </div>
  );
}

const layers: { brightness: number; density: number; radius: number }[] = [
  { brightness: 1, density: 4, radius: 2.5 },
  { brightness: 0.5, density: 6, radius: 2 },
  { brightness: 0.25, density: 8, radius: 1.5 },
];

const colors = 10;

const tileSize = 100;

function hslToHex(hue: number, saturation: number, lightness: number) {
  lightness /= 100;
  const a = (saturation * Math.min(lightness, 1 - lightness)) / 100;
  const f = (n: number) => {
    const k = (n + hue / 30) % 12;
    const color = lightness - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0"); // convert to Hex and prefix "0" if needed
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}
