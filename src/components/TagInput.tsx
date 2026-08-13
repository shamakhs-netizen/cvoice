import { useState, type KeyboardEvent } from 'react';
import { X } from 'lucide-react';

export default function TagInput({
  label,
  tags,
  onChange,
  placeholder,
}: {
  label: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState('');

  const addTag = () => {
    const value = input.trim();
    if (value && !tags.includes(value)) {
      onChange([...tags, value]);
    }
    setInput('');
  };

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && input === '' && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}</label>
      <div className="flex flex-wrap gap-1.5 p-2 rounded-lg border border-gray-200 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-shadow min-h-[42px]">
        {tags.map((tag, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-gray-700 bg-indigo-50 border border-indigo-100 rounded-md"
          >
            {tag}
            <button
              onClick={() => removeTag(i)}
              className="text-indigo-400 hover:text-indigo-600 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          placeholder={tags.length === 0 ? (placeholder ?? 'Type and press Enter…') : ''}
          className="flex-1 min-w-[100px] text-sm text-gray-900 placeholder-gray-400 bg-transparent outline-none px-1"
        />
      </div>
    </div>
  );
}
