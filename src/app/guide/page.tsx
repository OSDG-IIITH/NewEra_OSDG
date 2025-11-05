'use client';

import React from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        {/* Header */}
        <div className="mb-12 md:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-oxanium font-bold text-cyan-400 mb-4 md:mb-6">
            Getting Started with FOSS
          </h1>
          
        </div>

        {/* Content */}
        <div className="space-y-8 md:space-y-12 font-oxanium text-gray-300">
          {/* Introduction */}
          <section className="space-y-4">
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
          </section>

          {/* But Where Do I Start */}
          <section className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              But Where Do I Start?
            </h2>
            <p className="text-base sm:text-lg leading-relaxed">
              This is the most common hurdle. You're excited, you want to contribute, but the world of open source seems vast and intimidating. 
              The idea of cloning a massive, unfamiliar repository and trying to fix a bug feels alien and overwhelming.
            </p>
            <p className="text-base sm:text-lg leading-relaxed">
              If you feel this way, <span className="text-cyan-400 font-semibold">you are not alone</span>. Let's reframe the entire approach.
            </p>
          </section>

          {/* Start with Yourself */}
          <section className="space-y-4 bg-cyan-500/5 border border-cyan-500/20 rounded-lg p-6 md:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-cyan-400 mb-4">
              Start with Yourself
            </h2>
            <p className="text-base sm:text-lg leading-relaxed">
              Forget about contributing to a massive project for a moment. The best, most meaningful, and most sustainable contributions 
              begin with things that <span className="text-white font-semibold">you use</span>. The goal is to solve your own problems first.
            </p>
            <p className="text-base sm:text-lg leading-relaxed">
              Instead of looking for a project to join, look for a problem to solve in your own daily life. This is how you get exposed 
              to new projects and start coding up what you want.
            </p>
          </section>

          {/* Build Your Own Mini Projects */}
          <section className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Build Your Own Mini Projects
            </h2>
            <p className="text-base sm:text-lg leading-relaxed">
              Start small. Create a tiny tool to solve a personal annoyance or automate a repetitive task. This is your training ground.
            </p>
            <ul className="space-y-3 ml-4 sm:ml-6">
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
                  Have to find someone's birthday? Write a script that{' '}
                  <span className="text-white font-semibold">searches LDAP</span> for it.
                </span>
              </li>
            </ul>
          </section>

          {/* Discover and Use Open Source Libraries */}
          <section className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Discover and Use Open Source Libraries
            </h2>
            <p className="text-base sm:text-lg leading-relaxed">
              As you build your mini-project, you'll quickly realize you don't have to build everything from scratch. You'll search for 
              libraries to parse a PDF, make an HTTP request, or connect to a mail server.
            </p>
            <p className="text-base sm:text-lg leading-relaxed">
              More often than not, those libraries are <span className="text-cyan-400 font-semibold">open source</span>, and you are now 
              an active user of open source projects! You are learning how different projects work and how they can be applied to solve 
              your specific use case.
            </p>
          </section>

          {/* Extend and Contribute Back */}
          <section className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Extend and Contribute Back
            </h2>
            <p className="text-base sm:text-lg leading-relaxed">
              Sooner or later, you&apos;ll find a library that <span className="text-white font-semibold">almost</span> does what you need. 
              Maybe the Moodle connector doesn&apos;t support your specific authentication method, or the mail library has a small bug.
            </p>
            <p className="text-xl sm:text-2xl text-cyan-400 font-bold my-6">
              This is your moment.
            </p>
            <p className="text-base sm:text-lg leading-relaxed">
              You can now dive into that library&apos;s code, make the change you need, and submit it back to the original project. 
              Your first contribution isn&apos;t a random bug fix for a project you don&apos;t use; it&apos;s a{' '}
              <span className="text-cyan-400 font-semibold">feature you genuinely need</span>, which will also benefit others :)
            </p>
          </section>

          {/* Our Open Source Developers Group */}
          <section className="space-y-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-lg p-6 md:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-cyan-400 mb-4">
              Our Open Source Developers Group
            </h2>
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
          </section>

          {/* CTA */}
          <section className="pt-8 text-center">
            <Link
              href="/list"
              className="inline-block px-8 py-3 bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 rounded-md hover:bg-cyan-500/30 transition-all duration-300 font-oxanium font-semibold"
            >
              Explore Community Projects →
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
