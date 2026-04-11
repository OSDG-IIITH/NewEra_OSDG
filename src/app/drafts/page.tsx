'use client';

import React from 'react';
import Link from 'next/link';
import { ExternalLink, User } from 'lucide-react';
import teamData from '../../../public/osdg_members_2025.json';
import AudioVisualizer from '@/components/AudioVisualizer';

interface BlogPostProps {
  title: string;
  author: string;
  date: string;
  children: React.ReactNode;
}

const getAuthorImage = (name: string) => {
  const member = teamData.find(m => m.name === name);
  return member?.profile_picture_url || undefined;
};

const BlogPost = ({ title, author, date, children }: BlogPostProps) => {
  const authorImage = getAuthorImage(author);

  return (
    <article className="mb-16 relative group">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-oxanium font-bold text-cyan-400 mb-6">
        {title}
      </h2>
      
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-800">
        <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-cyan-500/30 bg-gray-900 flex items-center justify-center">
          {authorImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={authorImage} alt={author} className="object-cover w-full h-full" />
          ) : (
            <User className="w-6 h-6 text-gray-400" />
          )}
        </div>
        <div>
          <p className="font-oxanium font-semibold text-white text-lg">{author}</p>
          <p className="text-gray-400 text-sm font-mono">{date}</p>
        </div>
      </div>
      
      <div className="prose prose-invert prose-cyan max-w-none text-gray-300 font-oxanium space-y-6">
        {children}
      </div>
    </article>
  );
};

