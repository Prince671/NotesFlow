import React, { useEffect, useState } from "react";
import {
  Plus, X, Moon, Sun, Edit3, Trash2, Calendar, Search, Archive, Star,
  Download, Upload, Eye, EyeOff, Copy, Tag, SortAsc, SortDesc, LogOut, User, Share2, CircleUser
} from "lucide-react";

import axios from "axios";
import jsPDF from "jspdf";
import "./Notes.css";


const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [priority, setPriority] = useState("medium");

  // UI states
  const [hoveredId, setHoveredId] = useState(null);
  const [clickedId, setClickedId] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("notes-theme");
    return saved ? JSON.parse(saved) : false;
  });

  // Edit modal
  const [editingNote, setEditingNote] = useState(null);
  const [editingSaving, setEditingSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Search and filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [showArchived, setShowArchived] = useState(false);
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  // Profile dropdown
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Toast system
  const [toasts, setToasts] = useState([]);

  const expandedId = clickedId ?? hoveredId;

  // Toast functions
  const addToast = (message, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 3000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Theme effect
  useEffect(() => {
    localStorage.setItem("notes-theme", JSON.stringify(darkMode));
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // API base
  const API_BASE = import.meta.env.VITE_API_BASE + "/notes";
  const AUTH_BASE = import.meta.env.VITE_API_BASE + "/auth";

  // Get current user
  useEffect(() => {
    const getUserInfo = () => {
      const userStr = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (userStr) {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
      } else if (token) {
        fetchUserProfile();
      }
    };
    getUserInfo();
  }, []);

  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      const res = await axios.get(`${AUTH_BASE}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data?.user) {
        setCurrentUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
    }
  };

  // Normalizer
  const normalizeNote = (n) => ({
    ...n,
    description: n.description ?? n.desc ?? "",
    tags: Array.isArray(n.tags) ? n.tags : (typeof n.tags === "string" && n.tags.length ? n.tags.split(",").map(t => t.trim()).filter(Boolean) : (n.tags ? [n.tags] : [])),
    createdAt: n.createdAt ?? n.created_at ?? n.created ?? null,
    owner: n.owner ?? n.userId ?? n.user_id ?? null,
  });

  // Fetch notes
  const fetchNotes = async (userParam) => {
    const user = userParam || currentUser;
    if (!user) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`${API_BASE}/fetch`, { headers });
      const data = Array.isArray(res.data) ? res.data : [];

      const userNotes = data.filter(note => note.createdBy === user._id || note.createdBy === user.id);
      const normalized = userNotes.map(normalizeNote);

      setNotes(normalized);
    } catch (err) {
      addToast(`Error fetching notes: ${err.response?.data?.error || err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchNotes();
    }
  }, [currentUser]);

  // Filter and search notes
  useEffect(() => {
    let filtered = [...notes];

    filtered = filtered.filter((note) => (showArchived ? !!note.archived : !note.archived));

    if (selectedFilter !== "all") {
      if (selectedFilter === "starred") {
        filtered = filtered.filter((note) => !!note.starred);
      } else if (["high", "medium", "low"].includes(selectedFilter)) {
        filtered = filtered.filter((note) => note.priority === selectedFilter);
      }
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((note) =>
        (note.title || "").toLowerCase().includes(query) ||
        (note.description || "").toLowerCase().includes(query) ||
        (Array.isArray(note.tags) && note.tags.some((tag) => tag.toLowerCase().includes(query)))
      );
    }

    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "title":
          comparison = (a.title || "").localeCompare(b.title || "");
          break;
        case "priority": {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          comparison = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
          break;
        }
        default:
          comparison = new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }

      return sortOrder === "asc" ? -comparison : comparison;
    });

    setFilteredNotes(filtered);
  }, [notes, searchQuery, selectedFilter, showArchived, sortBy, sortOrder]);

  // Add note
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      addToast("Title and description are required.", "warning");
      return;
    }
    setAdding(true);
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const noteData = {
        title: title.trim(),
        desc: description.trim(),
        description: description.trim(),
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        priority,
        archived: false,
        starred: false,
      };

      const res = await axios.post(`${API_BASE}/add`, noteData, { headers });

      const rawNote = res.data?.note ?? res.data ?? null;
      if (rawNote) {
        const newNote = normalizeNote(rawNote);
        setNotes((prev) => [newNote, ...prev]);
        addToast("Note added successfully", "success");
      } else {
        addToast("Note added but server did not return note object.", "warning");
      }

      setTitle("");
      setDescription("");
      setTags("");
      setPriority("medium");
      setShowForm(false);
    } catch (err) {
      addToast(`Error adding note: ${err.response?.data?.error || err.message}`, "error");
    } finally {
      setAdding(false);
    }
  };

  // Update note
  const handleEditSave = async () => {
    if (!editingNote) return;
    if (!editingNote.title?.trim() || !editingNote.description?.trim()) {
      addToast("Both fields are required.", "warning");
      return;
    }
    setEditingSaving(true);
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const payload = {
        title: editingNote.title.trim(),
        desc: editingNote.description.trim(),
        description: editingNote.description.trim(),
        tags: editingNote.tags || [],
        priority: editingNote.priority || "medium",
        archived: !!editingNote.archived,
        starred: !!editingNote.starred,
      };

      const res = await axios.put(`${API_BASE}/update/${editingNote._id}`, payload, { headers });

      const rawUpdated = res.data?.note ?? res.data ?? null;
      if (rawUpdated) {
        const updated = normalizeNote(rawUpdated);
        setNotes((prev) => prev.map((n) => (n._id === updated._id ? updated : n)));
        addToast("Note updated successfully", "success");
        setEditingNote(null);
      } else {
        addToast("Server did not return updated note.", "warning");
      }
    } catch (err) {
      addToast(`Error updating: ${err.response?.data?.error || err.message}`, "error");
    } finally {
      setEditingSaving(false);
    }
  };

  // Delete note
  const handleDeleteNote = async (id) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;
    setDeletingId(id);
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      await axios.delete(`${API_BASE}/delete/${id}`, { headers });
      setNotes((prev) => prev.filter((n) => n._id !== id));
      addToast("Note deleted successfully", "success");
      if (clickedId === id) setClickedId(null);
    } catch (err) {
      addToast(`Error deleting: ${err.response?.data?.error || err.message}`, "error");
    } finally {
      setDeletingId(null);
    }
  };

  // Toggle star
  const toggleStar = async (note) => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const updated = { ...note, starred: !note.starred };
      const res = await axios.put(`${API_BASE}/update/${note._id}`, {
        title: updated.title,
        desc: updated.description ?? updated.desc ?? "",
        description: updated.description ?? updated.desc ?? "",
        tags: updated.tags || [],
        priority: updated.priority || "medium",
        starred: updated.starred,
        archived: !!updated.archived,
      }, { headers });

      const raw = res.data?.note ?? res.data ?? null;
      if (raw) {
        const returned = normalizeNote(raw);
        setNotes((prev) => prev.map((n) => (n._id === returned._id ? returned : n)));
      } else {
        setNotes((prev) => prev.map((n) => (n._id === note._id ? normalizeNote(updated) : n)));
      }
      addToast(updated.starred ? "Note starred" : "Note unstarred", "success");
    } catch (err) {
      addToast(`Error updating note: ${err.response?.data?.error || err.message}`, "error");
    }
  };

  // Toggle archive
  const toggleArchive = async (note) => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const updated = { ...note, archived: !note.archived };
      const res = await axios.put(`${API_BASE}/update/${note._id}`, {
        title: updated.title,
        desc: updated.description ?? updated.desc ?? "",
        description: updated.description ?? updated.desc ?? "",
        tags: updated.tags || [],
        priority: updated.priority || "medium",
        archived: updated.archived,
        starred: !!updated.starred,
      }, { headers });

      const raw = res.data?.note ?? res.data ?? null;
      if (raw) {
        const returned = normalizeNote(raw);
        setNotes((prev) => prev.map((n) => (n._id === returned._id ? returned : n)));
      } else {
        setNotes((prev) => prev.map((n) => (n._id === note._id ? normalizeNote(updated) : n)));
      }
      addToast(updated.archived ? "Note archived" : "Note unarchived", "success");
    } catch (err) {
      addToast(`Error updating note: ${err.response?.data?.error || err.message}`, "error");
    }
  };

  // Copy note
  const copyNote = async (note) => {
    try {
      await navigator.clipboard.writeText(`${note.title}\n\n${note.description || ""}`);
      addToast("Note copied to clipboard", "success");
    } catch (err) {
      addToast("Failed to copy note", "error", err);
    }
  };

  // Export notes
  

