export default function TimerGuessesCount({currentWord, guessedLetters, languages, timer, isGameWon, isGameLost}) {
  
  const wrongGuessCount = guessedLetters.filter(letter => !currentWord.split("").includes(letter)).length;
  const numGuessesLeft = (languages.length - 1) - wrongGuessCount;

  const guessClass = isGameWon ? "guess-count won" : isGameLost ? "guess-count failed" : "guess-count"
  const timerClass = isGameWon ? "timer-count won" : isGameLost ? "timer-count failed" : "timer-count"

  return (
    <section className="guess-timer-count">
      <p className={guessClass}>Remaining Guesses: <span className="guesses">{numGuessesLeft}</span></p>
      <p className={timerClass}>Time Remaining: <span className="time">{timer} seconds</span></p>
    </section>
  )
}