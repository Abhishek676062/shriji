import ChatWindow from '@/components/chat/ChatWindow';
import { Suspense } from 'react';

export const metadata = {
  title: 'Chat with Shriji | Bhagavad Gita AI',
  description: 'Ask any philosophical or life question and receive timeless wisdom from Lord Krishna through the Bhagavad Gita.',
};

export default function ChatPage() {
  return (
    <div className="w-full h-full flex items-center justify-center animate-in fade-in zoom-in-95 duration-500 py-2 sm:py-0">
      <Suspense fallback={<div className="animate-pulse flex items-center justify-center p-12 text-saffron font-bold text-lg sm:text-xl">🪷 Commencing Session...</div>}>
         <ChatWindow />
      </Suspense>
    </div>
  );
}
