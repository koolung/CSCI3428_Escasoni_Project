# Note
*Aij?* is currently being refactored to guarantee a bug-free experience to all players and administrators. We will be back soon!

# CSCI3428 - Saint Mary's University: Eskasoni Project
This project is a version of a Mi’kmaw Scattergories game called *Aij?*, 
developed for the Mi’kmaw community at Eskasoni.

## About *Aij?*
The project is based on the Scattergories game, which is a competitive game that
requires players to actively recall words, strengthening the connections to
those words.

*Aij?* is presented 100% in the Mi'kmaw language and it is aimed towards
people from any age group that are trying to learn the language.

Our goal is to encourage students in the Mi'kmaw community to immerse themselves
into the language and spend more time working on their vocabulary, while also having
fun!

## Installation
- Requires [NodeJS](https://nodejs.org/en/download/) v14+

Clone this repository with `git clone https://github.com/koolung/CSCI3428_Eskasoni_Project.git` or download the source code from https://github.com/koolung/CSCI3428_Eskasoni_Project
> Before proceeding, don't forget to change the hostname on`client/src/App.js` and `server/server.js` to `http://localhost:PORT`, or the address to your server.

After that, go to the project's directory and run the `build_app.sh` script to install all required dependencies and build the application.
```
cd CSCI3428_Eskasoni_Project
chmod +x build_app.sh
./build_app.sh
npm start
```
The app will be available on `localhost:PORT` if you chose to run it locally, or `YOUR_SERVER_ADDRESS:PORT` if you are running the app on a production server.

## Audio
If you would like to change the audio for each letter, all you need to do is to record each letter separately and put all audio files inside the `audio/` folder. However, it is important that you use the same file names as the default audio files, otherwise the audio won't work in the game.

After changing the audio files, run `./build_app.sh` script on the root folder of your server to successfully update the audio.

## Technical Guide
This is a guide for any future developers or anyone trying to navigate through this app.

2 main pieces are the Client side of the app and the Server side

Server side is a single js file "server.js" at "./server/server.js"
    - server.js utilizes modules (players.js, rooms.js, utils.js) which helps with readability

The client side is a react app and starts at the App.js file located under "./client/src/App.js"
All of the pieces of this app are stored in "components" which are individual js files located 
    in the folder "./client/src/components/component.js"
Components are called by the return function at the bottom of each component.

A map showing the hierarchy of components is below:

App.js - Login.js

       - GameScreen.js - CurrentLetter.js
                       - Chat.js
                       - Timer.js
                       - CategoryList.js - [Category.js,
                                            Category.js,
                                            ...]
       - VoteScreen.js - WordList.js - [Word.js,
                                        Word.js,
                                        ...]
