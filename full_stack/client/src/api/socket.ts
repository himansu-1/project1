import { io, Socket } from 'socket.io-client';

// export const socket = io('http://localhost:5000', { withCredentials: true });

// export const createSocket = (): Socket => {
//     return io('http://localhost:5000', { 
//         withCredentials: true,
//         transports: ['websocket'],
//         autoConnect: false,
//     });
// };


export const socket = io("http://localhost:5000", {
    withCredentials: true,
    autoConnect: false,
  });