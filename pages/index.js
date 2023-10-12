import Head from "next/head";
import { useState } from "react";
import styles from "./index.module.css";

export default function Home() {
  const [themeInput, setThemeInput] = useState("Harcèlement sexuel");
  const [roomInput, setRoomInput] = useState("Une salle de réunion");
  const [numberInput, setNumberInput] = useState("300");
  const [result, setResult] = useState({});

  async function onSubmit(event) {
    event.preventDefault();
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          theme: themeInput,
          room: roomInput,
          number: numberInput 
        }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }

      setResult(data);
      setThemeInput("");
      setNumberInput("");
      setRoomInput("");
    } catch(error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      alert(error.message);
    }
  }

  return (
    <div>
      <Head>
        <title>Generator Prompt</title>
        <link rel="icon" href="/icon.png" />
      </Head>

      <main className={styles.main}>
        <img src="/icon.png" className={styles.icon} />
        <h3>Escape Game Generator</h3>
        <form onSubmit={onSubmit}>
          <input
            type="text"
            name="theme"
            placeholder="Thème de la chambre"
            value={themeInput}
            onChange={(e) => setThemeInput(e.target.value)}
          />
          <input
            type="text"
            name="room"
            placeholder="Endroit de la situation"
            value={roomInput}
            onChange={(e) => setRoomInput(e.target.value)}
          />
          <input
            type="text"
            name="number"
            placeholder="Nombre de mots"
            value={numberInput}
            onChange={(e) => setNumberInput(e.target.value)}
          />
          <input type="submit" value="Generate Situation" />
        </form>
        <div className={styles.result}>Situation : {result.resultStory}</div>
        <div className={styles.result}>Réponse : {result.resultAnswer}</div>
      </main>
    </div>
  );
}
