'use client';

import Image from 'next/image';
import { Github, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';


interface Project {
  name: string;
  image: string;
  description: string;
  repo: string;
  website: string;
}

const PROJECTS: Project[] = [
  {
    name: 'Whispr',
    image: '/whispr.png',
    description: 'The truth about IIITH courses & profs',
    repo: 'https://github.com/OSDG-IIITH/whispr',
    website: 'https://osdg.iiit.ac.in/whispr',
  },
  {
    name: 'Forms IIIT',
    image: '/forms.png',
    description: 'Own the forms - IIITH style. No Google & Microsoft fuss',
    repo: 'https://github.com/OSDG-IIITH/forms-portal',
    website: 'https://osdg.iiit.ac.in/forms',
  },
  {
    name: 'Discord CAS',
    image: '/discord.png',
    description: 'User verification on Discord via CAS',
    repo: 'https://github.com/OSDG-IIITH/Discord-CAS',
    website: 'https://osdg.iiit.ac.in/casbot/discord/invite',
  },
];

export default function ProjectCarousel() {
  const [offset, setOffset] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Continuous scrolling animation (pauses on hover)
  useEffect(() => {
    if (isHovered) return;

    const interval = setInterval(() => {
      setOffset((prev) => {
        const cardWidth = 370; // card width + gap
        const totalWidth = PROJECTS.length * cardWidth;

        if (prev <= -totalWidth) {
          return 0;
        }
        return prev - 0.5; // move left by 0.5px per tick
      });
    }, 20); // ~50fps

    return () => clearInterval(interval);
  }, [isHovered]);

  // Triple the array to create seamless loop
  const tripleProjects = [...PROJECTS, ...PROJECTS, ...PROJECTS];

  return (
    <div className="w-full py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-oxanium font-bold text-center text-white mb-12 tracking-tight">
          Our Projects
        </h2>

        {/* Carousel Container */}
        <div className="relative overflow-hidden px-4 pt-4 pb-4" onMouseEnter={() => setIsHovered(true)}
       onMouseLeave={() => setIsHovered(false)}>
          {/* Scrolling Track */}
          <div
            className="flex gap-5"
            style={{
              transform: `translateX(${offset}px)`,
              transition: 'none', // Disable CSS transition for JS-controlled animation
            }}
          >
            {tripleProjects.map((project, index) => (
              <div
                key={`${project.name}-${index}`}
                className="flex-shrink-0 w-[350px] bg-black/40 backdrop-blur-sm rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300"
              >
                {/* Project Image */}
                <div className="relative h-48 w-full bg-gray-900">
                  <Image
                    src={project.image}
                    alt={project.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Project Info */}
                <div className="p-5 space-y-4">
                  <h3 className="text-xl font-oxanium font-bold text-cyan-400">
                    {project.name}
                  </h3>
                  <p className="text-gray-300 text-sm font-mono leading-relaxed">
                    {project.description}
                  </p>

                  {/* Links */}
                  <div className="flex justify-center gap-8 pt-2">
                    <a
                      href={project.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center text-gray-400 hover:text-cyan-400 transition-colors"
                      aria-label={`${project.name} website`}
                    >
                      <ExternalLink className="w-5 h-5 center" />
                      
                    </a>
                    <a
                      href={project.repo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center text-gray-400 hover:text-cyan-400 transition-colors"
                      aria-label={`${project.name} GitHub repository`}
                    >
                      <Github className="w-5 h-5 center" />
                      
                    </a>
                    
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
