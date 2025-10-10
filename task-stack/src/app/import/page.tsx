'use client';

import { useState } from 'react';
import { CATEGORY_TEMPLATES } from '@/lib/templates';
import { classifyTask } from '@/lib/classifier';

interface ParsedTask {
  title: string;
  category: string;
  estimateMinutes: number;
  importance: number;
  dueAt: string;
  originalLine: string;
}

interface ImportResult {
  success: boolean;
  processed: number;
  tasks: Array<{
    title: string;
    category: string;
    sliceCount: number;
    estimateMinutes: number;
  }>;
  errors: Array<{
    title: string;
    error: string;
  }>;
}

export default function ImportPage() {
  const [rawText, setRawText] = useState('');
  const [parsedTasks, setParsedTasks] = useState<ParsedTask[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const parseText = () => {
    const lines = rawText.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .filter(line => !line.startsWith('#') && !line.startsWith('//'));

    const tasks: ParsedTask[] = lines.map(line => {
      let title = line;
      
      // Remove common prefixes
      title = title.replace(/^[-*•]\s*/, ''); // Remove bullet points
      title = title.replace(/^\d+\.\s*/, ''); // Remove numbered lists
      title = title.replace(/^TODO:\s*/i, ''); // Remove TODO:
      
      const category = classifyTask(title);
      const template = CATEGORY_TEMPLATES.find(t => t.category === category);
      const estimateMinutes = template?.defaultEstimate || 30;

      return {
        title: title.trim(),
        category,
        estimateMinutes,
        importance: 3, // Default importance
        dueAt: '', // Default no due date
        originalLine: line
      };
    });

    setParsedTasks(tasks);
    setShowPreview(true);
  };

  const updateTask = (index: number, field: keyof ParsedTask, value: string | number) => {
    const updated = [...parsedTasks];
    updated[index] = { ...updated[index], [field]: value };
    
    // If category changed, update estimate
    if (field === 'category') {
      const template = CATEGORY_TEMPLATES.find(t => t.category === value);
      updated[index].estimateMinutes = template?.defaultEstimate || 30;
    }
    
    setParsedTasks(updated);
  };

  const removeTask = (index: number) => {
    setParsedTasks(tasks => tasks.filter((_, i) => i !== index));
  };

  const handleImport = async () => {
    setLoading(true);
    setImportResult(null);

    try {
      const tasksToImport = parsedTasks.map(task => ({
        title: task.title,
        category: task.category,
        estimateMinutes: task.estimateMinutes,
        importance: task.importance,
        dueAt: task.dueAt || undefined
      }));

      const response = await fetch('/api/capture/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: tasksToImport })
      });

      const result = await response.json();
      setImportResult(result);

      if (result.success) {
        // Clear the form on success
        setRawText('');
        setParsedTasks([]);
        setShowPreview(false);
      }
    } catch (error) {
      console.error('Import error:', error);
      setImportResult({
        success: false,
        processed: 0,
        tasks: [],
        errors: [{ title: 'Network Error', error: 'Failed to connect to server' }]
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🤖</span>
              <h1 className="text-2xl font-bold text-gray-900">Bulk Task Import</h1>
            </div>
            <a
              href="/inbox"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Tasks
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {!showPreview ? (
          /* Input Phase */
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Paste Your Tasks</h2>
              <p className="text-gray-600 mb-6">
                Enter one task per line. The system will automatically classify and break them down into 15-minute slices.
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task List (one per line)
                </label>
                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder={`Plan vacation to Japan
Buy new laptop for work
Read React 19 documentation
Organize home office
Call dentist for appointment
Research best coffee makers
Write quarterly report`}
                  className="w-full h-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                  disabled={loading}
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={parseText}
                  disabled={!rawText.trim() || loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  Parse & Preview ({rawText.split('\n').filter(l => l.trim()).length} tasks)
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Preview Phase */
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Review & Adjust ({parsedTasks.length} tasks)</h2>
              <div className="space-x-3">
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ← Edit Text
                </button>
                <button
                  onClick={handleImport}
                  disabled={loading || parsedTasks.length === 0}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Importing...' : `Import ${parsedTasks.length} Tasks`}
                </button>
              </div>
            </div>

            {/* Tasks Preview Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Task Title</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Category</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Estimate</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Priority</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Due Date</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {parsedTasks.map((task, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={task.title}
                            onChange={(e) => updateTask(index, 'title', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={task.category}
                            onChange={(e) => updateTask(index, 'category', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                          >
                            {CATEGORY_TEMPLATES.map(template => (
                              <option key={template.category} value={template.category}>
                                {template.category}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={task.estimateMinutes}
                            onChange={(e) => updateTask(index, 'estimateMinutes', parseInt(e.target.value) || 15)}
                            min="15"
                            step="15"
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                          />
                          <span className="text-xs text-gray-500 ml-1">min</span>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={task.importance}
                            onChange={(e) => updateTask(index, 'importance', parseInt(e.target.value))}
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                          >
                            {[1, 2, 3, 4, 5].map(i => (
                              <option key={i} value={i}>{i}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="datetime-local"
                            value={task.dueAt}
                            onChange={(e) => updateTask(index, 'dueAt', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => removeTask(index)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Import Results */}
        {importResult && (
          <div className="mt-6 max-w-2xl mx-auto">
            <div className={`rounded-lg p-4 ${
              importResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">
                  {importResult.success ? '✅' : '❌'}
                </span>
                <h3 className="font-semibold">
                  {importResult.success ? 'Import Successful!' : 'Import Completed with Errors'}
                </h3>
              </div>
              
              <div className="mt-3 text-sm">
                <p><strong>Processed:</strong> {importResult.processed} tasks</p>
                {importResult.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium text-red-700">Errors:</p>
                    <ul className="list-disc list-inside text-red-600">
                      {importResult.errors.map((error, i) => (
                        <li key={i}>{error.title}: {error.error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {importResult.success && (
                <div className="mt-4 flex space-x-3">
                  <a
                    href="/inbox"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    View Tasks
                  </a>
                  <a
                    href="/now"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Start Working
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}