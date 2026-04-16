"use client";

import React from "react";
import "@/styles/footer.css";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="appFooter">
      <p>©jhaycodes-statify {currentYear}</p>
    </footer>
  );
};

export default Footer;
