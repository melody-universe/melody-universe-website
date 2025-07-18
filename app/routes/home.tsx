export default function Home() {
  return (
    <div className="flex h-screen items-center justify-center">
      <h1 className="font-serif text-4xl font-bold">Melody Universe</h1>
    </div>
  );
}

export function meta() {
  return [
    { title: "Melody Universe" },
    { content: "This is my personal website.", name: "description" },
  ];
}
