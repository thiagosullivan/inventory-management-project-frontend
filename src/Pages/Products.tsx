import { useLogout } from "@/hooks/useLogout";

export default function ProductsPage() {
  const logout = useLogout();

  return (
    <div className="">
      <h1>Products</h1>

      <button onClick={logout}>Sair</button>
    </div>
  );
}
