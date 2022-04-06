// import styles from "./CurrentLetter.module.css"

const CurrentLetter = ({currentLetter}) => {
  return (
    <section className="InitialLetter">
      <h1>{ currentLetter.character }</h1>
    </section>
  );
}

export default CurrentLetter;
