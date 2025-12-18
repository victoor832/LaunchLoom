import React, { useState } from 'react';
import { usePlaybookPDF } from '../hooks/usePlaybookPDF';

interface PlaybookFormProps {
  onSuccess?: () => void;
}

export const PlaybookGenerator: React.FC<PlaybookFormProps> = ({ onSuccess }) => {
  const { isGenerating, error, generatePDF } = usePlaybookPDF();

  const [formData, setFormData] = useState({
    productName: '',
    targetAudience: '',
    launchDate: '',
    tier: 'free' as const,
    daysToLaunch: 30,
  });

  const calculateDaysToLaunch = (launchDate: string): number => {
    if (!launchDate) return 30;
    const launch = new Date(launchDate);
    const today = new Date();
    const diff = launch.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'launchDate') {
        updated.daysToLaunch = calculateDaysToLaunch(value);
      }
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.productName || !formData.targetAudience || !formData.launchDate) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await generatePDF(formData);
      onSuccess?.();
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Generate Your Launch Playbook</h2>

      <div className="mb-4">
        <label htmlFor="productName" className="block text-sm font-medium mb-2">
          Product Name *
        </label>
        <input
          type="text"
          id="productName"
          name="productName"
          value={formData.productName}
          onChange={handleChange}
          placeholder="e.g., LaunchLoom"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="targetAudience" className="block text-sm font-medium mb-2">
          Target Audience *
        </label>
        <input
          type="text"
          id="targetAudience"
          name="targetAudience"
          value={formData.targetAudience}
          onChange={handleChange}
          placeholder="e.g., SaaS founders, Indie hackers"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="launchDate" className="block text-sm font-medium mb-2">
          Launch Date *
        </label>
        <input
          type="date"
          id="launchDate"
          name="launchDate"
          value={formData.launchDate}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        {formData.launchDate && (
          <p className="text-sm text-gray-600 mt-1">
            {formData.daysToLaunch} days until launch
          </p>
        )}
      </div>

      <div className="mb-6">
        <label htmlFor="tier" className="block text-sm font-medium mb-2">
          Tier *
        </label>
        <select
          id="tier"
          name="tier"
          value={formData.tier}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="free">Free (6-8 pages)</option>
          <option value="standard">Standard (14-18 pages)</option>
          <option value="pro">Pro (25-30 pages)</option>
        </select>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          <p className="font-semibold">Error</p>
          <p>{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isGenerating}
        className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors ${
          isGenerating
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
        }`}
      >
        {isGenerating ? 'Generating PDF...' : 'Generate & Download Playbook'}
      </button>
    </form>
  );
};

export default PlaybookGenerator;
