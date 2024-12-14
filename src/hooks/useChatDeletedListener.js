import { useEffect } from 'react';

const useChatDeletedListener = (socket, chatId, users, setNotification, fetchMessages) => {
    useEffect(() => {
        const chatDeleted = async (data) => {
            if (data.status === 'deleted') {
                const sender = users.find(user => user.id === Number(data.userId));
                const senderName = sender ? sender.username : '';

                if (chatId === data.chatId) { 
                    setNotification({
                        message: `This chat was deleted by <span style="color:#2BB8EE; font-weight:bold">${senderName}</span>.`,
                        type: 'success',
                        isHtml: true
                    });
                    fetchMessages();
                } else {
                    console.log('freund ist nicht im chat');
                    sessionStorage.setItem('pendingChatDeletedNotification', JSON.stringify({
                        chatId: data.chatId,
                        message: `This chat was deleted by <span style="color:#2BB8EE; font-weight:bold">${senderName}</span>.`,
                        type: 'success',
                        isHtml: true
                    }));
                }
            }
        };

        socket.on('chatDeleted', chatDeleted);

        return () => {
            socket.off('chatDeleted', chatDeleted); 
        };
    }, [socket, chatId, users, setNotification, fetchMessages]);
};

export default useChatDeletedListener;
