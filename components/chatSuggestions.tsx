import { prompts } from '@/constants/prompts';

export default function ChatSuggestions({
  handleSelectSuggestion,
}: {
  handleSelectSuggestion: (prompt: string) => void;
}) {
  return (
    <div className='mx-auto my-10 grid max-w-4xl grid-cols-2 gap-6'>
      {prompts.map((prompt) => (
        <button
          key={prompt}
          className='btn flex h-24 w-full flex-col justify-center border border-white text-center normal-case'
          onClick={(e) => handleSelectSuggestion(prompt)}
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}
