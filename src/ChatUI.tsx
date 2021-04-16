import React from 'react';

import Chat, { Bubble, useMessages } from '@chatui/core';

const ChatUI =  () => {
  const { messages, appendMsg, setTyping } = useMessages([]);

  function handleSend(type: string, val: string) {
    if (type === "text" && val.trim()) {
      appendMsg({
        type: "text",
        content: { text: val },
        position: "right"
      });

      setTyping(true);

      setTimeout(() => {
        appendMsg({
          type: "text",
          content: { text: "Bala bala" }
        });
      }, 1000);
    }
  }

  function renderMessageContent(msg: any) {
    const { content } = msg;
    return <Bubble content={content.text} />;
  }

  return (
    <Chat
      navbar={{ title: "智能客服" }}
      messages={messages}
      renderMessageContent={renderMessageContent}
      onSend={handleSend}
    />
  );
}

export default ChatUI;