export const getLocalISODate = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const getStoredUser = () => {
    const raw = localStorage.getItem('user');
    if (!raw || raw === 'null' || raw === 'undefined') return null;

    try {
        return JSON.parse(raw);
    } catch (err) {
        console.error('Failed to parse stored user:', err);
        return null;
    }
};
