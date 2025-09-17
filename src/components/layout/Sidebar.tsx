import { NavLink } from "react-router-dom";
import { BarChart2, Bed, Building2, Home, Info } from "lucide-react";

const linkDefault = "relative flex w-full items-center gap-3 pl-4 pr-0 py-2 " + "rounded-none text-slate-700 hover:bg-slate-100 transition";

const linkActive = "relative flex w-full items-center gap-3 pl-4 pr-0 py-2 " + "bg-[#004F6D] text-white font-semibold rounded-none hover:bg-[#004F6D] " + "after:content-[''] after:absolute after:top-0 after:right-0 " + "after:h-full after:w-1.5 after:bg-[#00A67D]";

export default function Sidebar() {
  return (
    <aside
      className="fixed left-4 top-4 bottom-4 md:left-6 md:top-6 md:bottom-6 w-64
                 bg-white rounded-xl overflow-hidden flex flex-col
                 shadow-lg ring-1 ring-slate-200"
    >
      <div className="p-4">
        <h1 className="text-lg font-semibold">Observatório de Saúde</h1>
        <p className="text-xs text-slate-500">Brasil</p>
      </div>

      <div className="h-px w-full bg-slate-200 mb-2" />

      <nav className="px-0 py-1 space-y-1 flex-1 overflow-auto">
        <NavLink to="/" end className={({ isActive }) => (isActive ? linkActive : linkDefault)}>
          <Home size={18} /> Visão Geral
        </NavLink>

        <NavLink to="/estabelecimentos" className={({ isActive }) => (isActive ? linkActive : linkDefault)}>
          <Building2 size={18} /> Estabelecimentos
        </NavLink>

        <NavLink to="/hospitais-leitos" className={({ isActive }) => (isActive ? linkActive : linkDefault)}>
          <Bed size={18} /> Hospitais & Leitos
        </NavLink>

        <NavLink to="/analises" className={({ isActive }) => (isActive ? linkActive : linkDefault)}>
          <BarChart2 size={18} /> Análises
        </NavLink>

        <NavLink to="/sobre" className={({ isActive }) => (isActive ? linkActive : linkDefault)}>
          <Info size={18} /> Sobre
        </NavLink>
      </nav>

      <div className="mt-auto p-4 text-xs text-slate-500">
        <p>Dados: CNES e SUS</p>
        <p>Atualizado em tempo real</p>
      </div>
    </aside>
  );
}
