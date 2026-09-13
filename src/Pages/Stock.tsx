import Sidebar from "@/components/Sidebar";
import { useLogout } from "@/hooks/useLogout";

export default function StockPage() {
  const logout = useLogout();

  return (
    <div className="">
      <Sidebar />
      <h1>Stock</h1>

      <button onClick={logout}>Sair</button>
    </div>
  );
}
