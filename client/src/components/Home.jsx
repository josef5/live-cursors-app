import { useEffect, useRef } from "react";
import useWebSocket from "react-use-websocket";
import throttle from "lodash.throttle";
import { Cursor } from "./Cursor";

const renderCursors = (users) => {
  return Object.keys(users).map((uuid) => {
    const user = users[uuid];

    return <Cursor key={uuid} point={[user.state.x, user.state.y]} />;
  });
};

const renderUsersList = (users) => {
  return (
    <ul>
      {Object.keys(users).map((uuid) => {
        return <li key={uuid}>{JSON.stringify(users[uuid])}</li>;
      })}
    </ul>
  );
};

export function Home({ username }) {
  const WS_URL = "ws://localhost:8000";

  const { sendJsonMessage, lastJsonMessage } = useWebSocket(WS_URL, {
    queryParams: { username },
  });

  const THROTTLE = 50;
  const sendJsonMessageThrottled = useRef(throttle(sendJsonMessage, THROTTLE));

  useEffect(() => {
    // Ask the server to send everyones state the second we load the component
    sendJsonMessage({ x: 0, y: 0 });

    window.addEventListener("mousemove", (event) => {
      sendJsonMessageThrottled.current({
        x: event.clientX,
        y: event.clientY,
      });
    });
  }, []);

  if (lastJsonMessage) {
    return (
      <>
        {renderCursors(lastJsonMessage)}
        {renderUsersList(lastJsonMessage)}
      </>
    );
  }

  return <h1>Hello, {username}</h1>;
}
