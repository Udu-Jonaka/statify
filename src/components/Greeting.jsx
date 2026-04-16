"use client";

import React, { useEffect, useState } from "react";
import "@/styles/components.css";

const greetingsList = [
  "Welcome back",
  "Vibing today?",
  "Good to see you",
  "Let's see your music",
];

const Greeting = ({ name }) => {
  const [greeting, setGreeting] = useState("Welcome back");

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * greetingsList.length);
    setGreeting(greetingsList[randomIndex]);
  }, []);

  const displayName = name ? name.split(" ")[0] : "Guest";

  return (
    <div className="greetingContainer">
      <h1 className="greetingText">
        {greeting}, <span className="greetingName">{displayName}</span>?
      </h1>
    </div>
  );
};

export default Greeting;
