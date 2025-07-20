import { twMerge } from "tailwind-merge";

export default function Home() {
  return (
    <div className="flex h-screen items-center justify-center">
      <h1
        className={twMerge(
          "bg-gray-950/90 p-1 text-4xl",
          "shadow-[0_0_12px_12px_rgba(3,7,18,0.9)]",
        )}
      >
        Melody Universe
      </h1>
    </div>
  );
}

export function meta() {
  return [
    { title: "Melody Universe" },
    { content: "This is my personal website.", name: "description" },
  ];
}
