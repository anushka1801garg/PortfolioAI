import React from "react";
import ModernTemplate from "./ModernTemplate";

class TemplateErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[TemplateErrorBoundary] Template crashed:", error, errorInfo);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.templateKey !== this.props.templateKey && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.state.fallbackMode) {
        return (
          <div>
            <div className="bg-amber-950/80 border-b border-amber-500/40 px-6 py-2.5 text-center text-xs text-amber-300 font-mono flex items-center justify-center gap-2">
              <span>⚠️ Temporary fallback active for template: {this.props.templateKey}</span>
              <button
                type="button"
                onClick={() => this.setState({ hasError: false, error: null, fallbackMode: false })}
                className="underline hover:text-white ml-2 cursor-pointer font-bold"
              >
                Retry Original Template
              </button>
            </div>
            <ModernTemplate portfolio={this.props.portfolio} />
          </div>
        );
      }

      return (
        <div className="min-h-[50vh] bg-zinc-950 text-white p-6 sm:p-10 flex flex-col items-center justify-center">
          <div className="max-w-md w-full rounded-3xl bg-zinc-900/90 border border-red-500/30 p-6 text-center space-y-4 shadow-2xl backdrop-blur-xl">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 mx-auto flex items-center justify-center text-xl font-bold">
              ⚠️
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Unable to Render &quot;{this.props.templateKey}&quot;
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                A rendering issue was detected in this layout template.
              </p>
              {this.state.error?.message && (
                <p className="text-[11px] font-mono text-red-300 bg-red-950/40 p-2.5 rounded-xl border border-red-500/20 mt-3 text-left overflow-x-auto">
                  {this.state.error.message}
                </p>
              )}
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <button
                type="button"
                onClick={() => this.setState({ hasError: false, error: null })}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition cursor-pointer shadow-lg shadow-indigo-600/30"
              >
                Retry &quot;{this.props.templateKey}&quot;
              </button>
              <button
                type="button"
                onClick={() => this.setState({ fallbackMode: true })}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold transition cursor-pointer border border-zinc-700"
              >
                View Modern Fallback
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default TemplateErrorBoundary;
