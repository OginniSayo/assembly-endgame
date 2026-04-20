import { useState, useEffect, useRef } from "react"
import { languages } from "../languages"
import clsx from "clsx"
import Confetti from "react-confetti"

import { getFarewellText, getRandomWord } from "../utils";
import { levels } from "../levels";
import TimerGuessesCount from "./TimerGuessesCount";
import Levels from "./Levels";

export default function AssemblyEndgame() {
  // State values
  const [currentWord, setCurrentWord] = useState(() => getRandomWord());
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [farewellMessage, setFarewellMessage] = useState("");

  const [selectedLevel, setSelectedLevel] = useState(levels[0]);

  const [timer, setTimer] = useState(selectedLevel ? selectedLevel.timer : levels[0].timer);
  const [timerActive, setTimerActive] = useState(false);

  const timerRef = useRef(null);

  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });


  // Derived values
  const numGuessesLeft = languages.length - 1
  const wrongGuessCount = guessedLetters.filter(letter => !currentWord.split("").includes(letter)).length;
  const isGameLost = wrongGuessCount >= languages.length - 1 || timer === 0;
  const isGameWon = currentWord.split("").every(letter => guessedLetters.includes(letter));

  const lastGuessedLetter = guessedLetters[guessedLetters.length - 1];

  // Static values
  const alphabetArr = "abcdefghijklmnopqrstuvwxyz".split("");
  const currentWordArr = currentWord.split("");

  const currentWordElements = currentWordArr.map((letter, index) => {
    const shouldRevealLetter = isGameLost || guessedLetters.includes(letter);
    const letterClassName = clsx(
      "letter",
      isGameWon && "correct-letter",
      isGameLost && !guessedLetters.includes(letter) && "missed-letter"
    )

    return (
      <span key={index} className={letterClassName}>
        {shouldRevealLetter ? letter.toUpperCase() : ""}
      </span>
    )

  });

  // useEffects

  useEffect(() => {
    if (timerActive && !isGameWon && !isGameLost) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000)
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timerActive, isGameWon, isGameLost]);

  useEffect(() => {
    if (timer === 0) {
      setTimerActive(false);
    }
  }, [timer]);

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }
  
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [guessedLetters, isGameWon, isGameLost]);

  
  // functions

  function startNewGame() {
    setGuessedLetters([])
    setCurrentWord(getRandomWord());
    setFarewellMessage("");
    setTimer(selectedLevel ? selectedLevel.timer : 120);
    setTimerActive(false);
  }

  function selectLevel(level) {
    setSelectedLevel(level);
    setTimer(level.timer);
    setGuessedLetters([])
    setCurrentWord(getRandomWord());
    setFarewellMessage("");
    setTimerActive(false);
  }
  
  function addGuessedLetter(letter) {
    if (guessedLetters.includes(letter)) return;
    
    const updatedLetters = [...guessedLetters, letter];
    const isWrong = !currentWord.split("").includes(letter);
    const updatedWrongCount = updatedLetters.filter(l => !currentWord.split("").includes(l)).length;

    if (isWrong && updatedWrongCount < languages.length - 1) {
      setFarewellMessage(getFarewellText(languages[updatedWrongCount - 1].name));
    } else {
      setFarewellMessage("");
    }

    setGuessedLetters(updatedLetters);
    setTimerActive(true);
  }

  function handleKeyDown(event) {
    const pressedKey = event.key.toLowerCase();
    if (alphabetArr.includes(pressedKey)) {
      addGuessedLetter(pressedKey);
    }
  }

  const languageElements = languages.map((language, index) => {

    const languageChipStyles = {
      backgroundColor: language.backgroundColor,
      color: language.color
    }

    const isLanguageLost = index < wrongGuessCount;

    const languageChipClassName = clsx("chip", isLanguageLost && "lost")
    
    return (
      <span 
        className={languageChipClassName}
        key={language.name} 
        style={languageChipStyles}
      >
        {language.name}
      </span>
    )
  });

  const keyboardElements = alphabetArr.map(letter => {
    
    const isGuessed = guessedLetters.includes(letter);
    const isCorrect = currentWordArr.includes(letter);
    
    const keyboardClass = clsx({
      alphabet: true,
      correct: isGuessed && isCorrect,
      incorrect: isGuessed && !isCorrect
    })
    
    return (
      <button
      disabled={isGuessed || isGameWon || isGameLost} 
      aria-disabled={isGuessed || isGameWon || isGameLost}
      aria-label={`Letter ${letter}`}
      key={letter} 
      className={keyboardClass}
      onClick={() => addGuessedLetter(letter)}
      >
        {letter.toUpperCase()}
      </button>
    )
    
  });




  return (
    <>
      {isGameWon && <Confetti
        width={windowSize.width}
        height={windowSize.height}
        style={{ position: "fixed", top: 0, left: 0 }}
        recycle={false}
        numberOfPieces={1000}
      />}

      <main>

        <Levels 
          levels= {levels} 
          selectedLevel= {selectedLevel} 
          selectLevel= {selectLevel}
        />

        <TimerGuessesCount 
          currentWord = {currentWord}
          guessedLetters = {guessedLetters}
          languages = {languages}
          timer = {timer}
          isGameWon = {isGameWon}
          isGameLost = {isGameLost}
        />

        <section 
          aria-live="polite" 
          role="status" 
          className={clsx("game-status", isGameWon && "won", isGameLost && "lost")}
        >
          {isGameWon && <>
            <h2>You win!</h2>
            <p>Well done! 🎉</p>
          </>}

          {!isGameWon && !isGameLost && farewellMessage && (
            <div className="farewell-message">"{farewellMessage}" 🫡</div>
          )}

          {isGameLost && <>
            <h2>Game over!</h2>
            <p>You lose! Better start learning Assembly 😭</p>
          </>}
        </section>

        <section className="language-chips">
          {languageElements}
        </section>

        <section className="word">
          {currentWordElements}
        </section>


        {/* Combined visually-hidden aria-live region for status updates */}
        <section 
          className="sr-only"
          aria-live="polite"
          role="status"
        >
          <p>
            {currentWord.includes(lastGuessedLetter) ? 
              `Correct! The letter ${lastGuessedLetter} is in the word.` :
              `Wrong! The letter ${lastGuessedLetter} is not in the word.`
            }
            You have ${numGuessesLeft} attempts left.
          </p>
          <p>
            Current word: {currentWord.split("").map(letter =>
            guessedLetters.includes(letter) ? letter + "." : "blank.").join(" ")}
          </p>
        </section>

        <section className="keyboard">
          {keyboardElements}
        </section>

        {(isGameWon || isGameLost) && <button onClick={startNewGame} className="new-game">New Game</button>}
      </main>
    </>
  )
}