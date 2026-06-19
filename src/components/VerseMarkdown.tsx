import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface VerseMarkdownProps {
  text: string;
  className?: string;
}

export function VerseMarkdown({ text, className = '' }: VerseMarkdownProps) {
  return (
    <div className={`verse-markdown ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {text}
      </ReactMarkdown>
    </div>
  );
}
