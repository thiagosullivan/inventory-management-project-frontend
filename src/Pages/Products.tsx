import Sidebar from "@/components/Sidebar";
import { useLogout } from "@/hooks/useLogout";

export default function ProductsPage() {
  const logout = useLogout();

  return (
    <div className="">
      <Sidebar />
      <h1>Products</h1>

      <button onClick={logout}>Sair</button>
    </div>
  );
}
