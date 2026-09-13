import { useLogout } from "@/hooks/useLogout";

export default function StockPage() {
  const logout = useLogout();

  return (
    <div className="">
      <h1>Stock</h1>

      <button onClick={logout}>Sair</button>
    </div>
  );
}
