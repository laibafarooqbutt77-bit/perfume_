import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  Ban,
  CheckCircle2,
  Mail,
  Eye,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useSiteContent } from '../../context/SiteContentContext';
import type { AdminCustomerUser, CustomerMessageItem } from '../../types/cms';
import { ConfirmModal } from './AdminShared';

interface UsersMessagesTabProps {
  onNotify: (msg: string) => void;
}

const ROWS_PER_PAGE = 6;

export const UsersMessagesTab: React.FC<UsersMessagesTabProps> = ({ onNotify }) => {
  const {
    cms,
    upsertUser,
    toggleBlockUser,
    deleteUser,
    updateMessageStatus,
    deleteMessage
  } = useSiteContent();

  const [subTab, setSubTab] = useState<'users' | 'messages'>('users');
  const [userSearch, setUserSearch] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'active' | 'vip' | 'blocked'>('all');
  const [userPage, setUserPage] = useState(1);

  const [msgSearch, setMsgSearch] = useState('');
  const [msgStatusFilter, setMsgStatusFilter] = useState<'all' | 'unread' | 'read' | 'resolved'>('all');

  const [editingUser, setEditingUser] = useState<AdminCustomerUser | null>(null);
  const [viewingUser, setViewingUser] = useState<AdminCustomerUser | null>(null);
  const [viewingMsg, setViewingMsg] = useState<CustomerMessageItem | null>(null);
  const [msgNoteDraft, setMsgNoteDraft] = useState('');

  const [confirmAction, setConfirmAction] = useState<{
    kind: 'block-user' | 'delete-user' | 'delete-msg';
    id: string;
    label: string;
    extra?: string;
  } | null>(null);

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    return cms.users.filter((u) => {
      if (userStatusFilter !== 'all' && u.status !== userStatusFilter) return false;
      if (!q) return true;
      return (
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.city.toLowerCase().includes(q) ||
        u.phone.toLowerCase().includes(q)
      );
    });
  }, [cms.users, userSearch, userStatusFilter]);

  const userTotalPages = Math.max(1, Math.ceil(filteredUsers.length / ROWS_PER_PAGE));
  const safeUserPage = Math.min(userPage, userTotalPages);
  const paginatedUsers = filteredUsers.slice(
    (safeUserPage - 1) * ROWS_PER_PAGE,
    safeUserPage * ROWS_PER_PAGE
  );

  const filteredMessages = useMemo(() => {
    const q = msgSearch.trim().toLowerCase();
    return cms.messages.filter((m) => {
      if (msgStatusFilter !== 'all' && m.status !== msgStatusFilter) return false;
      if (!q) return true;
      return (
        m.senderName.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.subject.toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q)
      );
    });
  }, [cms.messages, msgSearch, msgStatusFilter]);

  const openNewUser = () => {
    const now = new Date().toISOString();
    setEditingUser({
      id: `usr-${Date.now().toString(36)}`,
      fullName: '',
      email: '',
      phone: '',
      city: 'Lahore',
      address: '',
      status: 'active',
      ordersCount: 0,
      totalSpent: 0,
      notes: '',
      joinedAt: now,
      lastActiveAt: now
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl font-semibold text-[#141414] dark:text-[#FAF8F5]">
            Users & Client Messages
          </h1>
          <p className="text-xs sm:text-sm text-[#6B635B] dark:text-[#A89E92]">
            Inspect patron accounts, toggle access, and respond to newsletter or boutique inquiries.
          </p>
        </div>

        <div className="inline-flex rounded-lg bg-white dark:bg-[#191714] border border-[#E5E0D8] dark:border-[#2C2822] p-1">
          <button
            type="button"
            onClick={() => setSubTab('users')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-medium cursor-pointer ${
              subTab === 'users'
                ? 'bg-[#141414] text-white dark:bg-[#D4AF37] dark:text-[#141414]'
                : 'text-[#5C544D] dark:text-[#B5ABA0]'
            }`}
          >
            Customers ({cms.users.length})
          </button>
          <button
            type="button"
            onClick={() => setSubTab('messages')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-medium cursor-pointer ${
              subTab === 'messages'
                ? 'bg-[#141414] text-white dark:bg-[#D4AF37] dark:text-[#141414]'
                : 'text-[#5C544D] dark:text-[#B5ABA0]'
            }`}
          >
            Messages ({cms.messages.filter((m) => m.status === 'unread').length} unread)
          </button>
        </div>
      </div>

      {subTab === 'users' ? (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#191714] border border-[#E5E0D8] dark:border-[#2C2822] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-1 flex-col sm:flex-row gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-[#736B63] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => {
                    setUserSearch(e.target.value);
                    setUserPage(1);
                  }}
                  placeholder="Search customers by name, email, phone, city..."
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24] text-xs"
                />
              </div>
              <select
                value={userStatusFilter}
                onChange={(e) => {
                  setUserStatusFilter(e.target.value as 'all' | 'active' | 'vip' | 'blocked');
                  setUserPage(1);
                }}
                className="px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24] text-xs"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="vip">VIP Patrons</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>

            <button
              type="button"
              onClick={openNewUser}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#141414] hover:bg-[#785E19] dark:bg-[#D4AF37] dark:text-[#141414] text-white text-xs font-semibold cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Patron</span>
            </button>
          </div>

          {/* Users Table */}
          <div className="rounded-xl bg-white dark:bg-[#191714] border border-[#E5E0D8] dark:border-[#2C2822] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#EAE3D9] dark:border-[#2B2620] bg-[#FAF8F5] dark:bg-[#141311] text-[11px] uppercase tracking-wider text-[#6B635B] dark:text-[#A89E92]">
                    <th className="py-3 px-4 font-semibold">Patron</th>
                    <th className="py-3 px-4 font-semibold">City & Phone</th>
                    <th className="py-3 px-4 font-semibold">Orders</th>
                    <th className="py-3 px-4 font-semibold">Total Spent</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EBE3] dark:divide-[#26231E]">
                  {paginatedUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-[#FAF8F5]/70 dark:hover:bg-[#1E1C18]">
                      <td className="py-3 px-4">
                        <p className="font-semibold text-[#141414] dark:text-[#FAF8F5]">
                          {u.fullName}
                        </p>
                        <p className="text-[11px] text-[#6B635B] dark:text-[#A89E92]">{u.email}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-[#141414] dark:text-[#FAF8F5]">{u.city}</p>
                        <p className="text-[11px] font-mono text-[#6B635B] dark:text-[#A89E92]">
                          {u.phone}
                        </p>
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums">{u.ordersCount}</td>
                      <td className="py-3 px-4 font-mono tabular-nums font-semibold text-[#141414] dark:text-[#E6CA85]">
                        ₨ {u.totalSpent.toLocaleString('en-PK')}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-xs text-[10px] font-semibold uppercase tracking-wider ${
                            u.status === 'vip'
                              ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300'
                              : u.status === 'blocked'
                                ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setViewingUser(u)}
                            className="p-1.5 rounded-md border border-[#E5E0D8] dark:border-[#302B24]"
                            aria-label={`View ${u.fullName}`}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingUser({ ...u })}
                            className="p-1.5 rounded-md border border-[#E5E0D8] dark:border-[#302B24]"
                            aria-label={`Edit ${u.fullName}`}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmAction({
                                kind: 'block-user',
                                id: u.id,
                                label: u.fullName,
                                extra: u.status === 'blocked' ? 'Unblock' : 'Block'
                              })
                            }
                            className="p-1.5 rounded-md border border-[#E5E0D8] dark:border-[#302B24]"
                            aria-label={u.status === 'blocked' ? 'Unblock user' : 'Block user'}
                          >
                            {u.status === 'blocked' ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Ban className="w-3.5 h-3.5 text-amber-600" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmAction({
                                kind: 'delete-user',
                                id: u.id,
                                label: u.fullName
                              })
                            }
                            className="p-1.5 rounded-md border border-[#E5E0D8] dark:border-[#302B24] text-red-600"
                            aria-label={`Delete ${u.fullName}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {paginatedUsers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-[#6B635B] dark:text-[#A89E92]">
                        No customers match your filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-3 border-t border-[#EAE3D9] dark:border-[#2B2620] flex items-center justify-between text-xs text-[#6B635B] dark:text-[#A89E92]">
              <span className="font-mono tabular-nums">
                {filteredUsers.length} customers
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={safeUserPage <= 1}
                  onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-md border border-[#DDD6CB] dark:border-[#302B24] disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-mono tabular-nums">
                  {safeUserPage} / {userTotalPages}
                </span>
                <button
                  type="button"
                  disabled={safeUserPage >= userTotalPages}
                  onClick={() => setUserPage((p) => Math.min(userTotalPages, p + 1))}
                  className="p-1.5 rounded-md border border-[#DDD6CB] dark:border-[#302B24] disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Messages & Subscribers Inbox */
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-xl bg-white dark:bg-[#191714] border border-[#E5E0D8] dark:border-[#2C2822] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-[#736B63] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={msgSearch}
                onChange={(e) => setMsgSearch(e.target.value)}
                placeholder="Search messages or subscribers..."
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24]"
              />
            </div>

            <select
              value={msgStatusFilter}
              onChange={(e) =>
                setMsgStatusFilter(e.target.value as 'all' | 'unread' | 'read' | 'resolved')
              }
              className="px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24]"
            >
              <option value="all">All Messages</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          <div className="divide-y divide-[#F0EBE3] dark:divide-[#26231E] rounded-xl bg-white dark:bg-[#191714] border border-[#E5E0D8] dark:border-[#2C2822] overflow-hidden">
            {filteredMessages.map((msg) => (
              <div
                key={msg.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FAF8F5]/70 dark:hover:bg-[#1E1C18]"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-xs text-[10px] font-semibold uppercase tracking-wider ${
                        msg.status === 'unread'
                          ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300'
                          : msg.status === 'resolved'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                      }`}
                    >
                      {msg.status}
                    </span>
                    <span className="font-semibold text-[#141414] dark:text-[#FAF8F5]">
                      {msg.subject}
                    </span>
                    <span className="text-[11px] text-[#6B635B] dark:text-[#A89E92]">
                      · {msg.senderName} ({msg.email})
                    </span>
                  </div>
                  <p className="text-[#4A443E] dark:text-[#C7BEB2] line-clamp-1">{msg.message}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setViewingMsg(msg);
                      setMsgNoteDraft(msg.adminNote || '');
                      if (msg.status === 'unread') {
                        updateMessageStatus(msg.id, 'read');
                      }
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-[#DDD6CB] dark:border-[#302B24] font-medium"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Open</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setConfirmAction({
                        kind: 'delete-msg',
                        id: msg.id,
                        label: msg.subject
                      })
                    }
                    className="p-1.5 rounded-md border border-[#DDD6CB] dark:border-[#302B24] text-red-600"
                    aria-label="Delete message"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
            {filteredMessages.length === 0 && (
              <div className="py-12 text-center text-[#6B635B] dark:text-[#A89E92]">
                No messages match your search.
              </div>
            )}
          </div>
        </div>
      )}

      {/* View User Details Modal */}
      {viewingUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
          onClick={() => setViewingUser(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-xl bg-white dark:bg-[#191714] border border-[#E5E0D8] dark:border-[#2C2822] p-6 space-y-4 text-xs shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-serif-luxury text-xl font-semibold">{viewingUser.fullName}</h3>
              <button type="button" onClick={() => setViewingUser(null)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 text-[#4A443E] dark:text-[#D4C8B8]">
              <p><strong>Email:</strong> {viewingUser.email}</p>
              <p><strong>Phone:</strong> {viewingUser.phone}</p>
              <p><strong>Address:</strong> {viewingUser.address}, {viewingUser.city}</p>
              <p><strong>Orders:</strong> {viewingUser.ordersCount} (₨ {viewingUser.totalSpent.toLocaleString('en-PK')})</p>
              <p><strong>Notes:</strong> {viewingUser.notes || 'None'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Add User Modal */}
      {editingUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
          onClick={() => setEditingUser(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-xl bg-white dark:bg-[#191714] border border-[#E5E0D8] dark:border-[#2C2822] p-6 space-y-4 text-xs shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-serif-luxury text-xl font-semibold">
                {cms.users.some((u) => u.id === editingUser.id) ? 'Edit Patron' : 'Add Patron'}
              </h3>
              <button type="button" onClick={() => setEditingUser(null)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  value={editingUser.fullName}
                  onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24]"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Email *</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24]"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Phone</label>
                <input
                  type="text"
                  value={editingUser.phone}
                  onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24]"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">City</label>
                <input
                  type="text"
                  value={editingUser.city}
                  onChange={(e) => setEditingUser({ ...editingUser, city: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1">Status</label>
                <select
                  value={editingUser.status}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      status: e.target.value as AdminCustomerUser['status']
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24]"
                >
                  <option value="active">Active</option>
                  <option value="vip">VIP</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Address</label>
                <input
                  type="text"
                  value={editingUser.address}
                  onChange={(e) => setEditingUser({ ...editingUser, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1">Internal Notes</label>
              <textarea
                rows={2}
                value={editingUser.notes || ''}
                onChange={(e) => setEditingUser({ ...editingUser, notes: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 rounded-lg border border-[#DDD6CB] dark:border-[#302B24]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!editingUser.fullName.trim()) return;
                  upsertUser({ ...editingUser, lastActiveAt: new Date().toISOString() });
                  onNotify(`Saved customer "${editingUser.fullName}".`);
                  setEditingUser(null);
                }}
                className="px-4 py-2 rounded-lg bg-[#141414] dark:bg-[#D4AF37] dark:text-[#141414] text-white font-semibold"
              >
                Save Customer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View/Respond Message Modal */}
      {viewingMsg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
          onClick={() => setViewingMsg(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-xl bg-white dark:bg-[#191714] border border-[#E5E0D8] dark:border-[#2C2822] p-6 space-y-4 text-xs shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-serif-luxury text-xl font-semibold">{viewingMsg.subject}</h3>
              <button type="button" onClick={() => setViewingMsg(null)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-3 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#EAE3D9] dark:border-[#2B2620] space-y-1">
              <p><strong>From:</strong> {viewingMsg.senderName} ({viewingMsg.email})</p>
              <p><strong>Source:</strong> {viewingMsg.source}</p>
              <p className="pt-2 text-[#141414] dark:text-[#FAF8F5] leading-relaxed">
                {viewingMsg.message}
              </p>
            </div>
            <div>
              <label className="block font-semibold mb-1">Admin Follow-up Note</label>
              <textarea
                rows={2}
                value={msgNoteDraft}
                onChange={(e) => setMsgNoteDraft(e.target.value)}
                placeholder="Log concierge response or order note..."
                className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] dark:bg-[#141311] border border-[#DDD6CB] dark:border-[#302B24]"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  updateMessageStatus(viewingMsg.id, 'read', msgNoteDraft);
                  onNotify('Saved message note.');
                  setViewingMsg(null);
                }}
                className="px-4 py-2 rounded-lg border border-[#DDD6CB] dark:border-[#302B24]"
              >
                Save as Read
              </button>
              <button
                type="button"
                onClick={() => {
                  updateMessageStatus(viewingMsg.id, 'resolved', msgNoteDraft);
                  onNotify('Marked message as resolved.');
                  setViewingMsg(null);
                }}
                className="px-4 py-2 rounded-lg bg-[#141414] dark:bg-[#D4AF37] dark:text-[#141414] text-white font-semibold"
              >
                Mark Resolved
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={confirmAction !== null}
        title={
          confirmAction?.kind === 'block-user'
            ? `${confirmAction.extra} Patron Account?`
            : 'Confirm Deletion'
        }
        description={
          confirmAction?.kind === 'block-user'
            ? `${confirmAction.extra} customer "${confirmAction.label}"? You can reverse this anytime.`
            : `Delete "${confirmAction?.label}" from local storage?`
        }
        confirmLabel={confirmAction?.kind === 'block-user' ? confirmAction.extra : 'Delete'}
        danger={confirmAction?.kind !== 'block-user'}
        onCancel={() => setConfirmAction(null)}
        onConfirm={() => {
          if (!confirmAction) return;
          if (confirmAction.kind === 'block-user') {
            toggleBlockUser(confirmAction.id);
            onNotify(`Updated account status for "${confirmAction.label}".`);
          } else if (confirmAction.kind === 'delete-user') {
            deleteUser(confirmAction.id);
            onNotify(`Deleted customer "${confirmAction.label}".`);
          } else if (confirmAction.kind === 'delete-msg') {
            deleteMessage(confirmAction.id);
            onNotify('Deleted message.');
          }
          setConfirmAction(null);
        }}
      />
    </div>
  );
};
