const http = require("http");
const app = require("./app");
const { setupSocket } = require("./socket"); // socket.io logic

const server = http.createServer(app); // attach express app

setupSocket(server); // ⬅️ Add this


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
