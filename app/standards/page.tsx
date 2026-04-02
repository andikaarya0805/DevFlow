"use client";

import { useState, useEffect } from "react";
import { 
  FileCode, GitBranch, FolderTree, Hash, Terminal, 
  CheckCircle2, Info, Edit2, Save, X, Loader2
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { db, doc, getDoc, setDoc } from "@/lib/firebase";
import toast from "react-hot-toast";

const DEFAULT_STANDARDS = {
  naming_frontend: "Components: PascalCase (StatCard.tsx)\nUtils & Hooks: camelCase (useAuth.ts)\nFolders: kebab-case (ui-components/)",
  naming_backend: "REST Endpoints: kebab-case (/v1/user-tasks)\nDB Tables: snake_case (technical_debts)\nEnv Vars: SCREAMING_SNAKE_CASE",
  git_commits: "Use Conventional Commits:\nfeat:, fix:, chore:",
  git_review: "A minimum of 2 approvals is required for PRs targeting the main branch.",
  git_testing: "PRs must include screenshots/videos of UI changes and passing Playwright logs.",
  folder_structure: "app/\n├── (pages)/\n└── globals.css\ncomponents/\n├── Sidebar.tsx\n└── ui/\nlib/\n├── firebase.ts\n└── utils.ts"
};

type StandardsData = typeof DEFAULT_STANDARDS;

export default function StandardsPage() {
  const { role } = useAuth();
  const isAdmin = role === "admin";
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [data, setData] = useState<StandardsData>(DEFAULT_STANDARDS);
  const [draft, setDraft] = useState<StandardsData>(DEFAULT_STANDARDS);

  useEffect(() => {
    const fetchStandards = async () => {
      try {
        const docRef = doc(db, "settings", "standards");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const fetchedData = docSnap.data() as StandardsData;
          setData(fetchedData);
          setDraft(fetchedData);
        } else {
          // If none exist, save defaults immediately
          await setDoc(docRef, DEFAULT_STANDARDS);
        }
      } catch (error) {
        console.error("Failed to load standards", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStandards();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const docRef = doc(db, "settings", "standards");
      await setDoc(docRef, draft);
      setData(draft);
      setIsEditing(false);
      toast.success("Standards updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save standards.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setDraft(data);
    setIsEditing(false);
  };

  // Helper renderers
  const renderList = (text: string) => {
    if (!text) return null;
    return text.split("\n").map((line, i) => (
      <li key={i} className="flex gap-4">
        <CheckCircle2 className="w-5 h-5 text-indigo-500 flex-shrink-0" />
        <span className="text-sm font-medium text-zinc-300 whitespace-pre-wrap">{line}</span>
      </li>
    ));
  };

  const TextAreaField = ({ label, fieldName }: { label?: string, fieldName: keyof StandardsData }) => (
    <div className="space-y-2 w-full">
      {label && <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400">{label}</label>}
      <textarea
        value={draft[fieldName]}
        onChange={(e) => setDraft({ ...draft, [fieldName]: e.target.value })}
        className="w-full h-32 bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm font-medium text-zinc-200 focus:border-indigo-500 outline-none transition-all focus:ring-1 focus:ring-indigo-500/50"
      />
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-sm text-zinc-500 font-medium">Syncing standards...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 space-y-16 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative">
        <div className="space-y-4 max-w-2xl">
          <div className="flex items-center gap-3 text-indigo-400 font-black uppercase tracking-[0.2em] text-[10px] mb-2">
            <Terminal className="w-3.5 h-3.5" />
            Protocol Guide
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">Code Standards</h1>
          <p className="text-zinc-400 font-medium italic leading-relaxed">
            Maintaining consistency across our microservices and frontend architectures. 
            Use these guidelines for every PR to ensure high-velocity reviews.
          </p>
        </div>

        {/* Admin Controls */}
        {isAdmin && (
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <button 
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-xl text-xs font-bold hover:bg-zinc-800 transition shadow-lg"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </>
            ) : (
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 border border-zinc-800 text-white font-bold rounded-xl hover:bg-zinc-800 hover:border-zinc-700 transition shadow-lg"
              >
                <Edit2 className="w-4 h-4 text-indigo-400" /> Edit Standards
              </button>
            )}
          </div>
        )}
      </header>

      {/* Naming Convention */}
      <section className="space-y-8 relative">
        <div className="flex items-center gap-3 border-b border-zinc-900 pb-4">
          <Hash className="w-6 h-6 text-indigo-400" />
          <h2 className="text-2xl font-black text-white tracking-tight">Naming Convention</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-8 rounded-3xl space-y-6 bg-zinc-900/20 shadow-xl border border-zinc-900/50 hover:border-zinc-800/80 transition-all duration-500">
            <h3 className="text-sm font-black uppercase text-zinc-500 tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Frontend (React/UI)
            </h3>
            {isEditing ? (
              <TextAreaField fieldName="naming_frontend" />
            ) : (
              <ul className="space-y-4">
                {renderList(data.naming_frontend)}
              </ul>
            )}
          </div>
          <div className="glass-card p-8 rounded-3xl space-y-6 bg-zinc-900/20 shadow-xl border border-zinc-900/50 hover:border-zinc-800/80 transition-all duration-500">
            <h3 className="text-sm font-black uppercase text-zinc-500 tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Backend (API/Cloud)
            </h3>
            {isEditing ? (
              <TextAreaField fieldName="naming_backend" />
            ) : (
              <ul className="space-y-4">
                {renderList(data.naming_backend)}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* Git Flow */}
      <section className="space-y-8">
        <div className="flex items-center gap-3 border-b border-zinc-900 pb-4">
          <GitBranch className="w-6 h-6 text-emerald-400" />
          <h2 className="text-2xl font-black text-white tracking-tight">Git Flow & PRs</h2>
        </div>
        <div className="glass p-10 rounded-[2.5rem] bg-zinc-900/20 border border-zinc-900/50 shadow-2xl relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left md:text-center">
            
            <div className="space-y-6 flex flex-col pt-4">
              <div className="w-16 h-16 bg-zinc-950 shadow-xl rounded-2xl flex items-center justify-center mx-auto border border-zinc-800 ring-4 ring-zinc-900/50">
                <Terminal className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h4 className="text-lg font-black text-white tracking-tight mb-2">Commits</h4>
                {isEditing ? (
                  <textarea
                    value={draft.git_commits}
                    onChange={(e) => setDraft({ ...draft, git_commits: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs font-medium text-zinc-400 text-left outline-none focus:border-indigo-500"
                    rows={4}
                  />
                ) : (
                  <p className="text-sm text-zinc-400 font-medium leading-relaxed whitespace-pre-wrap px-4">
                    {data.git_commits}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-6 flex flex-col pt-4 border-t md:border-t-0 md:border-l border-zinc-800/50 md:pl-8">
              <div className="w-16 h-16 bg-zinc-950 shadow-xl rounded-2xl flex items-center justify-center mx-auto border border-zinc-800 text-emerald-400 ring-4 ring-zinc-900/50">
                <FileCode className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-black text-white tracking-tight mb-2">Review</h4>
                {isEditing ? (
                  <textarea
                    value={draft.git_review}
                    onChange={(e) => setDraft({ ...draft, git_review: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs font-medium text-zinc-400 text-left outline-none focus:border-indigo-500"
                    rows={4}
                  />
                ) : (
                  <p className="text-sm text-zinc-400 font-medium leading-relaxed whitespace-pre-wrap px-4">
                    {data.git_review}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-6 flex flex-col pt-4 border-t md:border-t-0 md:border-l border-zinc-800/50 md:pl-8">
              <div className="w-16 h-16 bg-zinc-950 shadow-xl rounded-2xl flex items-center justify-center mx-auto border border-zinc-800 text-amber-400 ring-4 ring-zinc-900/50">
                <Info className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-black text-white tracking-tight mb-2">Testing</h4>
                {isEditing ? (
                  <textarea
                    value={draft.git_testing}
                    onChange={(e) => setDraft({ ...draft, git_testing: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs font-medium text-zinc-400 text-left outline-none focus:border-indigo-500"
                    rows={4}
                  />
                ) : (
                  <p className="text-sm text-zinc-400 font-medium leading-relaxed whitespace-pre-wrap px-4">
                    {data.git_testing}
                  </p>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Folder Structure */}
      <section className="space-y-8 pb-10 relative">
        <div className="flex items-center gap-3 border-b border-zinc-900 pb-4">
          <FolderTree className="w-6 h-6 text-indigo-400" />
          <h2 className="text-2xl font-black text-white tracking-tight">Project Structure</h2>
        </div>
        {isEditing ? (
          <div className="bg-zinc-950 border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl">
            <TextAreaField label="ASCII Folder Definition" fieldName="folder_structure" />
          </div>
        ) : (
          <div className="glass-card p-10 rounded-[2.5rem] bg-zinc-950/50 border border-zinc-900/50 shadow-xl font-mono text-sm leading-relaxed overflow-x-auto text-indigo-300 whitespace-pre-wrap">
            {data.folder_structure}
          </div>
        )}
      </section>
    </div>
  );
}
