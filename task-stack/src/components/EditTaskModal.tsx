'use client';

import { useState, useEffect } from 'react';
import { CATEGORY_TEMPLATES } from '@/lib/templates';
import type { TaskRow } from '@/lib/datastore';

interface EditTaskModalProps {
  isOpen: boolean;
  task: TaskRow | null;
  onClose: () => void;
  onTaskUpdated: () => void;
  onTaskDeleted?: () => void;
}

export default function EditTaskModal({ 
  isOpen, 
  task, 
  onClose, 
  onTaskUpdated, 
  onTaskDeleted 
}: EditTaskModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [estimateMinutes, setEstimateMinutes] = useState('');
  const [dueAt, setDueAt] = useState('');
  const [importance, setImportance] = useState('3');
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Reset form when task changes
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setCategory(task.category || '');
      setEstimateMinutes(String(task.estimate_minutes || ''));
      setDueAt(task.due_at ? task.due_at.slice(0, 16) : ''); // Format for datetime-local
      setImportance(String(task.importance || 3));
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !task) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          category: category || undefined,
          estimateMinutes: estimateMinutes ? parseInt(estimateMinutes) : undefined,
          dueAt: dueAt || undefined,
          importance: parseInt(importance)
        })
      });

      if (response.ok) {
        onClose();
        onTaskUpdated();
      } else {
        throw new Error('Failed to update task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!task) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        onClose();
        onTaskDeleted?.();
      } else {
        throw new Error('Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Edit Task</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
              disabled={loading}
            >
              ×
            </button>
          </div>

          {!showDeleteConfirm ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What needs to be done?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                >
                  <option value="">Auto-detect from title</option>
                  {CATEGORY_TEMPLATES.map((template) => (
                    <option key={template.category} value={template.category}>
                      {template.category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="estimate" className="block text-sm font-medium text-gray-700 mb-1">
                    Estimate (min)
                  </label>
                  <input
                    type="number"
                    id="estimate"
                    value={estimateMinutes}
                    onChange={(e) => setEstimateMinutes(e.target.value)}
                    placeholder="Auto"
                    min="15"
                    step="15"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label htmlFor="importance" className="block text-sm font-medium text-gray-700 mb-1">
                    Importance
                  </label>
                  <select
                    id="importance"
                    value={importance}
                    onChange={(e) => setImportance(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={loading}
                  >
                    <option value="1">1 - Low</option>
                    <option value="2">2 - Medium Low</option>
                    <option value="3">3 - Medium</option>
                    <option value="4">4 - High</option>
                    <option value="5">5 - Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="dueAt" className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date (optional)
                </label>
                <input
                  type="datetime-local"
                  id="dueAt"
                  value={dueAt}
                  onChange={(e) => setDueAt(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  disabled={loading}
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  disabled={loading || !title.trim()}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Task?</h3>
                <p className="text-gray-600 mb-6">
                  This will permanently delete &quot;{task.title}&quot; and all its slices. This cannot be undone.
                </p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Deleting...' : 'Delete Forever'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}