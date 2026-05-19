import type { ReactNode } from "react";
import Sidebar from "@/components/admin/Sidebar";

export const metadata = { title: "HAYAA Admin" };

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F5F5F5" }}>
      <Sidebar />
      <div style={{ flex: 1, overflow: "auto" }}>
        <div style={{ padding: "2rem" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
