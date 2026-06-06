import React, { useState } from "react";
import { Copy, Plus, Trash2, CheckCircle2, Bookmark, Lightbulb, ClipboardList, PenTool } from "lucide-react";
import { ChecklistItem, TravelNote } from "../types";

interface NotesTabProps {
  notes: TravelNote[];
  setNotes: React.Dispatch<React.SetStateAction<TravelNote[]>>;
  checklist: ChecklistItem[];
  setChecklist: React.Dispatch<React.SetStateAction<ChecklistItem[]>>;
}

export default function NotesTab({ notes, setNotes, checklist, setChecklist }: NotesTabProps) {
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteCategory, setNoteCategory] = useState<"Rule" | "Requirement" | "General">("General");
  
  const [newCheckItem, setNewCheckItem] = useState("");

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) return;

    const newNote: TravelNote = {
      id: "note-" + Date.now(),
      title: noteTitle,
      content: noteContent,
      category: noteCategory,
      createdAt: new Date().toISOString()
    };

    setNotes((prev) => [newNote, ...prev]);
    setNoteTitle("");
    setNoteContent("");
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleToggleCheck = (id: string) => {
    const updated = checklist.map((item) => {
      if (item.id === id) return { ...item, completed: !item.completed };
      return item;
    });
    setChecklist(updated);
  };

  const handleAddCheckItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCheckItem.trim()) return;

    const newItem: ChecklistItem = {
      id: "check-" + Date.now(),
      text: newCheckItem,
      completed: false
    };

    const updated = [...checklist, newItem];
    setChecklist(updated);
    setNewCheckItem("");
  };

  const getCatBadgeStyles = (cat: string) => {
    switch (cat) {
      case "Rule":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "Requirement":
        return "bg-rose-100 text-rose-800 border-rose-200";
      default:
        return "bg-sky-100 text-sky-800 border-sky-200";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 bg-stone-50 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Checklist Column */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs flex flex-col h-fit">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3 mb-4">
            <ClipboardList className="text-[#0B3530]" size={18} />
            <h3 className="text-base font-serif font-bold text-[#0B3530]">Trip Checklist</h3>
          </div>

          <form onSubmit={handleAddCheckItem} className="flex gap-2 mb-4 font-sans">
            <input
              type="text"
              value={newCheckItem}
              onChange={(e) => setNewCheckItem(e.target.value)}
              placeholder="Add new checklist task..."
              className="flex-1 px-3 py-1.5 border border-stone-200 rounded-lg text-xs outline-none focus:border-[#0B3530]"
              maxLength={80}
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-[#0B3530] text-[#88B04B] hover:text-white hover:bg-[#18534C] text-xs font-semibold rounded-lg transition-colors cursor-pointer border-none"
            >
              Add
            </button>
          </form>

          {/* Checklist items */}
          <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
            {checklist.map((item) => (
              <div
                key={item.id}
                onClick={() => handleToggleCheck(item.id)}
                className="flex items-start gap-3 p-2.5 rounded-lg border border-stone-50 bg-stone-50/50 hover:bg-stone-50 transition-all cursor-pointer select-none"
              >
                <div className={`mt-0.5 shrink-0 rounded-full border p-0.5 transition-all ${
                  item.completed ? "border-green-600 bg-green-50 text-green-600" : "border-stone-300 text-transparent"
                }`}>
                  <CheckCircle2 size={12} className="stroke-[3px]" />
                </div>
                <span className={`text-xs font-sans leading-relaxed ${
                  item.completed ? "line-through text-stone-400" : "text-stone-700"
                }`}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Middle and Right Notes section */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Create Note inline board */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs">
            <div className="flex items-center gap-2 border-b border-stone-100 pb-3 mb-4">
              <PenTool className="text-[#0B3530]" size={18} />
              <h3 className="text-base font-serif font-bold text-[#0B3530]">Add Travel Scratch Note</h3>
            </div>

            <form onSubmit={handleAddNote} className="space-y-3 font-sans">
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="Note Title (e.g., Souvenir Ideas)"
                  className="col-span-2 px-3 py-2 border border-stone-200 rounded-lg text-xs outline-none focus:border-[#0B3530]"
                  required
                />
                
                <select
                  value={noteCategory}
                  onChange={(e) => setNoteCategory(e.target.value as any)}
                  className="px-3 py-2 border border-stone-200 rounded-lg text-xs outline-none focus:border-[#0B3530] bg-[#FFFFFF]"
                >
                  <option value="General">General Info</option>
                  <option value="Rule">Strict Rule</option>
                  <option value="Requirement">Requirement</option>
                </select>
              </div>

              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Write down sights to seek, shops to visit, or custom budgets ideas..."
                rows={3}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs outline-none focus:border-[#0B3530] resize-none"
                required
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0B3530] text-white hover:bg-[#18534C] text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer border-none shadow-xs"
                >
                  <Plus size={14} /> Add Scratch Note
                </button>
              </div>
            </form>
          </div>

          {/* List of custom notes cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notes.map((note) => (
              <div
                key={note.id}
                className="bg-white rounded-xl border border-stone-200 p-4 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between h-48 relative overflow-hidden group"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className={`px-2 py-0.5 rounded text-[9px] uppercase tracking-wider font-mono font-bold border ${getCatBadgeStyles(note.category)}`}>
                      {note.category}
                    </span>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="p-1 rounded text-stone-300 hover:text-rose-500 hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100 absolute top-3 right-3"
                      title="Delete Note"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <h4 className="text-xs font-bold text-stone-800 font-sans mt-1 line-clamp-1">{note.title}</h4>
                  <p className="text-[11px] text-stone-500 font-sans leading-relaxed mt-2 line-clamp-4">
                    {note.content}
                  </p>
                </div>

                <div className="border-t border-stone-100 pt-2 text-[9px] font-mono text-stone-400 mt-2 flex justify-between items-center">
                  <span>CREATED: {new Date(note.createdAt).toLocaleDateString()}</span>
                  <Bookmark size={10} className="text-[#88B04B]" />
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}
