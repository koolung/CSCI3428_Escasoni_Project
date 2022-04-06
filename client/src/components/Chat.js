import { useEffect, useState } from "react";
import styles from "./Chat.module.css";

const Chat = ({socket, userName, roomName}) => {
    const [currentMessage, setCurrentMessage] = useState("");
    const [messageList, setMessageList] = useState([]);

    const sendMessage = async () => {
        if (currentMessage !== "") {
            const messageData = {
                room: roomName,
                author: userName,
                message: currentMessage,
                time: new Date(Date.now()).getHours() + 
                ":" + new Date(Date.now()).getMinutes() 
            };

            await socket.emit("send_message", messageData);
            setMessageList((currentList) => [...currentList, messageData]);
        }
    };

    useEffect(() => {
        socket.on("recieve_message", (data) => {
            setMessageList((currentList) => [...currentList, data]);
        })
    }, [socket]);

    return (
        <div className = "Chat">
            <div className = {styles.chat_window}>
            <div className = {styles.chat_body}>
                {messageList.map((messageContent) => {
                    return (
                    <div className="message">
                        <div>
                            <div className="message_content">
                                <p>{messageContent.message}</p>
                            </div>
                            <div className="message_meta">
                                <p>{messageContent.time}</p>
                                <p>{messageContent.author}</p>
                            </div>
                        </div>
                    </div>
                    );
                })}
            </div>
            <div className = {styles.chat_footer}>
                <input type="text" placeholder="hey.."
                onClick={(event) => {
                    setCurrentMessage(event.target.value);
                }}/>
                <button onClick={sendMessage}>&#9658;</button>
            </div>
            </div>
        </div>
    );
}
 
export default Chat;
