import Word from "./Word";

const WordList = () => {
    const answers = ["guess#1", "guess2", "g3", "long_guess_answer#12343455", 'g5', 'g6']
    return (
        <div className="WordList">
            {answers.map((word) => (
            <Word word={word}/>))}
        </div>
    );
}

export default WordList;