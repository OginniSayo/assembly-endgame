import clsx from "clsx"

export default function Levels({levels, selectedLevel, selectLevel}) {
return (
  <section className="levels">
    {levels.map(level => (
      <button 
        key={level.name} 
        className={clsx("level", selectedLevel?.name === level.name && "selected-level")}
        style={{backgroundColor: level.backgroundColor, color: level.color}}
        onClick={() => selectLevel(level)}
      >
        {level.name}
      </button>
    ))
    }
  </section>
)
}