export default function Home() {
  return (
    <div className="flex h-screen items-center justify-center">
      <h1 className="font-serif text-4xl font-bold">Melody Universe</h1>
    </div>
  );
}

export function meta() {
  return [
    { title: "New React Router App" },
    { content: "Welcome to React Router!", name: "description" },
  ];
}
