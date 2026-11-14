import { useState } from "react";
import { History, RotateCcw, GitCompare, Check, X, Clock, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";
import { restoreVersion } from "../services/portfolioService";

const VersionHistoryModal = ({ portfolio, isOpen, onClose, onRestored }) => {
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [restoring, setRestoring] = useState(false);
  const [compareMode, setCompareMode] = useState(false);

  if (!isOpen || !portfolio) return null;

  const versions = portfolio.versions || [
    {
      versionNumber: 1,
      name: "Initial Version",
      changedBy: "User",
      changeSummary: "Created portfolio",
      createdAt: portfolio.createdAt || new Date(),
    },
  ];

  const currentVersionNum = versions.length;
  const activeVersion = selectedVersion || versions[versions.length - 1];

  const handleRestore = async (versionNum) => {
    if (!versionNum) return;
    setRestoring(true);
    try {
      const res = await restoreVersion(portfolio._id, versionNum);
      if (res.data?.success) {
        toast.success(`Successfully restored to Version ${versionNum}! 🎉`);
        if (onRestored) onRestored(res.data.portfolio);
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to restore version");
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-3xl rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl flex flex-col overflow-hidden max-h-[85vh]">
        {/* Header */}
        <div className="p-6 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <History size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Version History &amp; Rollback</span>
                <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-[10px] font-mono text-zinc-400">
                  {versions.length} Snapshots
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Track all manual edits, AI optimizations, and restore any previous point in time.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 flex items-center justify-center transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Split */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-zinc-800 overflow-hidden">
          {/* Timeline List */}
          <div className="p-4 space-y-2 overflow-y-auto max-h-[55vh] md:col-span-1">
            <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 px-2">
              Timeline Snapshots
            </p>
            {versions.slice().reverse().map((ver, idx) => {
              const isCurrent = ver.versionNumber === currentVersionNum;
              const isSelected = activeVersion?.versionNumber === ver.versionNumber;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedVersion(ver)}
                  className={`p-3 rounded-2xl border transition cursor-pointer space-y-1 ${
                    isSelected
                      ? "bg-indigo-600/15 border-indigo-500/40 text-white"
                      : "bg-zinc-900/50 border-zinc-850 hover:border-zinc-700 text-zinc-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-300 truncate">
                      {ver.name || "Snapshot"}
                    </span>
                    {isCurrent && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-zinc-300 truncate">{ver.changeSummary || "Snapshot recorded"}</p>
                  <p className="text-[10px] text-zinc-500 flex items-center gap-1">
                    <Clock size={10} />
                    <span>{new Date(ver.createdAt || Date.now()).toLocaleDateString()}</span>
                    <span>• {ver.changedBy || "User"}</span>
                  </p>
                </div>
              );
            })}
          </div>

          {/* Details & Compare Preview */}
          <div className="p-6 overflow-y-auto max-h-[55vh] md:col-span-2 space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{activeVersion?.name || "Snapshot Details"}</span>
                </h3>
                <p className="text-xs text-zinc-400 pt-0.5">
                  Summary: {activeVersion?.changeSummary || "Snapshot recorded"}
                </p>
              </div>

              {activeVersion?.versionNumber !== currentVersionNum && (
                <button
                  onClick={() => handleRestore(activeVersion?.versionNumber)}
                  disabled={restoring}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 transition shadow"
                >
                  <RotateCcw size={13} />
                  <span>Rollback to This Snapshot</span>
                </button>
              )}
            </div>

            {/* Snapshot field comparison preview */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                  Headline / Title Snapshot
                </span>
                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200">
                  {activeVersion?.snapshot?.tagline || activeVersion?.snapshot?.hero?.tagline || portfolio?.tagline || "No headline saved"}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                  About Narrative Snapshot
                </span>
                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 leading-relaxed font-light">
                  {activeVersion?.snapshot?.about || portfolio?.about || "No bio saved"}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                  Active Template
                </span>
                <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono text-indigo-400 capitalize">
                  {activeVersion?.snapshot?.template || portfolio?.template || "modern"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
          <span>Snapshots are created automatically before major AI optimizations.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default VersionHistoryModal;
