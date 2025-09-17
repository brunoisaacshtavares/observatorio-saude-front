import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export function Shell() {
  return (
    <div className="min-h-dvh bg-slate-50 flex items-start gap-6">
      <Sidebar />
      <div className="shrink-0 w-64 hidden md:block" />
      <main className="flex-1 p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  );
}
