//===== IMPORTS ===================================================================================
// Required imports
const express = require("express");
const path = require("path");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");

// Local imports
const { playersOnServer, Player } = require("./modules/players");
const { roomsOnServer, Room } = require("./modules/rooms");

//===== SERVER SETUP ==============================================================================

// Server setup
const app = express();
const PORT = process.env.PORT || 5014;

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: `http://ugdev.cs.smu.ca:${PORT}`,
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname, "..", "client", "build")));

// Routing
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "..", "build", "index.html"));
});

//===== EVENT HANDLING ============================================================================

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  /**
   * @author Gillom McNeil  (A00450414)
   * @author Vitor Jeronimo (A00431599)
   *
   * Handles the "join_room" event emitted by the client.
   *
   * It creates a new player object and adds it to the list of players in
   * the server.
   *
   * Furthermore, if there is no room with the Room ID provided by
   * the user, creates a new room, sets the player as the admin of
   * that room, and adds the room to the list of rooms in the server.
   *
   * @param {string} userName Username provided by the user at login
   * @param {string} roomName Room ID provided by the user at login
   */
  socket.on("join_room", ({ userName, roomName }) => {
    const player = new Player(socket.id, userName, roomName);

    // If a player with the same socket ID already exists in the list,
    // remove them to avoid duplicates
    const index = playersOnServer.findIndex(
      (player) => player.id === socket.id
    );
    if (index !== -1) {
      playersOnServer.splice(index, 1);
    }
    playersOnServer.push(player);

    // If the room with the specified name does not exist, create it,
    // set the first player to join to be the admin, and add them to
    // the list of players in the room.
    // Otherwise, just add the player to the list of players in the room.
    if (!roomsOnServer.some((room) => room.roomName === roomName)) {
      const room = new Room(roomName, player, [player]);
      roomsOnServer.push(room);

      console.log(
        `Room created: ${room.roomName},    Admin: ${room.admin.userName}`
      );
    } else {
      const room = Room.getCurrentRoom(roomName);
      room.playersList.push(player);
      socket.emit("hide_buttons");

      console.log(
        `Room updated: ${room.roomName},    Joined: ${player.userName}`
      );
    }
    socket.join(roomName);
  });

  /**
   * @author Vitor Jeronimo (A00431599)
   *
   * Handles the "start_game" event emitted by the client.
   *
   * Sends the required game state information to all clients
   * in the current room.
   */
  socket.on("start_game", () => {
    // Get info of the player that emitted the event
    const player = Player.getCurrentPlayer(socket.id);
    const room = Room.getCurrentRoom(player.roomName);

    // Only allow the game to start if the player is the room admin
    if (player === room.admin) {
      room.updateRoom();
      room.startGame();
      io.to(room.roomName).emit("update_client", room.gameState);
    }
  });

  /**
   *  @author Vitor Jeronimo (A00431599)
   *  @author Gillom McNeil  (A00450414)
   *
   *  Handles the "start_voting" event emitted by the client.
   *
   *  Sends the round results to all clients in the current room.
   */
  socket.on("start_voting", () => {
    const player = Player.getCurrentPlayer(socket.id);
    const room = Room.getCurrentRoom(player.roomName);

    io.to(room.roomName).emit("display_round_results", room);
  });

  /**
   * @author Gillom McNeil (A00450414)
   *
   * Handles the "send_message" event emitted by the client after clicking
   * send on a message.
   *
   * Send the message sent by one client to all clients in the room
   */
  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
  });

  /**
   * @author Gillom McNeil (A00450414)
   *
   * Handles the "deliver_values" event emitted by a client after the timer runs out.
   *
   * Takes the users submitted answers and assigns it to their respective player object.
   *
   * @param {List} data the list of answers as strings
   *
   */
  socket.on("deliver_values", (data) => {
    const player = Player.getCurrentPlayer(socket.id);
    player.words = data;
  });

  /**
   * @author Gillom McNeil (A00450414)
   *
   * @param {number} categoryNum the index of the current category to be voted on
   *
   * collect all the answers corresponding to the category at index categoryNum
   * from all clients in the current room
   *
   * emit an event called "receive_category/answers" to all clients in same room
   * along with a list of objects called "answers". The first object in the list
   * is always the category number as a key and the title as the value.
   *
   * If the client is seeking a category with an index out of bounds, the voting
   * stage is over. Emit an event to enter the results page.
   *
   */
  socket.on("request_category/answers", (categoryNum) => {
    const player = Player.getCurrentPlayer(socket.id);
    const room = Room.getCurrentRoom(player.roomName);

    if (categoryNum < 6) {
      const answers = getAllPlayerAnswers(categoryNum, room);
      io.to(room.roomName).emit("receive_category/answers", answers);
    } else {
      io.to(room.roomName).emit("go_to_results", room);
    }
  });

  /**
   * @author Gillom McNeil (A00450414)
   *
   * Start all the timers in the same room as the admin who calls this
   *
   */
  socket.on("start_timers", () => {
    const player = Player.getCurrentPlayer(socket.id);
    const room = Room.getCurrentRoom(player.roomName);

    //send the start signal to all timers in this room
    io.to(room.roomName).emit("start_timer");
  });

  /**
   * @author Vitor Jeronimo (A00431599)
   *
   * Handles the "disconnect" event emitted by the client.
   *
   * Removes player from the players list in the server.
   */
  socket.on("disconnect", () => {
    try {
      // Get the room name of the player that's disconnecting
      const player = Player.getCurrentPlayer(socket.id);
      const room = Room.getCurrentRoom(player.roomName);

      // Remove the player from the players list in and disconnect them
      // from the server.
      room.removePlayer(socket.id);
      Player.playerDisconnects(socket.id);
      socket.leave(player.roomName);

      console.log("User disconnected", socket.id);
    } catch (error) {
      console.log(error);
      socket.emit("redirect_to_login");
    }
  });
});

//===== FUNCTIONS =================================================================================
/**
 * @author Gillom McNeil (A00450414)
 *
 * @param {number} categoryIndex the index of the current category being requested
 * @param {Room} room the room object containing all the players
 * @returns {List[object]} allAnsers will always have the first object as the category
 * index and title. Additional objects contain the username and their guess
 *
 * collect all answers from the players currently in room, return in a list of objects
 *
 */
const getAllPlayerAnswers = (categoryIndex, room) => {
  //the first element of answers is always the index and category
  const category = room.gameState.currentCategories[categoryIndex].title;
  const allAnswers = [{ index: categoryIndex, category: category }];
  room.playersList.forEach((player) => {
    if (category in player.words) {
      //create object containing username and answer
      const obj = { userName: player.userName, answer: player.words[category] };
      allAnswers.push(obj);
    }
  });
  return allAnswers;
};

//===== SERVER ====================================================================================
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));

// TODO Store user's username and room id in session storage
// TODO Improve server log messages
