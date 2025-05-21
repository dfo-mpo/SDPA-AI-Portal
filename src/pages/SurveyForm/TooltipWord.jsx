'use client';
import { useState } from "react";

export default function TooltipWord({ word, tooltip }) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseEnter = () => setVisible(true);

  const handleMouseMove = (e) => {
    setPosition({
      x: e.clientX + 10,
      y: e.clientY + 10,
    });
  };

  const handleMouseLeave = () => setVisible(false);

  return (
    <>
      <span
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="cursor-help font-bold underline underline-offset-2"
      >
        {word}
      </span>

      {visible && (
        <div
          className="fixed bg-gray-800 text-white text-sm p-2 rounded shadow-lg z-50 pointer-events-none"
          style={{ top: `${position.y}px`, left: `${position.x}px` }}
        >
          {tooltip}
        </div>
      )}
    </>
  );
}

// export default function TooltipWord({ word, tooltip }) {
//   return (
//     <span className="relative group cursor-help font-bold underline underline-offset-2">
//       {word}
//       <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 w-64 font-medium text-white bg-gray-800 rounded p-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
//         {tooltip}
//       </span>
//     </span>
//   );
// }
