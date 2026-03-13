import React, { useState } from 'react';
import { useAIAssistant } from '../hooks/useAIAssistant';
import LeiaBubble from './LeiaBubble';
import LeiaChatPanel from './LeiaChatPanel';

export default function LeiaWidget() {
  const [open, setOpen] = useState(false);
  const vm = useAIAssistant();

  return (
    <>
      {open && (
        <LeiaChatPanel
          theme={vm.theme}
          loading={vm.loading}
          input={vm.input}
          messages={vm.messages}
          setInput={vm.setInput}
          sendMessage={vm.sendMessage}
          onClose={() => setOpen(false)}
        />
      )}
      <LeiaBubble open={open} onClick={() => setOpen((prev) => !prev)} theme={vm.theme} />
    </>
  );
}
