import { useState } from 'react';
import { TextArea, Btn, Input, Text } from "@/components";
import { createQuote } from '@/api/quote.api';

interface NewQuoteFormProps {
  onQuoteCreated: () => void;
  onError: (error: string) => void;
  error: string | null;
}

export function NewQuoteForm({ onQuoteCreated, onError, error }: NewQuoteFormProps) {
  const [form, setForm] = useState({ text: '', type: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.text.trim()) {
      onError('Quote text is required');
      return;
    }

    try {
      setSubmitting(true);
      onError('');
      await createQuote(form.text, form.type || undefined);
      setForm({ text: '', type: '' });
      onQuoteCreated();
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to create quote');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextArea
        label="Quote"
        placeholder="I am a quote..."
        value={form.text}
        onChange={(e) => setForm({ ...form, text: e.target.value })}
        required
        rows={4}
        className="mb-4"
      />
      
      <Input
        label="Type (Optional)"
        placeholder="code"
        value={form.type}
        onChange={(e) => setForm({ ...form, type: e.target.value })}
        className="mb-4"
      />

      {error && <Text variant="error">{error}</Text>}

      <Btn 
        variant="primary" 
        type="submit" 
        disabled={submitting}
      >
        {submitting ? 'Creating...' : 'Add Quote'}
      </Btn>
    </form>
  );
}
