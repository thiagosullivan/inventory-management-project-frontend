import React from "react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="text-center py-3 border-t mt-10">
      <p>
        &#169; {currentYear} | Developed by
        <a href="https://google.com.br">
          <strong> ATS Web Solutions</strong>. All Rights Reserved
        </a>
      </p>
    </footer>
  );
}
