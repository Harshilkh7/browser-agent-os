import { useState } from "react";

function App() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");

  const sendMessage = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: input,
          }),
        }
      );

      const data = await res.json();

      setResponse(data.response);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "20px",
        padding: "20px",
      }}
    >
      <h1>Browser Agent OS</h1>

      <input
        type="text"
        placeholder="Enter message..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{
          width: "300px",
          padding: "10px",
        }}
      />

      <button onClick={sendMessage}>
        Send
      </button>

      <div
        style={{
          width: "400px",
          minHeight: "100px",
          border: "1px solid gray",
          padding: "10px",
        }}
      >
        {response}
      </div>
    </div>
  );
}

export default App;