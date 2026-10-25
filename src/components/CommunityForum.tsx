'use client';

import React, { useState } from 'react';
import {
  MessageSquare,
  ThumbsUp,
  CheckCircle2,
  PlusCircle,
  Sparkles,
  Search,
  UserCheck,
  Send,
  HelpCircle,
  Share2
} from 'lucide-react';
import { CommunityPost, User, Course } from '@/types';
import { saveStoredData } from '@/lib/storage';

interface CommunityForumProps {
  posts: CommunityPost[];
  courses: Course[];
  currentUser: User;
  courseId?: string; // Optional: filter to current course
  onRefresh: () => void;
}

export default function CommunityForum({
  posts,
  courses,
  currentUser,
  courseId,
  onRefresh
}: CommunityForumProps) {
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterResolved, setFilterResolved] = useState<'all' | 'resolved' | 'unresolved'>('all');

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [newCourseId, setNewCourseId] = useState(courseId || courses[0]?.id || '');
  const [newTags, setNewTags] = useState('Physics, Formula');

  // Reply State: map of postId -> reply text
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});

  const filteredPosts = posts.filter((p) => {
    if (courseId && p.courseId && p.courseId !== courseId) return false;
    if (filterResolved === 'resolved' && !p.isResolved) return false;
    if (filterResolved === 'unresolved' && p.isResolved) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchBody = p.question.toLowerCase().includes(q);
      const matchAuthor = p.authorName.toLowerCase().includes(q);
      const matchTag = p.tags.some((t) => t.toLowerCase().includes(q));
      return matchTitle || matchBody || matchAuthor || matchTag;
    }
    return true;
  });

  const handleUpvotePost = (postId: string) => {
    const updated = posts.map((p) => (p.id === postId ? { ...p, upvotes: p.upvotes + 1 } : p));
    saveStoredData('COMMUNITY_POSTS', updated);
    onRefresh();
  };

  const handleUpvoteAnswer = (postId: string, ansId: string) => {
    const updated = posts.map((p) => {
      if (p.id === postId) {
        return {
          ...p,
          answers: p.answers.map((a) => (a.id === ansId ? { ...a, upvotes: a.upvotes + 1 } : a))
        };
      }
      return p;
    });
    saveStoredData('COMMUNITY_POSTS', updated);
    onRefresh();
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newQuestion.trim()) return;

    const courseObj = courses.find((c) => c.id === newCourseId);

    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      courseId: newCourseId,
      courseTitle: courseObj?.title || 'General Doubt',
      authorName: currentUser.name,
      authorPhone: currentUser.phone,
      title: newTitle.trim(),
      question: newQuestion.trim(),
      tags: newTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      createdAt: 'Just now',
      upvotes: 1,
      isResolved: false,
      answers: []
    };

    const updated = [newPost, ...posts];
    saveStoredData('COMMUNITY_POSTS', updated);
    setNewTitle('');
    setNewQuestion('');
    setShowNewPostModal(false);
    onRefresh();
  };

  const handleAddReply = (postId: string) => {
    const replyText = replyTextMap[postId];
    if (!replyText || !replyText.trim()) return;

    const isGuruji = currentUser.role === 'admin';

    const updated = posts.map((p) => {
      if (p.id === postId) {
        const newAns = {
          id: `ans-${Date.now()}`,
          authorName: isGuruji ? `${currentUser.name} (ICC KE GURUJI)` : currentUser.name,
          authorRole: isGuruji ? ('guruji' as const) : ('student' as const),
          text: replyText.trim(),
          createdAt: 'Just now',
          upvotes: 0
        };
        return {
          ...p,
          isResolved: isGuruji ? true : p.isResolved,
          answers: [...p.answers, newAns]
        };
      }
      return p;
    });

    saveStoredData('COMMUNITY_POSTS', updated);
    setReplyTextMap({ ...replyTextMap, [postId]: '' });
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            Doubt Discussion Forum
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Ask questions, get verified solutions directly from Guruji and share study tricks with peers.
          </p>
        </div>

        <button
          onClick={() => setShowNewPostModal(true)}
          className="px-4.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Ask a Doubt
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search doubts or concepts..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <button
            onClick={() => setFilterResolved('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              filterResolved === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            All Doubts ({posts.length})
          </button>
          <button
            onClick={() => setFilterResolved('resolved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${
              filterResolved === 'resolved'
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Answered by Guruji
          </button>
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4"
            >
              {/* Question Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-extrabold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md">
                      {post.authorName}
                    </span>
                    <span className="text-[11px] text-slate-400">• {post.createdAt}</span>
                    {post.isResolved && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Verified Solution
                      </span>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">{post.title}</h3>
                </div>

                {/* Upvote Button */}
                <button
                  onClick={() => handleUpvotePost(post.id)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-blue-400 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-bold flex items-center gap-1.5 transition-all shrink-0"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  {post.upvotes}
                </button>
              </div>

              {/* Question Body */}
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50/60 p-4 rounded-2xl border border-slate-100">
                {post.question}
              </p>

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  {post.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Answers Section */}
              <div className="border-t border-slate-100 pt-3 space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Answers &amp; Solutions ({post.answers.length})
                </h4>

                {post.answers.map((ans) => {
                  const isGuruji = ans.authorRole === 'guruji';
                  return (
                    <div
                      key={ans.id}
                      className={`p-4 rounded-2xl border ${
                        isGuruji
                          ? 'bg-amber-50/50 border-amber-200 ring-1 ring-amber-300/40'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-black px-2.5 py-0.5 rounded-md ${
                              isGuruji
                                ? 'bg-amber-100 text-amber-900 flex items-center gap-1'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {isGuruji && <Sparkles className="w-3.5 h-3.5 text-amber-600" />}
                            {ans.authorName}
                          </span>
                          <span className="text-[10px] text-slate-400">{ans.createdAt}</span>
                        </div>
                        <button
                          onClick={() => handleUpvoteAnswer(post.id, ans.id)}
                          className="text-[11px] font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1"
                        >
                          <ThumbsUp className="w-3 h-3" />
                          {ans.upvotes}
                        </button>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-sans">
                        {ans.text}
                      </p>
                    </div>
                  );
                })}

                {/* Reply Input */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={replyTextMap[post.id] || ''}
                    onChange={(e) =>
                      setReplyTextMap({ ...replyTextMap, [post.id]: e.target.value })
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddReply(post.id);
                    }}
                    placeholder={
                      currentUser.role === 'admin'
                        ? 'Guruji: Type verified solution here...'
                        : 'Write your answer or explanation...'
                    }
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => handleAddReply(post.id)}
                    className="p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-colors shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
            <HelpCircle className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <h4 className="font-bold text-slate-800">No Doubts Found</h4>
            <p className="text-xs text-slate-500 mt-1">
              Be the first student to ask a doubt or question to Guruji!
            </p>
          </div>
        )}
      </div>

      {/* New Post Modal */}
      {showNewPostModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                Ask Guruji &amp; Batchmates
              </h3>
              <button
                onClick={() => setShowNewPostModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Course</label>
                <select
                  value={newCourseId}
                  onChange={(e) => setNewCourseId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Doubt Title (Short &amp; Clear)
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Electric flux through cylinder question doubt"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Detailed Explanation / Question
                </label>
                <textarea
                  rows={4}
                  required
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="Describe your question in detail. Where did you get stuck? Mention step numbers if applicable."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="e.g. Physics, Class12, GaussLaw"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewPostModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-xs"
                >
                  Post Doubt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
