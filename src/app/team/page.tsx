"use client";

import React from 'react';
import Image from 'next/image';

interface TeamMember {
  name: string;
  profile_picture_url: string;
  full_text: string;
  team: string;
  year: string;
}

// Hardcoded coordinators based on user requirements
const coordinators = [
  { name: "Gopal Kataria", role: "Tech" },
  { name: "Arihant Tripathy", role: "Tech" },
  { name: "Yajat Rahul Rangnekar", role: "Corporate & PR" }
];

const TeamPage: React.FC = () => {
  const [teamMembers, setTeamMembers] = React.useState<TeamMember[]>([]);

  React.useEffect(() => {
    // Load team members from JSON
    fetch('/osdg_members_2025.json')
      .then(res => res.json())
      .then(data => {
        // Remove duplicates by name
        const uniqueMembers = data.reduce((acc: TeamMember[], member: TeamMember) => {
          if (!acc.find(m => m.name === member.name)) {
            acc.push(member);
          }
          return acc;
        }, []);
        setTeamMembers(uniqueMembers);
      })
      .catch(err => console.error('Error loading team members:', err));
  }, []);

  // Group members by role
  const groupByRole = (role: string) => {
    return teamMembers
      .filter(member => {
        const fullText = member.full_text.toLowerCase();
        if (role === 'Coordinators') {
          return fullText.includes('coordinator') || fullText.includes('point of contact');
        } else if (role === 'Tech') {
          return fullText.includes('tech team');
        } else if (role === 'Corporate & PR') {
          return fullText.includes('corporate') || fullText.includes('pr');
        } else if (role === 'Events') {
          return fullText.includes('events') || fullText.includes('logistics');
        } else if (role === 'Design') {
          return fullText.includes('design') || fullText.includes('social media');
        } else if (role === 'Advisors') {
          return fullText.includes('advisor');
        }
        return false;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  const coordinatorMembers = groupByRole('Coordinators');
  const techMembers = groupByRole('Tech').filter(m => !m.full_text.toLowerCase().includes('coordinator'));
  const corporateMembers = groupByRole('Corporate & PR').filter(m => !m.full_text.toLowerCase().includes('coordinator'));
  const eventMembers = groupByRole('Events');
  const designMembers = groupByRole('Design');
  const advisorMembers = groupByRole('Advisors');

  const MemberCard = ({ member, showRole = false }: { member: TeamMember; showRole?: boolean }) => (
    <div className="flex flex-col items-center group">
      <div className="relative w-48 h-48 mb-4 rounded-full overflow-hidden border-2 border-green-500/30 group-hover:border-green-400 transition-all duration-300">
        <Image
          src={member.profile_picture_url}
          alt={member.name}
          fill
          className="object-cover"
        />
      </div>
      <h3 className="text-green-400 font-semibold text-center text-lg font-oxanium">{member.name}</h3>
      {showRole && <p className="text-gray-400 text-sm text-center font-oxanium">{member.team}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white py-20 px-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto text-center mb-20">
        <h1 className="text-6xl font-bold mb-4 text-green-400 font-oxanium">
          The Crew
        </h1>
        <p className="text-xl text-gray-400 font-oxanium">
          Making systems. Breaking Norms.
        </p>
      </div>

      {/* Coordinators Section */}
      <div className="max-w-7xl mx-auto mb-20">
        <h2 className="text-4xl font-bold text-center mb-16 text-green-400 font-oxanium">
          Coordinators
        </h2>
        <div className="flex justify-center gap-24 flex-wrap">
          {coordinatorMembers.filter(m => coordinators.some(c => c.name === m.name)).map((member, idx) => (
            <MemberCard key={idx} member={member} showRole />
          ))}
        </div>
      </div>

      {/* Tech Members */}
      {techMembers.length > 0 && (
        <div className="max-w-7xl mx-auto mb-20">
          <h2 className="text-4xl font-bold text-center mb-16 text-green-400 font-oxanium">
            Tech Team
          </h2>
          <div className="flex justify-center">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12">
              {techMembers.map((member, idx) => (
                <MemberCard key={idx} member={member} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Corporate & PR */}
      {corporateMembers.length > 0 && (
        <div className="max-w-7xl mx-auto mb-20">
          <h2 className="text-4xl font-bold text-center mb-16 text-green-400 font-oxanium">
            Corporate & PR
          </h2>
          <div className="flex justify-center">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12">
              {corporateMembers.map((member, idx) => (
                <MemberCard key={idx} member={member} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Events & Logistics */}
      {eventMembers.length > 0 && (
        <div className="max-w-7xl mx-auto mb-20">
          <h2 className="text-4xl font-bold text-center mb-16 text-green-400 font-oxanium">
            Events & Logistics
          </h2>
          <div className="flex justify-center">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12">
              {eventMembers.map((member, idx) => (
                <MemberCard key={idx} member={member} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Design Team */}
      {designMembers.length > 0 && (
        <div className="max-w-7xl mx-auto mb-20">
          <h2 className="text-4xl font-bold text-center mb-16 text-green-400 font-oxanium">
            Social Media & Design
          </h2>
          <div className="flex justify-center">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12">
              {designMembers.map((member, idx) => (
                <MemberCard key={idx} member={member} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Advisors */}
      {advisorMembers.length > 0 && (
        <div className="max-w-7xl mx-auto mb-20">
          <h2 className="text-4xl font-bold text-center mb-16 text-green-400 font-oxanium">
            Advisors
          </h2>
          <div className="flex justify-center gap-24 flex-wrap">
            {advisorMembers.map((member, idx) => (
              <MemberCard key={idx} member={member} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamPage;
