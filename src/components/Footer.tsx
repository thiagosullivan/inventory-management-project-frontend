export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="text-center py-3 border-t mt-10">
      <p>
        &#169; {currentYear} | Desenvolvido por
        <a href="https://google.com.br">
          <strong> ATS Web Solutions</strong>. Todos os direitos reservados
        </a>
      </p>
    </footer>
  );
}
