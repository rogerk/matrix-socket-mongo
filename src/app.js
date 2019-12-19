import "dotenv/config";
import express from "express";
import http from "http";
import models, { connectDb } from "./models";
import socketIo from "socket.io";

const port = process.env.PORT;

const app = express();

app.use(express.json());

const server = http.createServer(app);

const io = socketIo.listen(server);

io.on("connection", socket => {
    console.log("Client Connected");
    socket.on("ALL_MATRIX", () => {
        getMatrix(socket);
    });

    // Returns array of pixels given matrix coordinates.
    // If not coordinates are given the entire matrix is returned.
    //
    socket.on("PIXELS", coords => {
        if (coords.length > 0) {
            getMatrixPixels(socket, coords);
        } else {
            getMatrix(socket);
        }
    });

    socket.on("disconnect", () => {
        console.log("Client Disconnected");
    });

    socket.on("RESET", (rows, cols, color) => {
        resetMatrix(socket, rows, cols, color);
    });

    socket.on("UPDATE_PIXELS", (coords, color) => {
        updatePixels(socket, coords, color);
    });
});

// Returns entire matrix
//
const getMatrix = async socket => {
    try {
        const matrix = await models.Matrix.find();
        socket.emit("ALL_MATRIX_RESPONSE", matrix);
    } catch (error) {
        console.error(`Error: ${error}`);
    }
};

// Returns one or more matrix pixels given an array of x,y coordinates.
//
const getMatrixPixels = async (socket, coords) => {
    try {
        const pixels = await models.Matrix.findByCoordinates(coords);
        socket.emit("PIXELS_RESPONSE", pixels);
    } catch (error) {
        console.error(`Error: ${error}`);
    }
};

const updatePixels = async (socket, coords, color) => {
    try {
        const pixels = await models.Matrix.updatePixels(coords, color);
        socket.emit("UPDATE_PIXELS_RESPONSE", pixels);
    } catch (error) {
        console.error(`Error: ${error}`);
    }
};

const resetMatrix = async (socket, rows, cols, color) => {
    try {
        const matrix = await models.Matrix.resetMatrix(rows, cols, color);
        io.sockets.emit("RESET_RESPONSE", matrix);
    } catch (error) {
        console.error(`Error: ${error}`);
    }
};

try {
    connectDb().then(async () => {
        server.listen(port, () => console.log(`Listening on port ${port}`));
    });
} catch (error) {
    console.error(`Error: ${error}`);
}
