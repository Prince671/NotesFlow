import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./SharedNote.css"; // import the css

const SharedNote = () => {
  const { publicId } = useParams();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_BASE = import.meta.env.VITE_API_BASE + "/notes";

  useEffect(() => {
    const fetchSharedNote = async () => {
      try {
        const res = await axios.get(`${API_BASE}/share/${publicId}`);
        setNote(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSharedNote();
  }, [publicId]);

  if (loading) return <div>Loading...</div>;
  if (!note) return <div>Note not found</div>;

  return (
    <div className="shared-note-container">
      <div className="shared-note-card">
        <h2 className="shared-note-title">{note.title}</h2>
        <p className="shared-note-description">{note.description}</p>
        {note.tags?.length > 0 && (
          <div className="shared-note-tags">
            {note.tags.map((tag, idx) => (
              <span key={idx} className="shared-note-tag">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SharedNote;
