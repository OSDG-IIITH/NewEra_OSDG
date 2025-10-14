'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Trash2, ExternalLink, BookOpen, Calendar, Upload } from 'lucide-react';
import Image from 'next/image';

interface Project {
  id: string;
  title: string;
  description: string;
  siteLink: string;
  dateInitiated: string;
  instructionBook: string;
  imageUrl: string;
  addedBy: string;
  createdAt: string;
}

export default function ListPage() {
  const { user, loading: authLoading, login } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    siteLink: '',
    dateInitiated: '',
    instructionBook: '',
    imageUrl: '',
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      const data = await response.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setProjects([data.project, ...projects]);
        setFormData({
          title: '',
          description: '',
          siteLink: '',
          dateInitiated: '',
          instructionBook: '',
          imageUrl: '',
        });
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Error adding project:', error);
    }
  };

  const handleDelete = async (projectId: string) => {
    if (!confirm('Are you sure you want to remove this project?')) return;

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProjects(projects.filter(p => p.id !== projectId));
      }
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-cyan-400 font-mono text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-cyan-500/30 bg-black/50 backdrop-blur-sm sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-oxanium font-bold text-cyan-400 mb-2">
                Community Projects
              </h1>
              <p className="text-gray-400 font-mono text-sm">
                Open source projects for the IIIT-H community to collaborate on
              </p>
            </div>
            {user && (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 rounded-md hover:bg-cyan-500/30 transition-all duration-300 font-mono"
              >
                <Plus className="w-5 h-5" />
                Add Project
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Auth Gate */}
        {!user && (
          <div className="border border-cyan-500/30 bg-cyan-500/5 rounded-lg p-8 text-center mb-8">
            <h2 className="text-xl font-oxanium text-cyan-400 mb-3">
              Authentication Required
            </h2>
            <p className="text-gray-400 mb-4 font-mono text-sm">
              Please sign in with your IIIT-H credentials to add or manage projects
            </p>
            <button
              onClick={() => login('/list')}
              className="px-6 py-2 bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 rounded-md hover:bg-cyan-500/30 transition-all duration-300 font-mono"
            >
              Sign In
            </button>
          </div>
        )}

        {/* Add Project Form Modal */}
        {showAddForm && user && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-black/80 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-green-500/20">
              <div className="p-8">
                <h2 className="text-3xl font-oxanium font-bold text-green-400 mb-8">Add New Project</h2>
              </div>
              
              <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-6">
                <div>
                  <label className="block text-sm font-oxanium text-gray-400 mb-3">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 bg-black/50 rounded-lg text-white focus:ring-2 focus:ring-green-500/50 focus:outline-none font-oxanium placeholder-gray-600"
                    placeholder="Enter project name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-oxanium text-gray-400 mb-3">
                    Description *
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-black/50 rounded-lg text-white focus:ring-2 focus:ring-green-500/50 focus:outline-none font-oxanium placeholder-gray-600 resize-none"
                    placeholder="Describe the project..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-oxanium text-gray-400 mb-3">
                    Project Site Link *
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.siteLink}
                    onChange={(e) => setFormData({ ...formData, siteLink: e.target.value })}
                    className="w-full px-4 py-3 bg-black/50 rounded-lg text-white focus:ring-2 focus:ring-green-500/50 focus:outline-none font-oxanium placeholder-gray-600"
                    placeholder="https://github.com/..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-oxanium text-gray-400 mb-3">
                    Date Initiated *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.dateInitiated}
                    onChange={(e) => setFormData({ ...formData, dateInitiated: e.target.value })}
                    className="w-full px-4 py-3 bg-black/50 rounded-lg text-white focus:ring-2 focus:ring-green-500/50 focus:outline-none font-oxanium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-oxanium text-gray-400 mb-3">
                    Instruction Book / Documentation Link
                  </label>
                  <input
                    type="url"
                    value={formData.instructionBook}
                    onChange={(e) => setFormData({ ...formData, instructionBook: e.target.value })}
                    className="w-full px-4 py-3 bg-black/50 rounded-lg text-white focus:ring-2 focus:ring-green-500/50 focus:outline-none font-oxanium placeholder-gray-600"
                    placeholder="https://docs.project.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-oxanium text-gray-400 mb-3">
                    Project Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full px-4 py-3 bg-black/50 rounded-lg text-white focus:ring-2 focus:ring-green-500/50 focus:outline-none font-oxanium placeholder-gray-600"
                    placeholder="https://example.com/image.png"
                  />
                </div>

                <div className="flex gap-4 pt-6">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-all duration-300 font-oxanium font-semibold"
                  >
                    Add Project
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-6 py-3 bg-gray-500/20 text-gray-400 rounded-lg hover:bg-gray-500/30 transition-all duration-300 font-oxanium font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 font-mono">No projects yet. {user ? 'Be the first to add one!' : ''}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="border border-cyan-500/30 bg-cyan-500/5 rounded-lg overflow-hidden hover:border-cyan-500/50 transition-all duration-300 group"
              >
                {/* Project Image */}
                {project.imageUrl && (
                  <div className="relative h-48 bg-black/50">
                    <Image
                      src={project.imageUrl}
                      alt={project.title}
                      fill
                      className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                )}

                <div className="p-5">
                  {/* Title */}
                  <h3 className="text-xl font-oxanium text-cyan-400 mb-2 line-clamp-1">
                    {project.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-400 text-sm mb-4 line-clamp-3 font-mono">
                    {project.description}
                  </p>

                  {/* Date */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-3 font-mono">
                    <Calendar className="w-4 h-4" />
                    {new Date(project.dateInitiated).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>

                  {/* Links */}
                  <div className="flex gap-2 mb-3">
                    <a
                      href={project.siteLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 rounded text-sm hover:bg-cyan-500/30 transition-all duration-300 font-mono"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Site
                    </a>
                    {project.instructionBook && (
                      <a
                        href={project.instructionBook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 rounded text-sm hover:bg-cyan-500/30 transition-all duration-300 font-mono"
                      >
                        <BookOpen className="w-4 h-4" />
                        Docs
                      </a>
                    )}
                  </div>

                  {/* Delete Button (only for authenticated users) */}
                  {user && (
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-1.5 bg-red-500/20 border border-red-500/50 text-red-400 rounded text-sm hover:bg-red-500/30 transition-all duration-300 font-mono"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
