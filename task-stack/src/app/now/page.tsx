'use client';

import { useState, useEffect } from 'react';
import type { SliceRow, TaskRow } from '@/lib/datastore';
import AddTaskModal from '@/components/AddTaskModal';

interface SliceWithTask extends SliceRow {
  task: TaskRow;
}

interface NextResponse {
  slice?: SliceWithTask;
  message?: string;
}

export default function NowPage() {
  const [currentSlice, setCurrentSlice] = useState<SliceWithTask | null>(null);
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchNext = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/next');
      const data: NextResponse = await response.json();
      
      if (data.slice) {
        setCurrentSlice(data.slice);
        setMessage('');
      } else {
        setCurrentSlice(null);
        setMessage(data.message || 'No tasks available');
      }
    } catch (error) {
      console.error('Error fetching next slice:', error);
      setMessage('Error loading next task');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: string, snoozeMinutes?: number) => {
    if (!currentSlice) return;
    
    try {
      setActionLoading(true);
      const response = await fetch('/api/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sliceId: currentSlice.id,
          action,
          snoozeMinutes
        })
      });

      if (response.ok) {
        await fetchNext(); // Fetch the next slice
      } else {
        throw new Error('Action failed');
      }
    } catch (error) {
      console.error('Error performing action:', error);
      alert('Error performing action. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    fetchNext();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading your next task...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🤖</span>
            <h1 className="text-2xl font-bold text-gray-900">Jarvis Pop Task Hunter</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          {currentSlice ? (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              {/* Task Info */}
              <div className="mb-6">
                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                  {currentSlice.task.category}
                </h2>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {currentSlice.task.title}
                </h3>
                <p className="text-lg text-gray-700 bg-blue-50 rounded-lg p-4">
                  {currentSlice.title}
                </p>
                <div className="mt-4 text-sm text-gray-500">
                  Slice {currentSlice.sequence_index} • {currentSlice.planned_minutes} minutes
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleAction('done')}
                    disabled={actionLoading}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
                  >
                    ✓ Done
                  </button>
                  <button
                    onClick={() => handleAction('+15')}
                    disabled={actionLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
                  >
                    +15 Min
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleAction('skip')}
                    disabled={actionLoading}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Skip
                  </button>
                  <button
                    onClick={() => handleAction('snooze', 15)}
                    disabled={actionLoading}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Snooze 15m
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">All Done!</h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <button
                onClick={() => window.location.href = '/inbox'}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                View Task Stack
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t p-4">
        <div className="max-w-4xl mx-auto flex justify-center space-x-6">
          <a
            href="/inbox"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            View Stack
          </a>
          <button
            onClick={() => setShowAddModal(true)}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Add Task
          </button>
        </div>
      </footer>

      <AddTaskModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onTaskAdded={() => fetchNext()}
      />
    </div>
  );
}