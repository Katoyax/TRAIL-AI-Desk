import { useSyncExternalStore } from 'react';
import { useSession } from './auth';
import type { Session } from './auth';
import type { ChatSource, CheckVerification } from './chat';

export type DeskMessage = { id: string; text: string; sender: 'user' | 'ai'; sources?: ChatSource[]; verification?: CheckVerification; error?: boolean; retryQuestion?: string };
export type Conversation = { id: string; title: string; updatedAt: string; messages: DeskMessage[] };
type State = { activeId: string | null; conversations: Conversation[]; pendingId: string | null };
const empty: State = { activeId: null, conversations: [], pendingId: null };
let sequence = 0;
const uniqueId = () => `${Date.now()}-${++sequence}`;

function createStore() {
  let state = empty;
  const listeners = new Set<() => void>();
  const update = (next: State) => { state = next; listeners.forEach((listener) => listener()); };
  return {
    snapshot: () => state,
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    start: () => { const id = uniqueId(); update({ ...state, activeId: id, conversations: [{ id, title: 'New conversation', updatedAt: new Date().toISOString(), messages: [] }, ...state.conversations] }); return id; },
    select: (id: string) => { if (state.conversations.some((item) => item.id === id)) update({ ...state, activeId: id }); },
    begin: (id: string) => { if (state.pendingId) return false; update({ ...state, pendingId: id }); return true; },
    finish: (id: string) => { if (state.pendingId === id) update({ ...state, pendingId: null }); },
    append: (id: string, message: Omit<DeskMessage, 'id'>) => {
      update({ ...state, conversations: state.conversations.map((item) => item.id === id ? {
        ...item, title: item.messages.length === 0 && message.sender === 'user' ? message.text.slice(0,80) : item.title,
        updatedAt: new Date().toISOString(), messages: [...item.messages, { ...message, id: uniqueId() }],
      } : item) });
    },
    clear: () => update(empty),
  };
}

// A separate, memory-only store per session. No transcript is persisted to disk,
// shared across users, or restored after logout/reload.
const stores = new WeakMap<Session, ReturnType<typeof createStore>>();
const guestStore = createStore();
const serverSnapshot = () => empty;
export function useConversations() {
  const session = useSession();
  let store = session ? stores.get(session) : guestStore;
  if (!store) { store = createStore(); stores.set(session!, store); }
  const state = useSyncExternalStore(store.subscribe, store.snapshot, serverSnapshot);
  return { ...state, active: state.conversations.find((item) => item.id === state.activeId), start: store.start, select: store.select, append: store.append, begin: store.begin, finish: store.finish, clear: store.clear };
}
