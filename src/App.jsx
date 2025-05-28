import { useEffect, useState } from 'react';
import { io as clientIo } from 'socket.io-client';

const socket = clientIo('http://localhost:3001');

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
    <div style={{ padding: 20, fontFamily: 'Arial, sans-serif', maxWidth: 600, margin: 'auto' }}>
      <h1 style={{ textAlign: 'center' }}>Pierre Feuille Ciseaux</h1>
      <p><strong>Status:</strong> {status}</p>

      {finalWinner ? (
        <h2 style={{ textAlign: 'center', color: '#007acc' }}>
          {finalWinner === socket.id ? '🏆 Vous avez gagné !' : finalWinner === 'draw' ? 'Match nul !' : 'Vous avez perdu.'}
        </h2>
      ) : (
        <>
          <p><strong>Manche :</strong> {round} / 3</p>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button disabled={!!myChoice} onClick={() => play('rock')}>🪨 Rock</button>
            <button disabled={!!myChoice} onClick={() => play('paper')}>📄 Paper</button>
            <button disabled={!!myChoice} onClick={() => play('scissors')}>✂️ Scissors</button>
          </div>

          {choices && scores && (
            <div>
              <h3>Choix des joueurs :</h3>
              <ul>
                {Object.entries(choices).map(([player, choice]) => (
                  <li key={player}><strong>{player.slice(0, 6)}...</strong> : {choice}</li>
                ))}
              </ul>

              <h3>Score :</h3>
              <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
                <thead>
                  <tr>
                    <th>Joueur</th>
                    <th>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(scores).map(([player, score]) => (
                    <tr key={player}>
                      <td>{player.slice(0, 6)}...</td>
                      <td>{score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
