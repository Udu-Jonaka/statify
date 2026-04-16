import React from "react";
import Link from "next/link";
import Image from "next/image";
import { FaPlay } from "react-icons/fa";
import "@/styles/dashboard-grid.css";

const GridCard = ({ title, href, imageUrl }) => {
  return (
    <Link href={href} className="gridCard">
      <div className="cardImageWrapper">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="cardImage"
          />
        )}
        <div className="playOverlay">
          <FaPlay className="playIcon" />
        </div>
      </div>
      <h3 className="cardTitle">{title}</h3>
    </Link>
  );
};

export default GridCard;
