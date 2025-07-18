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
            {starMap.flatMap((row, rowIndex) =>
              row.flatMap((column, columnIndex) =>
                column.map(({ animationDelay, layerIndex, x, y }, i) => (
                  <circle
                    className="animate-pulse"
                    cx={x}
                    cy={y}
                    fill={`url(#layer-${layerIndex})`}
                    key={`${rowIndex}_${columnIndex}_${i}`}
                    r={1.5}
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

const layers: { brightness: number; density: number }[] = [
  { brightness: 1, density: 3 },
  { brightness: 0.5, density: 4 },
  { brightness: 0.25, density: 6 },
];

const tileSize = 100;
