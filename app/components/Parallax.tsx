import { type ReactNode, useEffect, useRef } from "react";

type Layer = {
  definition: LayerDefinition;
  stars: Star[];
  verticalDistanceTraveled: number;
  viewPort: { height: number; width: number };
};

type LayerDefinition = {
  brightness: number;
  density: number;
  index: number;
  radius: number;
  speed: number;
};

export function Parallax(): ReactNode {
  const graphicsRef = useRef<SVGGElement>(null);

  const layersRef = useRef<Layer[]>(
    layerDefinitions.map((definition) => ({
      definition,
      stars: [],
      verticalDistanceTraveled: 0,
      viewPort: { height: 0, width: 0 },
    })),
  );
  const layers = layersRef.current;

  useEffect(function renderStars() {
    let handle = requestAnimationFrame(handleNewFrame);
    let startTime = performance.now();

    function handleNewFrame(endTime: number) {
      const elapsedTime = endTime - startTime;

      render();

      startTime = endTime;
      handle = requestAnimationFrame(handleNewFrame);

      function render() {
        const graphics = graphicsRef.current;
        if (!graphics) {
          return;
        }

        const screenWidth = document.body.clientWidth;
        const screenHeight = document.body.clientHeight;

        addMissingStars(graphics);
        animate();

        function addMissingStars(graphics: SVGGElement) {
          for (const layer of layers) {
            const { viewPort } = layer;

            let initialHeight = viewPort.height;
            if (layer.verticalDistanceTraveled >= tileSize) {
              const heightToRender =
                Math.floor(layer.verticalDistanceTraveled / tileSize) *
                tileSize;
              initialHeight -= heightToRender;
              layer.verticalDistanceTraveled -= heightToRender;
            }
            const initialWidth = viewPort.width;

            viewPort.height = Math.max(
              initialHeight,
              Math.ceil((screenHeight + maxRadius) / tileSize + 1) * tileSize,
            );

            viewPort.width = Math.max(
              initialWidth,
              Math.ceil((screenWidth + maxRadius) / tileSize + 1) * tileSize,
            );

            for (let baseY = 0; baseY < viewPort.height; baseY += tileSize) {
              for (let baseX = 0; baseX < viewPort.width; baseX += tileSize) {
                if (baseY >= initialHeight || baseX >= initialWidth) {
                  for (let i = 0; i < layer.definition.density; i++) {
                    layer.stars.push(
                      createStar(
                        layer.definition,
                        graphics,
                        baseX + Math.random() * tileSize,
                        baseY + Math.random() * tileSize,
                      ),
                    );
                  }
                }
              }
            }
          }
        }

        function animate() {
          for (const layer of layers) {
            const offset = layer.definition.speed * (elapsedTime / 1000);
            layer.verticalDistanceTraveled += offset;

            for (let i = 0; i < layer.stars.length; i++) {
              const star = layer.stars[i];
              const offset = star.speed * (elapsedTime / 1000);
              star.y -= offset;

              if (star.y + layer.definition.radius < 0) {
                layer.stars.splice(i, 1);
                i--;
                continue;
              }

              if (
                star.y <= screenHeight + maxRadius &&
                star.x <= screenWidth + maxRadius
              ) {
                star.circle.style.display = "";
                star.circle.setAttribute("cy", star.y.toString());
              } else {
                star.circle.style.display = "none";
              }
            }
          }
        }
      }
    }

    return () => cancelAnimationFrame(handle);
  }, []);

  return (
    <div className="absolute top-0 left-0 -z-10">
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

const colors = 10;

const densityTileSize = 100;
const scatterCoefficient = 3;
const speedVariance = 0.8;

const tileSize = densityTileSize * Math.sqrt(scatterCoefficient);

const layerDefinitions: LayerDefinition[] = [
  { brightness: 1, density: 1, radius: 2.5, speed: 4 },
  { brightness: 0.5, density: 2, radius: 2, speed: 2 },
  { brightness: 0.25, density: 3, radius: 1.5, speed: 1 },
].map((definition, index) => ({
  ...definition,
  density: definition.density * scatterCoefficient,
  index,
}));

const maxRadius = Math.max(...layerDefinitions.map((d) => d.radius));

type Star = {
  animationDelay: number;
  circle: SVGCircleElement;
  color: number;
  speed: number;
  x: number;
  y: number;
};

function createStar(
  layerDefinition: LayerDefinition,
  graphics: SVGGElement,
  x: number,
  y: number,
): Star {
  const animationDelay = Math.random() * 2;
  const color = Math.floor(Math.random() * colors);

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
    speed:
      layerDefinition.speed -
      (speedVariance * layerDefinition.speed) / 2 +
      Math.random() * speedVariance * layerDefinition.speed,
    x,
    y,
  };
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
