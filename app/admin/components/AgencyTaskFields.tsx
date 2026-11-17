'use client';

import { useState } from 'react';
import { newId, now, type Task } from '../../../lib/admin-system/model';

export function AgencyTaskFields({ value, onChange }: { value: Record<string, unknown>; onChange: (next: Record<string, unknown>) => void }) {
  const [checkText, setCheckText] = useState(''), [commentText, setCommentText] = useState('');
  const checklist = Array.isArray(value.checklist) ? value.checklist as Task['checklist'] : [];
  const comments = Array.isArray(value.comments) ? value.comments as Task['comments'] : [];
  return <div className="agency-task-fields">
    <h3>Checklist</h3>{checklist.map(item => <label key={item.id}><input type="checkbox" checked={item.done} onChange={event => onChange({ ...value, checklist: checklist.map(row => row.id === item.id ? { ...row, done: event.target.checked } : row) })} /><span>{item.text}</span><button type="button" onClick={() => onChange({ ...value, checklist: checklist.filter(row => row.id !== item.id) })} aria-label={`Remove ${item.text}`}>×</button></label>)}
    <div className="agency-task-add"><input aria-label="New checklist item" placeholder="Add a step" value={checkText} onChange={event => setCheckText(event.target.value)} /><button type="button" onClick={() => { if (!checkText.trim()) return; onChange({ ...value, checklist: [...checklist, { id: newId(), text: checkText.trim(), done: false }] }); setCheckText(''); }}>Add step</button></div>
    <h3>Internal comments</h3>{comments.map(item => <p key={item.id}><span>{item.text}</span><small>{new Date(item.at).toLocaleString('en-IN')}</small></p>)}
    <div className="agency-task-add"><input aria-label="New internal comment" placeholder="Write a note" value={commentText} onChange={event => setCommentText(event.target.value)} /><button type="button" onClick={() => { if (!commentText.trim()) return; onChange({ ...value, comments: [...comments, { id: newId(), text: commentText.trim(), at: now() }] }); setCommentText(''); }}>Add note</button></div>
  </div>;
}