const exportNotes = () => {
  if (!notes || notes.length === 0) {
    addToast("No notes to export", "warning");
    return;
  }

  const doc = new jsPDF();

  notes.forEach((note, index) => {
    const title = note.title || "Untitled";
    const description = note.description || "";

    // Add title
    doc.setFontSize(16);
    doc.text(`Title: ${title}`, 10, 20 + index * 50);

    // Add description
    doc.setFontSize(12);
    const splitDesc = doc.splitTextToSize(description, 180); // wrap text
    doc.text(splitDesc, 10, 30 + index * 50);

    // Add tags, priority, date
    doc.setFontSize(10);
    const tags = note.tags?.join(", ") || "None";
    const date = note.createdAt ? new Date(note.createdAt).toLocaleDateString() : "Unknown";
    doc.text(`Tags: ${tags}`, 10, 40 + index * 50);
    doc.text(`Priority: ${note.priority || "medium"}`, 10, 45 + index * 50);
    doc.text(`Date: ${date}`, 10, 50 + index * 50);

    // Add a new page for every note except the last
    if (index !== notes.length - 1) doc.addPage();
  });

  const fileName = `notes-${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);

  addToast("Notes exported successfully as PDF", "success");
};

  // Import notes
  const importNotes = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = (event) => {
    try {
      let importedNotes = [];

      // Try parsing as JSON first
      if (file.type === "application/json") {
        const jsonData = JSON.parse(event.target.result);
        if (Array.isArray(jsonData)) {
          importedNotes = jsonData.map((n) =>
            normalizeNote({
              ...n,
              _id: n._id ?? `import-${Date.now()}-${Math.random()}`,
            })
          );
        } else {
          addToast("JSON file is invalid format", "error");
          return;
        }
      } else {
        // For non-JSON files, create a generic note entry
        importedNotes.push({
          _id: `file-${Date.now()}-${Math.random()}`,
          title: file.name,
          description: `File imported: ${file.name} (${file.type || "unknown type"}, ${file.size} bytes)`,
          tags: ["imported-file"],
          priority: "medium",
          archived: false,
          starred: false,
          createdAt: new Date().toISOString(),
        });
      }

      setNotes((prev) => [...importedNotes, ...prev]);
      addToast(`Imported ${importedNotes.length} note(s)`, "success");
    } catch (err) {
      console.error(err);
      addToast("Error reading file", "error");
    }
  };

  reader.readAsText(file);
  e.target.value = ""; // Reset input
};

const shareNote = (note) => {
  if (!note.publicId) {
    addToast("This note cannot be shared", "error");
    return;
  }

  // Generate shareable link
  const shareURL = `${window.location.origin}/notes/shared/${note.publicId}`;

  // Copy to clipboard
  navigator.clipboard.writeText(shareURL)
    .then(() => addToast("Shareable link copied!", "success"))
    .catch(() => addToast("Failed to copy link", "error"));
};

const [userInitial, setUserInitial] = useState("");

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user?.name) {
        setUserInitial(user.name.charAt(0).toUpperCase()); // first letter
      }
    }
  }, []);

  // Logout
  const handleLogout = () => {
    if (!window.confirm("Are you sure you want to logout?")) return;
    
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("notes-theme");
    
    addToast("Logged out successfully", "success");
    
    setTimeout(() => {
      window.location.href = "/";
    }, 1000);
  };

  // Close profile menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileMenu && !event.target.closest('.profile-menu-container')) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileMenu]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date)) return "";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "#ef4444";
      case "medium":
        return "#f59e0b";
      case "low":
        return "#10b981";
      default:
        return "#6b7280";
    }
  };

  const renderSkeletons = (count = 6) =>
    Array.from({ length: count }).map((_, i) => (
      <div key={i} className="note-card skeleton-card">
        <div className="skeleton-header">
          <div className="skeleton-title"></div>
          <div className="skeleton-dot"></div>
        </div>
        <div className="skeleton-content">
          <div className="skeleton-line"></div>
          <div className="skeleton-line short"></div>
        </div>
      </div>
    ));

  return (
    <div className={`notes-app ${darkMode ? "theme-dark" : "theme-light"}`}>
      {/* Toast Container */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span>{t.message}</span>
            <button className="toast-close" onClick={() => removeToast(t.id)}>×</button>
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo-container">
              <div className="logo-icon">
                <Edit3 size={24} />
              </div>
              <div className="header-text">
                <h1 className="app-title">NoteFlow</h1>
                <p className="app-subtitle">Capture your ideas elegantly</p>
              </div>
            </div>
          </div>

          <div className="header-actions">
            <input
              type="file"
              accept=".json"
              onChange={importNotes}
              style={{ display: "none" }}
              id="import-file"
            />

            <button className="icon-btn" onClick={exportNotes} title="Export notes">
              <Download size={18} />
            </button>

            

            <button
              className="icon-btn"
              onClick={() => document.getElementById("import-file").click()}
              title="Import notes"
            >
              <Upload size={18} />
            </button>

            <button
              className="icon-btn"
              onClick={() => setShowArchived(!showArchived)}
              title={showArchived ? "Hide archived" : "Show archived"}
            >
              {showArchived ? <EyeOff size={18} /> : <Archive size={18} />}
            </button>

            <button style={{position: 'relative' , top: '2.5px', right: '2px'}}
              className="icon-btn theme-toggle"
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? "Light mode" : "Dark mode"}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          

            <button className="create-btn" onClick={() => setShowForm(!showForm)}>
              <Plus size={20} />
              <span>New Note</span>
            </button>

            {/* Profile Menu */}
            <div className="profile-menu-container">
              <button
      className="profile-btn"
      onClick={() => setShowProfileMenu(!showProfileMenu)}
      title="Profile"
    >
      {userInitial ? (
        <span className="profile-initial">{userInitial}</span>
      ) : (
        <CircleUser size={20} />
      )}
    </button>
              
              {showProfileMenu && (
                <div className="profile-dropdown">
                  <div className="profile-info">
                    <div className="profile-avatar">
                      <User size={24} />
                    </div>
                    <div className="profile-details">
                      <p className="profile-name">{currentUser?.name || currentUser?.username || "User"}</p>
                      <p className="profile-email">{currentUser?.email || ""}</p>
                    </div>
                  </div>
                  <div className="profile-divider"></div>
                  <button className="profile-menu-item logout-btn" onClick={handleLogout}>
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="controls-section">
        <div className="controls-content">
          <div className="search-wrapper">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              className="search-input"
              placeholder="Search notes by title, content or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filters-wrapper">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Notes</option>
              <option value="starred">⭐ Starred</option>
              <option value="high">🔴 High Priority</option>
              <option value="medium">🟡 Medium Priority</option>
              <option value="low">🟢 Low Priority</option>
            </select>

            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)} 
              className="filter-select"
            >
              <option value="date">Date</option>
              <option value="title">Title</option>
              <option value="priority">Priority</option>
            </select>

            <button
              className="icon-btn sort-btn"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              title={`Sort ${sortOrder === "asc" ? "descending" : "ascending"}`}
            >
              {sortOrder === "asc" ? <SortAsc size={18} /> : <SortDesc size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Add Form */}
      {showForm && (
        <>
          <div className="overlay" onClick={() => setShowForm(false)} />
          <div className="form-modal">
            <form className="note-form" onSubmit={handleAddNote}>
              <div className="form-header">
                <h3>Create New Note</h3>
                <button
                  type="button"
                  className="close-btn"
                  onClick={() => {
                    setShowForm(false);
                    setTitle("");
                    setDescription("");
                    setTags("");
                    setPriority("medium");
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="form-body">
                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter note title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={adding}
                    maxLength={100}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Tags</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="work, personal, ideas..."
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      disabled={adding}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select
                      className="form-input"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      disabled={adding}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Content</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Write your note content here..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={adding}
                    rows={6}
                  />
                </div>
              </div>

              <div className="form-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowForm(false);
                    setTitle("");
                    setDescription("");
                    setTags("");
                    setPriority("medium");
                  }}
                  disabled={adding}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={adding || !title.trim() || !description.trim()}
                >
                  {adding ? "Creating..." : "Create Note"}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Notes Grid */}
      <main className="notes-main">
        {loading ? (
          <div className="notes-grid">{renderSkeletons()}</div>
        ) : filteredNotes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              {searchQuery || selectedFilter !== "all" ? <Search size={64} /> : <Edit3 size={64} />}
            </div>
            <h3 className="empty-title">
              {searchQuery || selectedFilter !== "all" ? "No notes found" : "No notes yet"}
            </h3>
            <p className="empty-text">
              {searchQuery || selectedFilter !== "all"
                ? "Try adjusting your search or filters."
                : "Create your first note to get started organizing your thoughts."}
            </p>
            {!searchQuery && selectedFilter === "all" && (
              <button className="btn btn-primary empty-btn" onClick={() => setShowForm(true)}>
                <Plus size={20} />
                <span>Create First Note</span>
              </button>
            )}
          </div>
        ) : (
          <div className="notes-grid">
            {filteredNotes.map((note) => {
              const isExpanded = expandedId === note._id;

              return (
                <article
                  key={note._id}
                  className={`note-card ${isExpanded ? "expanded" : ""} ${note.archived ? "archived" : ""}`}
                  onMouseEnter={() => setHoveredId(note._id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => setClickedId(clickedId === note._id ? null : note._id)}
                >
                  <div className="note-priority-bar" style={{ backgroundColor: getPriorityColor(note.priority) }}></div>
                  
                  <div className="note-header">
                    <div className="note-title-row">
                      <h3 className="note-title">{note.title}</h3>
                      {note.starred && (
                        <Star className="star-icon" size={18} fill="currentColor" />
                      )}
                      <button className="icon-btn" onClick={exportNotes} title="Export notes">
                        <Download size={14} />
                      </button>
                      <button className="icon-btn" onClick={() => shareNote(note)} title="Share note">
                        <Share2 size={14} />
                      </button>
                    </div>
                    <div className="note-meta">
                      <Calendar size={14} />
                      <span className="note-date">
                        {note.createdAt ? formatDate(note.createdAt) : "Today"}
                      </span>
                    </div>
                  </div>

                  {note.tags && note.tags.length > 0 && (
                    <div className="note-tags">
                      {note.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="note-tag">
                          <Tag size={12} />
                          {tag}
                        </span>
                      ))}
                      {note.tags.length > 3 && (
                        <span className="note-tag more-tags">+{note.tags.length - 3}</span>
                      )}
                    </div>
                  )}

                  <div className="note-preview">
                  
                    <p className="note-excerpt">
                      {(note.description || "").substring(0, 120)}
                      {(note.description || "").length > 120 && "..."}
                    </p>
                  </div>

                  {isExpanded && (
                    <div className="note-expanded">
                      <div className="note-content">
                        <pre className="note-full-text">{note.description}</pre>
                      </div>

                      <div className="note-actions">
                        <button
                          className="action-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStar(note);
                          }}
                          title={note.starred ? "Unstar" : "Star"}
                        >
                          <Star size={16} fill={note.starred ? "currentColor" : "none"} />
                        </button>

                        <button
                          className="action-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyNote(note);
                          }}
                          title="Copy note"
                        >
                          <Copy size={16} />
                        </button>

                        <button
                          className="action-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleArchive(note);
                          }}
                          title={note.archived ? "Unarchive" : "Archive"}
                        >
                          <Archive size={16} />
                        </button>

                        <button
                          className="action-btn edit"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingNote({ ...note });
                          }}
                          title="Edit note"
                        >
                          <Edit3 size={16} />
                        </button>

                        <button
                          className="action-btn delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNote(note._id);
                          }}
                          disabled={deletingId === note._id}
                          title="Delete note"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="expand-indicator">
                    {isExpanded ? "Click to collapse" : "Click to expand"}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* Edit Modal */}
      {editingNote && (
        <>
          <div className="overlay" onClick={() => setEditingNote(null)} />
          <div className="edit-modal">
            <div className="modal-content">
              <div className="form-header">
                <h3>Edit Note</h3>
                <button className="close-btn" onClick={() => setEditingNote(null)}>
                  <X size={20} />
                </button>
              </div>

              <div className="form-body">
                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingNote.title}
                    onChange={(e) => setEditingNote((prev) => ({ ...prev, title: e.target.value }))}
                    maxLength={100}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Tags</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editingNote.tags ? editingNote.tags.join(", ") : ""}
                      onChange={(e) =>
                        setEditingNote((prev) => ({
                          ...prev,
                          tags: e.target.value.split(",").map((tag) => tag.trim()).filter(Boolean),
                        }))
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select
                      className="form-input"
                      value={editingNote.priority || "medium"}
                      onChange={(e) => setEditingNote((prev) => ({ ...prev, priority: e.target.value }))}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Content</label>
                  <textarea
                    className="form-textarea"
                    value={editingNote.description}
                    onChange={(e) => setEditingNote((prev) => ({ ...prev, description: e.target.value }))}
                    rows={8}
                  />
                </div>
              </div>

              <div className="form-footer">
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setEditingNote(null)} 
                  disabled={editingSaving}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleEditSave}
                  disabled={editingSaving || !editingNote.title?.trim() || !editingNote.description?.trim()}
                >
                  {editingSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Notes;