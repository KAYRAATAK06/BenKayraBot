
import React from 'react';
import { Message } from '../types';

interface MessageItemProps {
  message: Message;
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const isAssistant = message.role === 'assistant';

  return (
    <div className={`flex gap-4 ${isAssistant ? '' : 'flex-row-reverse'}`}>
      <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ${
        isAssistant 
          ? 'bg-gradient-to-br from-cyan-500 to-blue-600' 
          : 'bg-gradient-to-br from-slate-700 to-slate-800'
      }`}>
        <i className={`fas ${isAssistant ? 'fa-robot' : 'fa-user'} text-sm md:text-base text-white`}></i>
      </div>
      
      <div className={`flex flex-col max-w-[85%] ${isAssistant ? 'items-start' : 'items-end'}`}>
        <div className={`px-4 py-3 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed ${
          isAssistant 
            ? 'bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-none' 
            : 'bg-cyan-600 text-white rounded-tr-none'
        }`}>
          {message.content.split('\n').map((line, i) => (
            <p key={i} className={line === '' ? 'h-3' : 'mb-1 last:mb-0'}>
              {line}
            </p>
          ))}
        </div>
        <span className="text-[10px] text-slate-600 mt-1 px-1">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};

export default MessageItem;
