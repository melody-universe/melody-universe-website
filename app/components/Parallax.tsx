import { type ReactNode, useEffect, useRef } from "react";

type Layer = {
  definition: LayerDefinition;
  tiles: Tile[][];
};

type LayerDefinition = {
  brightness: number;
  density: number;
  index: number;
  radius: number;
};

type Tile = {
  offset: number;
  stars: Star[];
};

export function Parallax(): ReactNode {
  const graphicsRef = useRef<SVGGElement>(null);

  const stateRef = useRef<{
    layers: Layer[];
    visible: { height: number; width: number };
  }>({
    layers: layerDefinitions.map((definition) => ({ definition, tiles: [] })),
    visible: { height: 0, width: 0 },
  });
  const { layers, visible } = stateRef.current;

  useEffect(function renderStars() {
    let handle = requestAnimationFrame(handleNewFrame);
    // let startTime = performance.now();

    function handleNewFrame(/* endTime: number */) {
      // const elapsedTime = endTime - startTime;

      render();

      // startTime = endTime;
      handle = requestAnimationFrame(handleNewFrame);

      function render() {
        const graphics = graphicsRef.current;
        if (!graphics) {
          return;
        }

        const screenWidth = document.body.clientWidth;
        const screenHeight = document.body.clientHeight;

        const initialHeight = visible.height;
        const initialWidth = visible.width;

        addMissingTiles(graphics);

        function addMissingTiles(graphics: SVGGElement) {
          if (initialHeight * tileSize <= screenHeight) {
            visible.height = Math.ceil(1 + screenHeight / tileSize);

            for (const layer of layers) {
              for (let tileY = initialHeight; tileY < visible.height; tileY++) {
                layer.tiles.push([]);

                for (let tileX = 0; tileX < initialWidth; tileX++) {
                  layer.tiles[tileY].push(
                    createTile(layer.definition, graphics, tileX, tileY),
                  );
                }
              }
            }
          }

          if (initialWidth * tileSize <= screenWidth) {
            visible.width = Math.ceil(1 + screenWidth / tileSize);

            for (const layer of layers) {
              for (let tileY = 0; tileY < visible.height; tileY++) {
                for (let tileX = initialWidth; tileX < visible.width; tileX++) {
                  layer.tiles[tileY].push(
                    createTile(layer.definition, graphics, tileX, tileY),
                  );
                }
              }
            }
          }
        }
      }
    }

    return () => cancelAnimationFrame(handle);
  }, []);

  return (
    <div className="absolute top-0 left-0">
      <div className="h-screen w-screen overflow-hidden">
        <svg
          className="h-full min-h-screen w-full min-w-screen"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {layerDefinitions.map((layer, layerIndex) =>
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
          <g ref={graphicsRef} />
        </svg>
      </div>
    </div>
  );
}

const layerDefinitions: LayerDefinition[] = [
  { brightness: 1, density: 1, radius: 2.5 },
  { brightness: 0.5, density: 2, radius: 2 },
  { brightness: 0.25, density: 3, radius: 1.5 },
].map((definition, index) => ({ ...definition, index }));

const colors = 10;

const tileSize = 100;

type Star = {
  animationDelay: number;
  circle: SVGCircleElement;
  color: number;
  x: number;
  y: number;
};

function createTile(
  layerDefinition: LayerDefinition,
  graphics: SVGGElement,
  tileX: number,
  tileY: number,
): Tile {
  return {
    offset: 0,
    stars: Array.from({
      length: layerDefinition.density,
    }).map(() => createStar()),
  };

  function createStar(): Star {
    const animationDelay = Math.random() * 2;
    const color = Math.floor(Math.random() * colors);
    const x = (tileX + Math.random()) * tileSize;
    const y = (tileY + Math.random()) * tileSize;

    const circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle",
    );
    circle.classList.add("animate-pulse");
    circle.setAttribute("cx", x.toString());
    circle.setAttribute("cy", y.toString());
    circle.setAttribute(
      "fill",
      `url(#layer-${layerDefinition.index}-color-${color})`,
    );
    circle.setAttribute("r", layerDefinition.radius.toString());
    circle.style.animationDelay = `${animationDelay}s`;

    graphics.append(circle);

    return {
      animationDelay,
      circle,
      color,
      x,
      y,
    };
  }
}

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
