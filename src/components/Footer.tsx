export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="text-center p-3 border-t text-xs md:text-sm lg:text-base">
      <p>
        &#169; {currentYear} | Desenvolvido por
        <a href="https://google.com.br">
          <strong> ATS Web Solutions</strong>. Todos os direitos reservados
        </a>
      </p>
    </footer>
  );
}
