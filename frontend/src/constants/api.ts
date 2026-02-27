import axios from 'axios';

const api = axios.create({
    // On utilise API_URL côté serveur, NEXT_PUBLIC_API_URL côté client
    baseURL: (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL) + 'api/'
});

export default api;