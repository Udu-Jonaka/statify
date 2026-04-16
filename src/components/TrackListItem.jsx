import React from "react";
import Image from "next/image";
import { FaPlay } from "react-icons/fa";
import "@/styles/components.css";

const TrackListItem = ({ rank, imageUrl, name, artists }) => {
  return (
    <div className="trackRow">
      <div className="trackNumberContainer">
        <span className="trackNumber">{rank}</span>
        <FaPlay className="trackPlayIcon" />
      </div>
      <div className="trackInfo">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={`${name} by ${artists}`}
            width={48}
            height={48}
            className="trackImage"
          />
        ) : (
          <div className="trackImage" />
        )}
        <div className="trackDetails">
          <span className="trackTitle">{name}</span>
          <span className="trackArtist">{artists}</span>
        </div>
      </div>
    </div>
  );
};

export default TrackListItem;
