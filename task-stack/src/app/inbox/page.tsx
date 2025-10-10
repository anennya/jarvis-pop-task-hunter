'use client';

import { useState, useEffect } from 'react';
import type { SliceRow, TaskRow } from '@/lib/datastore';
import AddTaskModal from '@/components/AddTaskModal';
import EditTaskModal from '@/components/EditTaskModal';

interface TaskWithSlices extends TaskRow {
  slices: SliceRow[];
}

export default function InboxPage() {
  const [tasks, setTasks] = useState<TaskWithSlices[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskRow | null>(null);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | 'todo' | 'done'>('all');

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tasks');
      const data = await response.json();
      setTasks(data.tasks || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskExpansion = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const getTaskProgress = (task: TaskWithSlices) => {
    const totalSlices = task.slices.length;
    const completedSlices = task.slices.filter(s => s.status === 'done').length;
    return { completed: completedSlices, total: totalSlices };
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    const progress = getTaskProgress(task);
    if (filter === 'done') return progress.completed === progress.total;
    if (filter === 'todo') return progress.completed < progress.total;
    return true;
  });

  const handleEditTask = (task: TaskRow) => {
    setEditingTask(task);
    setShowEditModal(true);
  };

  const handleTaskUpdated = () => {
    fetchTasks();
  };

  const handleTaskDeleted = () => {
    fetchTasks();
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading your tasks...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🤖</span>
              <h1 className="text-2xl font-bold text-gray-900">Jarvis Pop Task Hunter</h1>
            </div>
            <div className="flex space-x-3">
              <a
                href="/import"
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Import Tasks
              </a>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex space-x-2">
          {[
            { key: 'all', label: 'All Tasks' },
            { key: 'todo', label: 'In Progress' },
            { key: 'done', label: 'Completed' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key as 'all' | 'todo' | 'done')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks List */}
      <main className="max-w-4xl mx-auto px-4 pb-8">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No tasks found</h2>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? "Get started by adding your first task!"
                : `No ${filter} tasks at the moment.`
              }
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Add Task
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task) => {
              const progress = getTaskProgress(task);
              const isExpanded = expandedTasks.has(task.id);
              const isCompleted = progress.completed === progress.total;

              return (
                <div
                  key={task.id}
                  className={`bg-white rounded-lg shadow-sm border transition-all ${
                    isCompleted ? 'bg-green-50 border-green-200' : 'border-gray-200'
                  }`}
                >
                  <div
                    className="p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => toggleTaskExpansion(task.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className={`text-lg font-semibold ${
                            isCompleted ? 'text-green-800 line-through' : 'text-gray-900'
                          }`}>
                            {task.title}
                          </h3>
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                            {task.category}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                          <span>
                            {progress.completed}/{progress.total} slices completed
                          </span>
                          <span>•</span>
                          <span>{task.estimate_minutes}min estimated</span>
                          {task.due_at && (
                            <>
                              <span>•</span>
                              <span>Due {new Date(task.due_at).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditTask(task);
                          }}
                          className="text-gray-400 hover:text-blue-600 p-1"
                          title="Edit task"
                        >
                          ✏️
                        </button>
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              isCompleted ? 'bg-green-500' : 'bg-blue-500'
                            }`}
                            style={{
                              width: `${(progress.completed / progress.total) * 100}%`
                            }}
                          ></div>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600">
                          {isExpanded ? '−' : '+'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-gray-200 p-4">
                      <div className="space-y-2">
                        {task.slices.map((slice, index) => (
                          <div
                            key={slice.id}
                            className={`flex items-center p-3 rounded-lg ${
                              slice.status === 'done'
                                ? 'bg-green-50 border border-green-200'
                                : slice.status === 'doing'
                                ? 'bg-blue-50 border border-blue-200'
                                : 'bg-gray-50 border border-gray-200'
                            }`}
                          >
                            <div className="flex items-center space-x-3 flex-1">
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                                slice.status === 'done'
                                  ? 'bg-green-500 text-white'
                                  : slice.status === 'doing'
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-300 text-gray-700'
                              }`}>
                                {slice.status === 'done' ? '✓' : index + 1}
                              </span>
                              <span className={`${
                                slice.status === 'done' ? 'line-through text-gray-500' : 'text-gray-900'
                              }`}>
                                {slice.title}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500">
                              {slice.planned_minutes}m
                              {slice.skip_count > 0 && (
                                <span className="ml-2 text-yellow-600">
                                  Skipped {slice.skip_count}x
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Navigation */}
      <div className="fixed bottom-4 right-4">
        <a
          href="/now"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-full shadow-lg transition-colors"
        >
          → Now
        </a>
      </div>

      <AddTaskModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onTaskAdded={() => fetchTasks()}
      />

      <EditTaskModal
        isOpen={showEditModal}
        task={editingTask}
        onClose={() => {
          setShowEditModal(false);
          setEditingTask(null);
        }}
        onTaskUpdated={handleTaskUpdated}
        onTaskDeleted={handleTaskDeleted}
      />
    </div>
  );
}