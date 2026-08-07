export const unreadWhere = (userId: number) => ({
    recipientId: userId,
    readAt: null,
    archivedAt: null,
});
