import { useEffect, useState } from 'react';
import { io as clientIo } from 'socket.io-client';

const socket = clientIo(import.meta.env.VITE_SERVER_URL || 'http://localhost:3001');

export default function App() {
  const [status, setStatus] = useState('Connecting...');
  const [roomId, setRoomId] = useState(null);
  const [choices, setChoices] = useState(null);
  const [scores, setScores] = useState(null);
  const [round, setRound] = useState(1);
  const [finalWinner, setFinalWinner] = useState(null);
  const [myChoice, setMyChoice] = useState(null);

  useEffect(() => {
    socket.on('status', setStatus);
    socket.on('start_game', ({ roomId }) => {
      setRoomId(roomId);
      setStatus('Game started!');
    });

    socket.on('round_result', ({ choices, scores, round, winner }) => {
      setChoices(choices);
      setScores(scores);
      setRound(round);
      setMyChoice(null);
    });

    socket.on('game_over', ({ finalWinner }) => {
      setFinalWinner(finalWinner);
    });
  }, []);

  const play = (choice) => {
    if (roomId && !myChoice) {
      setMyChoice(choice);
      socket.emit('make_choice', { roomId, choice });
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Pierre Feuille Ciseaux</h1>
      <p>Status: {status}</p>
      {finalWinner ? <h2>{finalWinner === socket.id ? 'You win!' : finalWinner === 'draw' ? 'Draw!' : 'You lose.'}</h2> : (
        <>
          <p>Round: {round}</p>
          <div>
            <button disabled={!!myChoice} onClick={() => play('rock')}>Rock</button>
            <button disabled={!!myChoice} onClick={() => play('paper')}>Paper</button>
            <button disabled={!!myChoice} onClick={() => play('scissors')}>Scissors</button>
          </div>
          {choices && (
            <div>
              <p>Choices:</p>
              <pre>{JSON.stringify(choices, null, 2)}</pre>
              <p>Scores:</p>
              <pre>{JSON.stringify(scores, null, 2)}</pre>
            </div>
          )}
        </>
      )}
    </div>
  );
}