export default function UpdatesPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl lg:max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-oxanium font-bold text-white mb-4">
            Updates
          </h1>
          <p className="text-cyan-400 text-lg sm:text-xl font-medium tracking-wide">
            A weekly view on everything exciting & edge.
          </p>
        </div>

        {/* Blog Feed (Newest First) */}
        <div className="flex flex-col gap-8">
          
          {/* Newest Blog */}
          <BlogPost 
            title="Will you understand it before someone uses it on you? [Under Draft]" 
            author="Abhinav P V" 
            date="April 11, 2026"
          >
            <p className="text-base sm:text-lg leading-relaxed">
              We stand at an inflection point – we have amongst us tools that can democratise knowledge & accelerate skills & discovery but also carry within them seeds of misuse & harm. Today I am making a case for why seeing & hearing is no longer believing.
            </p>

            <h3 id="the-clone" className="text-xl sm:text-2xl mt-8 mb-4 font-bold text-white scroll-mt-24">The clone</h3>
            <p className="text-base sm:text-lg leading-relaxed">
              Voice cloning & face synthesis have crossed over from fiction to reality. Here’s a demonstration: an audio clip of a friend of mine – Actual & AI Generated Clone. This required only 10 seconds of actual audio clip (a low quality one at that) & yet the o/p is astounding. The intonation is more than a mirror – it seems real. This was done using Qwen-TTS, an open source model by Alibaba cloud. (yes, the Chinese aren’t just sitting around). The entire thing just took me under a minute & cost nothing.
            </p>

            {/* Tech-centered dual audio format */}
            <div className="my-10 p-6 md:p-10 rounded-3xl bg-gradient-to-b from-gray-900/50 to-black/80 border border-gray-800">
              <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24 relative">
                <AudioVisualizer src="/Actual.mp3" title="Actual" />
                
                {/* Vertical Divider (Hidden on mobile, visible on md+) */}
                <div className="hidden md:block w-[1px] h-48 bg-gradient-to-b from-transparent via-cyan-500/50 to-transparent"></div>
                
                {/* Horizontal Divider (Visible on mobile, hidden on md+) */}
                <div className="md:hidden h-[1px] w-full bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent my-4"></div>

                <AudioVisualizer src="/Clone.mp3" title="Voice Clone" />
              </div>
            </div>

            <p className="text-base sm:text-lg leading-relaxed">
              Case in point - For the eyes: tom cruise brad pitt fight scene (this was a video released by ByteDance using their Seedance 2.0 (Video + Audio model) : This is precisely: convincing. (made in matter of mins)
            </p>

            {/* Video Integration strictly below */}
            <div className="my-8">
              <video 
                src="/action_seq.mp4" 
                controls 
                className="w-full rounded-2xl border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.1)] object-cover"
                poster=""
              >
                Your browser does not support the video tag.
              </video>
            </div>

            <p className="text-base sm:text-lg leading-relaxed">
              We have seen such things happen only in science fiction until now, but lo & behold – anybody can do it right here right now. The reason to demonstrate this is to bring awareness - Ppl like us exposed to & working at the bleeding edge of tech – we have a responsibility & obligation to bring awareness, to translate what we see into terms for the people we love – to our friends, the genral public, parents, grand-parents before bad actors do it for us and to far worse effects. This is not a call to alarms or to arms. It’s a call to awareness.
            </p>

            <h3 id="call-forward-hack" className="text-xl sm:text-2xl mt-8 mb-4 font-bold text-white scroll-mt-24">The Call Forward Hack</h3>
            <p className="text-base sm:text-lg leading-relaxed">
              A recent incident is worth revisiting. A faculty here received a call – identified as BlueDart by TrueCaller, no spam flag – and was prompted to dial <code className="bg-gray-800 text-cyan-300 px-1 py-0.5 rounded">*21*{"{10 digit mobile no.}"}#</code> - this is standard USSD code for unconditional call forwarding. Once done, every call, message & OTP gets routed to the attackers number – the victim gets no notification, sees no change & has no indication anything is wrong. Whatsapp a/c too gets hacked. If you want to be certain, to disable all call forwardings on your device past or present – dial <code className="bg-gray-800 text-cyan-300 px-1 py-0.5 rounded">##002#</code>
            </p>
            <p className="text-base sm:text-lg leading-relaxed text-gray-400 italic">
              Thanks to Prof. MK for promptly bringing this to our attention.
            </p>

            <h3 id="on-evidence-and-next" className="text-xl sm:text-2xl mt-8 mb-4 font-bold text-white scroll-mt-24">On Evidence, and Next</h3>
            <p className="text-base sm:text-lg leading-relaxed">
              Judicial frameworks across is being forced into rapid revisions. Digital evidences once traedted as ground truth is becoming increasingly difficult to authenticate. The tools to address these are being built in labs, in institutes, in collaborations like the ones many of us are part of, the work is ongoing but needs to be accelerated.
            </p>
            <p className="text-base sm:text-lg leading-relaxed">
              In the days to come, the tools will mature. The attacks will grow subtler & convincing. What must grow with them is our vigilance & responsibility towards each other. And most importantly stay grounded in the physical – in the trust built face to face & in the real conversations than just keep to the digital realm where things can be intercepted, fabricated & weaponised.
            </p>

            <p className="text-base sm:text-lg leading-relaxed">
              Stay aware & informed.<br />
              Welcome to Yesterday’s Tomorrow
            </p>

            <div className="mt-8 pt-6 border-t border-gray-800 text-xs sm:text-sm text-gray-500 italic">
              Disclaimer: Neither the author, the club, nor the institute bears responsibility for any action an individual may undertake inspired from this. This piece is solely in the interest of general public.
            </div>
          </BlogPost>

          {/* Older Blog (The existing Guide content) */}
          <BlogPost 
            title="Getting Started with FOSS" 
            author="Vedant Kulkarni" 
            date="November 9, 2025"
          >
            <p className="text-base sm:text-lg leading-relaxed">
              Free software means that the users have the freedom to run, edit, contribute to, and share the software. 
              Thus, <span className="text-cyan-400 font-semibold">free software is a matter of liberty, not price.</span>
            </p>
            <p className="text-base sm:text-lg leading-relaxed">
              Check out the{' '}
              <a
                href="https://opensource.org/osd"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 underline decoration-cyan-400/50 hover:decoration-cyan-300 transition-colors inline-flex items-center gap-1"
              >
                definition of open source
                <ExternalLink className="w-4 h-4" />
              </a>
              , and{' '}
              <a
                href="https://opensource.com/resources/what-open-source"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 underline decoration-cyan-400/50 hover:decoration-cyan-300 transition-colors inline-flex items-center gap-1"
              >
                this article
                <ExternalLink className="w-4 h-4" />
              </a>
              {' '}for why it is so cool :)
            </p>
            <p className="text-base sm:text-lg leading-relaxed">
              Open source is often the invisible but critical foundation of everything we build and use today:{' '}
              <span className="text-gray-400 font-mono text-sm sm:text-base">
                linux, freebsd, ffmpeg, vlc, harfbuzz, nginx, openssh, harper, postgres, opencv, rust, node, python, go, pytorch, git, gitlab,
              </span>{' '}
              and even the <span className="text-cyan-400">IIIT Hyderabad Mess Portal</span>!
            </p>

            <h3 className="text-2xl sm:text-3xl font-bold text-white mt-10 mb-4">
              But Where Do I Start?
            </h3>
            <p className="text-base sm:text-lg leading-relaxed mb-4">
              This is the most common hurdle. You&apos;re excited, you want to contribute, but the world of open source seems vast and intimidating. 
              The idea of cloning a massive, unfamiliar repository and trying to fix a bug feels alien and overwhelming.
            </p>
            <p className="text-base sm:text-lg leading-relaxed mb-8">
              If you feel this way, <span className="text-cyan-400 font-semibold">you are not alone</span>. Let&apos;s reframe the entire approach.
            </p>

            <div className="space-y-4 bg-cyan-500/5 border border-cyan-500/20 rounded-lg p-6 md:p-8 mb-8">
              <h3 className="text-2xl sm:text-3xl font-bold text-cyan-400 mb-4">
                Start with Yourself
              </h3>
              <p className="text-base sm:text-lg leading-relaxed">
                Forget about contributing to a massive project for a moment. The best, most meaningful, and most sustainable contributions 
                begin with things that <span className="text-white font-semibold">you use</span>. The goal is to solve your own problems first.
              </p>
              <p className="text-base sm:text-lg leading-relaxed">
                Instead of looking for a project to join, look for a problem to solve in your own daily life. This is how you get exposed 
                to new projects and start coding up what you want.
              </p>
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold text-white mt-10 mb-4">
              Build Your Own Mini Projects
            </h3>
            <p className="text-base sm:text-lg leading-relaxed mb-4">
              Start small. Create a tiny tool to solve a personal annoyance or automate a repetitive task. This is your training ground.
            </p>
            <ul className="space-y-3 ml-4 sm:ml-6 mb-8">
              <li className="text-base sm:text-lg leading-relaxed flex items-start">
                <span className="text-cyan-400 mr-3 flex-shrink-0">→</span>
                <span>
                  Struggle to keep up with your e-mail? Create a <span className="text-white font-semibold">mail organizer</span> that 
                  sorts emails from different professors into folders.
                </span>
              </li>
              <li className="text-base sm:text-lg leading-relaxed flex items-start">
                <span className="text-cyan-400 mr-3 flex-shrink-0">→</span>
                <span>
                  Want your calendar to be smarter? Build a tool that automatically pulls your{' '}
                  <span className="text-white font-semibold">Moodle deadlines into your Outlook Calendar</span>.
                </span>
              </li>
              <li className="text-base sm:text-lg leading-relaxed flex items-start">
                <span className="text-cyan-400 mr-3 flex-shrink-0">→</span>
                <span>
                  Have to find someone&apos;s birthday? Write a script that{' '}
                  <span className="text-white font-semibold">searches LDAP</span> for it.
                </span>
              </li>
            </ul>

            <h3 className="text-2xl sm:text-3xl font-bold text-white mt-10 mb-4">
              Discover and Use Open Source Libraries
            </h3>
            <p className="text-base sm:text-lg leading-relaxed mb-4">
              As you build your mini-project, you&apos;ll quickly realize you don&apos;t have to build everything from scratch. You&apos;ll search for 
              libraries to parse a PDF, make an HTTP request, or connect to a mail server.
            </p>
            <p className="text-base sm:text-lg leading-relaxed mb-8">
              More often than not, those libraries are <span className="text-cyan-400 font-semibold">open source</span>, and you are now 
              an active user of open source projects! You are learning how different projects work and how they can be applied to solve 
              your specific use case.
            </p>

            <h3 className="text-2xl sm:text-3xl font-bold text-white mt-10 mb-4">
              Extend and Contribute Back
            </h3>
            <p className="text-base sm:text-lg leading-relaxed mb-4">
              Sooner or later, you&apos;ll find a library that <span className="text-white font-semibold">almost</span> does what you need. 
              Maybe the Moodle connector doesn&apos;t support your specific authentication method, or the mail library has a small bug.
            </p>
            <p className="text-xl sm:text-2xl text-cyan-400 font-bold my-6">
              This is your moment.
            </p>
            <p className="text-base sm:text-lg leading-relaxed mb-8">
              You can now dive into that library&apos;s code, make the change you need, and submit it back to the original project. 
              Your first contribution isn&apos;t a random bug fix for a project you don&apos;t use; it&apos;s a{' '}
              <span className="text-cyan-400 font-semibold">feature you genuinely need</span>, which will also benefit others :)
            </p>

            <div className="space-y-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-lg p-6 md:p-8 mt-8">
              <h3 className="text-2xl sm:text-3xl font-bold text-cyan-400 mb-4">
                Our Open Source Developers Group
              </h3>
              <p className="text-base sm:text-lg leading-relaxed">
                &quot;Open source&quot; doesn&apos;t just mean contributing to some established library on GitHub. It starts local - find a group of 
                people you know with a common problem and build something leveraging open source tools to solve it!
              </p>
              <p className="text-base sm:text-lg leading-relaxed">
                Here at IIIT Hyderabad, we call this group the{' '}
                <span className="text-white font-bold">Open Source Developers Group</span>, or <span className="text-cyan-400 font-bold">OSDG</span> :)
              </p>
              <p className="text-base sm:text-lg leading-relaxed">
                Our goal is to build or deploy our own set of open source projects for everything we do on campus. You can find a list of them{' '}
                <Link
                  href="/list"
                  className="text-cyan-400 hover:text-cyan-300 underline decoration-cyan-400/50 hover:decoration-cyan-300 transition-colors font-semibold"
                >
                  here
                </Link>
                !
              </p>
              <div className="mt-6 p-4 bg-black/30 rounded-md border border-cyan-500/20">
                <p className="text-base sm:text-lg leading-relaxed text-cyan-400">
                  Start by using projects built by our community. When you find a bug or think of an improvement, you&apos;ll have a familiar 
                  and supportive group of people to help you make your first contribution. Let&apos;s build and learn together!
                </p>
              </div>
            </div>

          </BlogPost>
          
        </div>
      </div>
    </div>
  );
}
