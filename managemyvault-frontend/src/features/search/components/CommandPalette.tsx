import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Building2, User, MapPin, Laptop,
  FileText, Key, Cpu, Sparkles, CornerDownLeft, X, Filter
} from 'lucide-react';
import { useSearchStore } from '../store/searchStore';
import type { SearchResult } from '../store/searchStore';
import { useDebounce } from '../../../shared/hooks/useDebounce';

const CATEGORIES = [
  { value: 'ALL', label: 'All Records', icon: Sparkles },
  { value: 'ORGANIZATION', label: 'Organizations', icon: Building2 },
  { value: 'CONTACT', label: 'Contacts', icon: User },
  { value: 'LOCATION', label: 'Locations', icon: MapPin },
  { value: 'ASSET', label: 'Assets', icon: Laptop },
  { value: 'DOCUMENT', label: 'Documents', icon: FileText },
  { value: 'PASSWORD', label: 'Passwords', icon: Key },
  { value: 'APPLICATION', label: 'Applications', icon: Cpu }
];

export default function CommandPalette() {
  const navigate = useNavigate();
  const { orgId } = useParams<{ orgId?: string }>();
  
  const {
    isOpen,
    query,
    entityType,
    organizationId,
    results,
    suggestions,
    isLoading,
    setIsOpen,
    setQuery,
    setEntityType,
    setOrganizationId,
    performSearch,
    fetchSuggestions,
    clearSearch
  } = useSearchStore();

  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);
  
  const debouncedQuery = useDebounce(query, 300);

  // Set organization filter from current URL context automatically
  useEffect(() => {
    if (orgId) {
      setOrganizationId(orgId);
    } else {
      setOrganizationId(null);
    }
  }, [orgId, setOrganizationId]);

  // Trigger search on query & filters change
  useEffect(() => {
    performSearch();
    fetchSuggestions();
    setActiveIndex(0);
  }, [debouncedQuery, entityType, organizationId, performSearch, fetchSuggestions]);

  // Global keyboard listener for CTRL/CMD + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setIsOpen]);

  // Inner-palette navigation controls (Arrow keys + Enter + ESC)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results[activeIndex]) {
          handleSelectResult(results[activeIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, activeIndex]);

  // Scroll active item into view
  useEffect(() => {
    if (resultsContainerRef.current) {
      const activeEl = resultsContainerRef.current.children[activeIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [activeIndex]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setActiveIndex(0);
    }
  }, [isOpen]);

  const handleSelectResult = (result: SearchResult) => {
    setIsOpen(false);
    clearSearch();
    
    const targetOrgId = result.organizationId || orgId;
    
    switch (result.type) {
      case 'ORGANIZATION':
        navigate(`/org/${result.id}/home`);
        break;
      case 'CONTACT':
        navigate(`/org/${targetOrgId}/contacts`);
        break;
      case 'LOCATION':
        navigate(`/org/${targetOrgId}/locations`);
        break;
      case 'ASSET':
        navigate(`/org/${targetOrgId}/assets`);
        break;
      case 'DOCUMENT':
        navigate(`/org/${targetOrgId}/docs/documents`);
        break;
      case 'PASSWORD':
        navigate(`/org/${targetOrgId}/docs/passwords`);
        break;
      case 'APPLICATION':
        navigate(`/org/${targetOrgId}/apps`);
        break;
      default:
        navigate(`/organizations`);
    }
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'ORGANIZATION': return <Building2 className="w-4 h-4 text-brand-primary" />;
      case 'CONTACT': return <User className="w-4 h-4 text-emerald-500" />;
      case 'LOCATION': return <MapPin className="w-4 h-4 text-rose-500" />;
      case 'ASSET': return <Laptop className="w-4 h-4 text-sky-500" />;
      case 'DOCUMENT': return <FileText className="w-4 h-4 text-amber-500" />;
      case 'PASSWORD': return <Key className="w-4 h-4 text-indigo-500" />;
      case 'APPLICATION': return <Cpu className="w-4 h-4 text-purple-500" />;
      default: return <Sparkles className="w-4 h-4 text-text-muted" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-all"
          />

          {/* Command Palette Modal */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="fixed inset-x-4 top-[10%] mx-auto max-w-2xl bg-vault-surface/90 border border-border-default/60 rounded-2xl shadow-2xl overflow-hidden z-50 backdrop-blur-xl flex flex-col max-h-[60vh] md:max-h-[70vh]"
          >
            {/* Search Input Bar */}
            <div className="flex items-center px-4 py-3 border-b border-border-subtle gap-3">
              <Search className="w-5 h-5 text-text-muted flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search organizations, contacts, assets, passwords..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent border-0 outline-none text-text-primary placeholder-text-muted text-base focus:ring-0 p-0"
              />
              
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="p-1 rounded-md hover:bg-vault-elevated text-text-muted hover:text-text-primary transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              
              <div className="flex items-center gap-1.5 bg-vault-elevated px-2 py-1 rounded-md border border-border-subtle flex-shrink-0 text-text-muted text-[10px] font-semibold">
                ESC
              </div>
            </div>

            {/* Category Pills Scoping Bar */}
            <div className="flex items-center gap-1.5 p-3 overflow-x-auto border-b border-border-subtle scrollbar-none scroll-smooth">
              <Filter className="w-3.5 h-3.5 text-text-muted mr-1 flex-shrink-0" />
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = entityType === cat.value;
                return (
                  <button
                    key={cat.value}
                    onClick={() => setEntityType(cat.value)}
                    className={`flex items-center gap-1.5 px-3 py-1.25 rounded-full text-xs font-medium border transition-all duration-150 flex-shrink-0 ${
                      isActive
                        ? 'bg-brand-primary/15 border-brand-primary text-brand-primary'
                        : 'bg-vault-elevated/45 border-border-subtle text-text-secondary hover:bg-vault-elevated hover:text-text-primary'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Search Suggestions */}
            {suggestions.length > 0 && !query.startsWith(' ') && (
              <div className="px-4 py-2 bg-vault-base/40 border-b border-border-subtle flex items-center gap-2 overflow-x-auto scrollbar-none">
                <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider flex-shrink-0">Suggestions:</span>
                {suggestions.map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setQuery(sug);
                      inputRef.current?.focus();
                    }}
                    className="text-xs bg-vault-elevated hover:bg-vault-card text-text-secondary hover:text-text-primary border border-border-subtle px-2 py-0.75 rounded-md transition-colors flex-shrink-0"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            )}

            {/* Results Area */}
            <div className="flex-1 overflow-y-auto p-2 min-h-0">
              {isLoading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2">
                  <div className="w-8 h-8 rounded-full border-2 border-brand-primary border-t-transparent animate-spin" />
                  <p className="text-sm text-text-muted">Searching index database...</p>
                </div>
              ) : query.trim() === '' ? (
                <div className="py-12 text-center">
                  <Sparkles className="w-8 h-8 text-brand-primary mx-auto opacity-35 mb-2.5" />
                  <p className="text-sm font-semibold text-text-primary">Global Search & Command Palette</p>
                  <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
                    Type a query to search across all components in real-time. Use Arrow keys to navigate and Enter to select.
                  </p>
                </div>
              ) : results.length === 0 ? (
                <div className="py-12 text-center">
                  <X className="w-8 h-8 text-status-danger mx-auto opacity-35 mb-2.5" />
                  <p className="text-sm font-semibold text-text-primary">No results found</p>
                  <p className="text-xs text-text-muted mt-1">
                    Try searching for another record name, serial number, tag, or ip address.
                  </p>
                </div>
              ) : (
                <div ref={resultsContainerRef} className="space-y-1">
                  {results.map((result, idx) => {
                    const isActive = idx === activeIndex;
                    return (
                      <button
                        key={`${result.type}-${result.id}`}
                        onClick={() => handleSelectResult(result)}
                        onMouseEnter={() => setActiveIndex(idx)}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center justify-between border transition-all duration-100 ${
                          isActive
                            ? 'bg-brand-primary/10 border-brand-primary/20 shadow-sm'
                            : 'bg-transparent border-transparent hover:bg-vault-elevated/45'
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className={`p-2 rounded-lg flex items-center justify-center ${
                            isActive ? 'bg-brand-primary/10' : 'bg-vault-elevated'
                          }`}>
                            {getEntityIcon(result.type)}
                          </div>
                          
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-text-primary truncate">
                                {result.title}
                              </span>
                              <span className="text-[10px] font-bold px-1.5 py-0.25 rounded bg-vault-card border border-border-subtle text-text-muted uppercase">
                                {result.type}
                              </span>
                            </div>
                            <p className="text-xs text-text-muted truncate mt-0.5">
                              {result.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">
                          {result.organization && (
                            <span className="text-xs font-medium text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded border border-brand-primary/15 max-w-[120px] truncate">
                              {result.organization}
                            </span>
                          )}
                          
                          {isActive && (
                            <div className="flex items-center gap-1 text-[10px] text-brand-primary font-bold">
                              <span>Open</span>
                              <CornerDownLeft className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom Toolbar Footer */}
            <div className="px-4 py-2.5 bg-vault-elevated/70 border-t border-border-subtle flex items-center justify-between text-[11px] text-text-muted font-medium">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1"><kbd className="bg-vault-base px-1.5 py-0.5 rounded border border-border-subtle">↑↓</kbd> Navigate</span>
                <span className="flex items-center gap-1"><kbd className="bg-vault-base px-1.5 py-0.5 rounded border border-border-subtle">Enter</kbd> Open</span>
                <span className="flex items-center gap-1"><kbd className="bg-vault-base px-1.5 py-0.5 rounded border border-border-subtle">ESC</kbd> Close</span>
              </div>
              
              <div className="flex items-center gap-1 text-brand-primary">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Enterprise Search Powered</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
