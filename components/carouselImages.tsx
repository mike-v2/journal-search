'use client';

import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel as ResponsiveCarousel } from 'react-responsive-carousel';
import { useEffect } from "react";
import Image from "next/image";


const imagePaths = ["/images/images_interesting/immediate family/1935-0609.jpg", "/images/images_interesting/immediate family/Ardie-1.jpg", "/images/images_interesting/immediate family/Ardie-2.jpg", "/images/images_interesting/immediate family/Ardie-3.jpg", "/images/images_interesting/immediate family/Dorothy-1.jpg", "/images/images_interesting/immediate family/Grace-1.jpg", "/images/images_interesting/immediate family/Grace-Sharon-Sonny-Charles.jpg", "/images/images_interesting/immediate family/Harry-1.jpg", "/images/images_interesting/immediate family/Harry-2.jpg", "/images/images_interesting/immediate family/Harry-Grace-1.jpg", "/images/images_interesting/immediate family/Harry-small.jpg", "/images/images_interesting/immediate family/Sharon-1.jpg", "/images/images_interesting/immediate family/hand-Ardie.jpg", "/images/images_interesting/immediate family/hand-Betty.jpg", "/images/images_interesting/immediate family/hand-Dorothy.jpg", "/images/images_interesting/immediate family/hand-Sharon.jpg", "/images/images_interesting/immediate family/page-0145.jpg", "/images/images_interesting/immediate family/page-0191.jpg", "/images/images_interesting/immediate family/page-0203.jpg", "/images/images_interesting/immediate family/page-0343.jpg", "/images/images_interesting/immediate family/page-0516.jpg", "/images/images_interesting/immediate family/page-0609.jpg", "/images/images_interesting/immediate family/page-0669.jpg", "/images/images_interesting/immediate family/page-0762.jpg", "/images/images_interesting/immediate family/page-0764.jpg", "/images/images_interesting/immediate family/page-0769.jpg", "/images/images_interesting/page-0021.jpg", "/images/images_interesting/page-0119.jpg", "/images/images_interesting/page-0180.jpg", "/images/images_interesting/page-0192.jpg", "/images/images_interesting/page-0226.jpg", "/images/images_interesting/page-0248.jpg", "/images/images_interesting/page-0263.jpg", "/images/images_interesting/page-0275.jpg", "/images/images_interesting/page-0300.jpg", "/images/images_interesting/page-0315.jpg", "/images/images_interesting/page-0384.jpg", "/images/images_interesting/page-0385.jpg", "/images/images_interesting/page-0388.jpg", "/images/images_interesting/page-0389.jpg", "/images/images_interesting/page-0431.jpg", "/images/images_interesting/page-0526.jpg", "/images/images_interesting/page-0528.jpg", "/images/images_interesting/page-0610.jpg", "/images/images_interesting/page-0613.jpg", "/images/images_interesting/page-0617.jpg", "/images/images_interesting/page-0628.jpg", "/images/images_interesting/page-0653.jpg", "/images/images_interesting/page-0775.jpg"];

export default function Carousel() {
  return (
    <div className="max-w-xl mx-auto border-2 border-black w-11/12 p-4">
      <ResponsiveCarousel autoPlay={true} infiniteLoop={true} interval={7000} transitionTime={1500} showThumbs={false} showIndicators={false}>
        {imagePaths && imagePaths.map((imagePath) => (
          <div className="" key={imagePath.substring(imagePath.length - 10)}>
            <Image src={imagePath} width={400} height={500} alt={imagePath.substring(imagePath.length - 10)} />
          </div>
        ))}
      </ResponsiveCarousel>
    </div>
  );
}
