"use client";

import React from 'react';
import Image from 'next/image';

interface TeamMember {
  name: string;
  profile_picture_url: string;
  team: string;
  year: string;
}

// Hardcoded coordinators order based on user requirements
const coordinatorOrder = [
  "Gopal Kataria",
  "Arihant Tripathy",
  "Yajat Rahul Rangnekar"
];

const TeamPage: React.FC = () => {
  const [teamMembers, setTeamMembers] = React.useState<TeamMember[]>([]);

  React.useEffect(() => {
    // Load team members from JSON
    fetch('/osdg_members_2025.json')
      .then(res => res.json())
      .then(data => setTeamMembers(data))
      .catch(err => console.error('Error loading team members:', err));
  }, []);

  // Group members by team using the team field directly
  const groupByTeam = (team: string) => {
    return teamMembers
      .filter(member => member.team === team)
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  const coordinatorMembers = groupByTeam('Coordinators');
  const techMembers = groupByTeam('Tech Team');
  const corporateMembers = groupByTeam('Corporate & PR');
  const eventMembers = groupByTeam('Events & Logistics');
  const designMembers = groupByTeam('Social Media & Design');
  const advisorMembers = groupByTeam('Advisors');

  // Sort coordinators in specific order
  const sortedCoordinators = coordinatorMembers.sort((a, b) => {
    const indexA = coordinatorOrder.indexOf(a.name);
    const indexB = coordinatorOrder.indexOf(b.name);
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });

  const MemberCard = ({ member, showRole = false }: { member: TeamMember; showRole?: boolean }) => (
    <div className="flex flex-col items-center group">
      <div className="relative w-64 h-64 mb-4 rounded-full overflow-hidden border-2 border-cyan-500/30 group-hover:border-cyan-400 transition-all duration-300">
        <Image
          src={member.profile_picture_url}
          alt={member.name}
          fill
          className="object-cover"
        />
      </div>
      <h3 className="text-cyan-400 font-semibold text-center text-lg font-oxanium">{member.name}</h3>
      {showRole && <p className="text-gray-400 text-sm text-center font-oxanium">{member.team}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white py-20 px-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto text-center mb-20">
        <h1 className="text-6xl font-bold mb-4 text-cyan-400 font-oxanium">
          The Crew
        </h1>
        <p className="text-xl text-gray-400 font-oxanium">
          Making systems. Breaking Norms.
        </p>
      </div>

      {/* Coordinators Section */}
      <div className="max-w-7xl mx-auto mb-20">
        <h2 className="text-4xl font-bold text-center mb-16 text-cyan-400 font-oxanium">
          Coordinators
        </h2>
        <div className="flex justify-center gap-24 flex-wrap">
          {sortedCoordinators.map((member, idx) => (
            <MemberCard key={idx} member={member} />
          ))}
        </div>
      </div>

      {/* Tech Members */}
      {techMembers.length > 0 && (
        <div className="max-w-7xl mx-auto mb-20">
          <h2 className="text-4xl font-bold text-center mb-16 text-cyan-400 font-oxanium">
            Tech Team
          </h2>
          <div className="flex flex-wrap justify-center gap-12">
            {techMembers.map((member, idx) => (
              <MemberCard key={idx} member={member} />
            ))}
          </div>
        </div>
      )}

      {/* Corporate & PR */}
      {corporateMembers.length > 0 && (
        <div className="max-w-7xl mx-auto mb-20">
          <h2 className="text-4xl font-bold text-center mb-16 text-cyan-400 font-oxanium">
            Corporate & PR
          </h2>
          <div className="flex flex-wrap justify-center gap-12">
            {corporateMembers.map((member, idx) => (
              <MemberCard key={idx} member={member} />
            ))}
          </div>
        </div>
      )}

      {/* Events & Logistics */}
      {eventMembers.length > 0 && (
        <div className="max-w-7xl mx-auto mb-20">
          <h2 className="text-4xl font-bold text-center mb-16 text-cyan-400 font-oxanium">
            Events & Logistics
          </h2>
          <div className="flex flex-wrap justify-center gap-12">
            {eventMembers.map((member, idx) => (
              <MemberCard key={idx} member={member} />
            ))}
          </div>
        </div>
      )}

      {/* Design Team */}
      {designMembers.length > 0 && (
        <div className="max-w-7xl mx-auto mb-20">
          <h2 className="text-4xl font-bold text-center mb-16 text-cyan-400 font-oxanium">
            Social Media & Design
          </h2>
          <div className="flex flex-wrap justify-center gap-12">
            {designMembers.map((member, idx) => (
              <MemberCard key={idx} member={member} />
            ))}
          </div>
        </div>
      )}

      {/* Advisors */}
      {advisorMembers.length > 0 && (
        <div className="max-w-7xl mx-auto mb-20">
          <h2 className="text-4xl font-bold text-center mb-16 text-cyan-400 font-oxanium">
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
