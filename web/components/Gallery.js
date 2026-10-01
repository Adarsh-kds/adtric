"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function Gallery({ images, name }) {
  const [openIndex, setOpenIndex] = useState(null);

  const close = () => setOpenIndex(null);
  const showNext = () => setOpenIndex((openIndex + 1) % images.length);
  const showPrevious = () => setOpenIndex((openIndex - 1 + images.length) % images.length);

  useEffect(() => {
    if (openIndex === null) {
      return;
    }

    const handleKey = (event) => {
      if (event.key === "Escape") setOpenIndex(null);
      if (event.key === "ArrowRight") setOpenIndex((index) => (index + 1) % images.length);
      if (event.key === "ArrowLeft") setOpenIndex((index) => (index - 1 + images.length) % images.length);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [openIndex, images.length]);

  return (
    <>
      <div
        className={`grid grid-cols-2 gap-3 ${
          images.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3"
        }`}
      >
        {images.map((image, index) => (
          <button
            key={image}
            type="button"
            onClick={() => setOpenIndex(index)}
            className="group relative aspect-[4/3] cursor-zoom-in overflow-hidden bg-surface"
            aria-label={`Open image ${index + 1} of ${name}`}
          >
            <Image
              src={image}
              alt={`${name} image ${index + 1}`}
              fill
              sizes="(min-width: 768px) 33vw, 50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {openIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`${name} gallery`}
          onClick={close}
        >
          <div
            className="relative h-[80vh] w-full max-w-5xl"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={images[openIndex]}
              alt={`${name} image ${openIndex + 1}`}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>

          <button type="button" onClick={close} className="btn btn-white absolute right-4 top-4 !h-10">
            Close
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  showPrevious();
                }}
                className="btn btn-gray absolute left-4 top-1/2 !h-12 !w-12 !px-0"
                aria-label="Previous image"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  showNext();
                }}
                className="btn btn-gray absolute right-4 top-1/2 !h-12 !w-12 !px-0"
                aria-label="Next image"
              >
                ›
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
