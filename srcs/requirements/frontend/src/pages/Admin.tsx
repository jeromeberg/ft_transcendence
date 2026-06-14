import { useEffect, useState } from 'react';
import { Heading, PageLayout, Container } from "@/components";
import { getAllQuotes } from '@/api/quote.api';
import type { Quote } from '@/types/api';
import { NewQuoteForm, AllQuotes } from '@/features/admin';

export default function Admin() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllQuotes();
      setQuotes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quotes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  return (
    <PageLayout maxWidth="max-w-xl">
      <div className="flex flex-col gap-4">
        <Heading level={2}>Manage quotes</Heading>

        <Container label="new quote">
          <NewQuoteForm 
            onQuoteCreated={fetchQuotes}
            onError={setError}
            error={error}
          />
        </Container>

        <Container label="quotes">
          <AllQuotes 
            quotes={quotes}
            loading={loading}
            onQuotesUpdated={fetchQuotes}
            onError={setError}
          />
        </Container>
      </div>
    </PageLayout>
  );
}
