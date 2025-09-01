import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Search, User, LogOut, FileText } from 'lucide-react';

const NotesApp = () => {
  const [notes, setNotes] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [authForm, setAuthForm] = useState({ username: '', password: '', isLogin: true });
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [editNote, setEditNote] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL;

  // API functions
  const api = {
    async request(endpoint, options = {}) {
      const token = localStorage.getItem('auth-token');
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        ...options,
      };

      const response = await fetch(`${API_BASE}${endpoint}`, config);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Request failed' }));
        throw new Error(error.detail || 'Request failed');
      }
      
      return response.json();
    },

    async login(username, password) {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);
      
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Invalid credentials');
      }
      
      return response.json();
    },

    async register(username, password) {
      return this.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
    },

    async getNotes() {
      return this.request('/notes');
    },

    async createNote(noteData) {
      return this.request('/notes', {
        method: 'POST',
        body: JSON.stringify(noteData),
      });
    },

    async updateNote(id, noteData) {
      return this.request(`/notes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(noteData),
      });
    },

    async deleteNote(id) {
      return this.request(`/notes/${id}`, {
        method: 'DELETE',
      });
    },

    async searchNotes(query) {
      return this.request(`/notes/search?q=${encodeURIComponent(query)}`);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('auth-token');
    if (token) {
      setIsAuthenticated(true);
      setUser({ username: localStorage.getItem('username') || 'User' });
      loadNotes();
    }
  }, []);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const fetchedNotes = await api.getNotes();
      setNotes(fetchedNotes);
    } catch (error) {
      console.error('Failed to load notes:', error);
      // Mock data for demo
      setNotes([
        {
          id: 1,
          title: 'Welcome to Professional Notes',
          content: 'This is a professional note-taking application. Create, edit, and organize your thoughts efficiently.',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          title: 'Meeting Minutes - Q4 Planning',
          content: 'Discussed quarterly objectives, resource allocation, and timeline for upcoming projects. Action items: Review budget proposals, schedule team sync meetings.',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = authForm.isLogin 
        ? await api.login(authForm.username, authForm.password)
        : await api.register(authForm.username, authForm.password);
      
      localStorage.setItem('auth-token', response.access_token || 'mock-token');
      localStorage.setItem('username', authForm.username);
      setUser({ username: authForm.username });
      setIsAuthenticated(true);
      loadNotes();
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('username');
    setIsAuthenticated(false);
    setUser(null);
    setNotes([]);
  };

  const handleCreateNote = async () => {
    if (!newNote.title.trim() || !newNote.content.trim()) return;
    
    try {
      setLoading(true);
      const createdNote = await api.createNote(newNote);
      setNotes(prev => [createdNote, ...prev]);
      setNewNote({ title: '', content: '' });
      setIsCreating(false);
    } catch (error) {
      console.error('Failed to create note:', error);
      // Mock creation for demo
      const mockNote = {
        id: Date.now(),
        ...newNote,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setNotes(prev => [mockNote, ...prev]);
      setNewNote({ title: '', content: '' });
      setIsCreating(false);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNote = async (id) => {
    if (!editNote.title.trim() || !editNote.content.trim()) return;
    
    try {
      setLoading(true);
      const updatedNote = await api.updateNote(id, editNote);
      setNotes(prev => prev.map(note => 
        note.id === id ? { ...note, ...updatedNote, updated_at: new Date().toISOString() } : note
      ));
      setEditingId(null);
      setEditNote({ title: '', content: '' });
    } catch (error) {
      console.error('Failed to update note:', error);
      // Mock update for demo
      setNotes(prev => prev.map(note => 
        note.id === id ? { ...note, ...editNote, updated_at: new Date().toISOString() } : note
      ));
      setEditingId(null);
      setEditNote({ title: '', content: '' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (id) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    try {
      setLoading(true);
      await api.deleteNote(id);
      setNotes(prev => prev.filter(note => note.id !== id));
    } catch (error) {
      console.error('Failed to delete note:', error);
      // Mock delete for demo
      setNotes(prev => prev.filter(note => note.id !== id));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadNotes();
      return;
    }

    try {
      const results = await api.searchNotes(searchQuery);
      setNotes(results);
    } catch (error) {
      // Mock search for demo
      const filtered = notes.filter(note => 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setNotes(filtered);
    }
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md border border-gray-700">
          <div className="text-center mb-8">
            <FileText className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Professional Notes</h1>
            <p className="text-gray-400">Secure note management platform</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <input
                type="text"
                value={authForm.username}
                onChange={(e) => setAuthForm(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter username"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={authForm.password}
                onChange={(e) => setAuthForm(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter password"
                required
              />
            </div>
            
            <button
              onClick={handleAuth}
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              {loading ? 'Processing...' : (authForm.isLogin ? 'Sign In' : 'Sign Up')}
            </button>
            
            <button
              onClick={() => setAuthForm(prev => ({ ...prev, isLogin: !prev.isLogin }))}
              className="w-full text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              {authForm.isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="w-8 h-8 text-blue-400" />
            <h1 className="text-xl font-semibold">Professional Notes</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-300">
              <User className="w-4 h-4" />
              <span>{user?.username}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4">
        {/* Search and Create Section */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search notes..."
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Note</span>
          </button>
        </div>

        {/* Create Note Form */}
        {isCreating && (
          <div className="mb-6 bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="space-y-4">
              <input
                type="text"
                value={newNote.title}
                onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Note title..."
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              <textarea
                value={newNote.content}
                onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Write your note content here..."
                rows={6}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              
              <div className="flex space-x-2">
                <button
                  onClick={handleCreateNote}
                  disabled={loading || !newNote.title.trim() || !newNote.content.trim()}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white rounded-md flex items-center space-x-2 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </button>
                
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setNewNote({ title: '', content: '' });
                  }}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md flex items-center space-x-2 transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notes Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-2 text-gray-400">Loading notes...</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No notes found</p>
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  loadNotes();
                }}
                className="mt-2 text-blue-400 hover:text-blue-300 transition-colors"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNotes.map((note) => (
              <div key={note.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:bg-gray-750 transition-colors">
                {editingId === note.id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editNote.title}
                      onChange={(e) => setEditNote(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    
                    <textarea
                      value={editNote.content}
                      onChange={(e) => setEditNote(prev => ({ ...prev, content: e.target.value }))}
                      rows={4}
                      className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                    />
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleUpdateNote(note.id)}
                        disabled={loading}
                        className="p-1 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setEditNote({ title: '', content: '' });
                        }}
                        className="p-1 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-medium text-white truncate flex-1">{note.title}</h3>
                      <div className="flex space-x-1 ml-2">
                        <button
                          onClick={() => {
                            setEditingId(note.id);
                            setEditNote({ title: note.title, content: note.content });
                          }}
                          className="p-1 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="p-1 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-gray-300 text-sm mb-3 line-clamp-4">
                      {note.content}
                    </p>
                    
                    <div className="text-xs text-gray-500">
                      <p>Created: {formatDate(note.created_at)}</p>
                      {note.updated_at !== note.created_at && (
                        <p>Updated: {formatDate(note.updated_at)}</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesApp;