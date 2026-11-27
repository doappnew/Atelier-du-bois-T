import { Route, Routes } from "react-router-dom";

function Accueil() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <header className="mb-8 border-b border-beige-300 pb-4">
        <h1 className="font-titre text-3xl text-brun-700">Atelier du Bois</h1>
        <p className="text-brun-500">Meubles artisanaux en bois, faits avec soin.</p>
      </header>
      <a
        href="/catalogue"
        className="inline-block rounded-lg bg-brun-700 px-5 py-3 text-creme hover:bg-brun-900"
      >
        Découvrir nos meubles
      </a>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Accueil />} />
    </Routes>
  );
}
