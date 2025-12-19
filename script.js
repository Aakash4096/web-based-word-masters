const letters = document.querySelectorAll(".scoreboard-letter");
const loadingDiv = document.querySelector(".info-bar");
const ANSWER_LENGTH = 5;
const ROUNDS = 6;

async function init() {
  let currentGeuss = "";
  let currentRow = 0;
  let isLoading = true;

  //WORD of the Day
  const res = await fetch(
    "https://words.dev-apis.com/word-of-the-day?random=1"
  );
  const resObj = await res.json();
  const word = resObj.word.toUpperCase();
  const wordPart = word.split("");
  let done = false;

  showLoading(false);
  isLoading = false;
  console.log(word);

  function addLetter(letter) {
    if (currentGeuss.length < ANSWER_LENGTH) {
      //  Add letter to the end
      currentGeuss += letter;
    } else {
      // Replace last letter
      currentGeuss =
        currentGeuss.substring(0, currentGeuss.length - 1) + letter;
    }
    letters[currentRow * ANSWER_LENGTH + currentGeuss.length - 1].innerText =
      letter;
  }

  async function commit() {
    if (currentGeuss.length !== ANSWER_LENGTH) {
      // Do nothing
      return;
    }

    //validate the word
    isLoading = true;
    showLoading(true);
    const res = await fetch("https://words.dev-apis.com/validate-word", {
      method: "POST",
      body: JSON.stringify({ word: currentGeuss }),
    });
    const resObj = await res.json();
    const validWord = resObj.validWord;

    isLoading = false;
    showLoading(false);

    if (!validWord) {
      markInvalidWord();
      return;
    }

    // the marking as correct or incorrect or close

    const guessParts = currentGeuss.split("");
    const map = makeMap(wordPart);

    for (let i = 0; i < ANSWER_LENGTH; i++) {
      //mark as correct
      if (guessParts[i] === wordPart[i]) {
        letters[currentRow * ANSWER_LENGTH + i].classList.add("correct");
        map[guessParts[i]]--;
      }
    }
    for (let i = 0; i < ANSWER_LENGTH; i++) {
      if (guessParts[i] === wordPart[i]) {
        //do nothing
      } else if (wordPart.includes(guessParts[i]) && map[guessParts[i]] > 0) {
        // correction
        letters[currentRow * ANSWER_LENGTH + i].classList.add("close");
        map[guessParts[i]]--;
      } else {
        letters[currentRow * ANSWER_LENGTH + i].classList.add("wrong");
      }
    }
    currentRow++;

    if (currentGeuss === word) {
      //win
      alert("You Win");
      done = true;
      document.querySelector(".brand").classList.add("winner");
      return;
    } else if (currentRow === ROUNDS) {
      alert(`You Lose, the word was ${word}`); //LOSE
      done = true;
    }
    currentGeuss = "";
  }

  function backspace() {
    currentGeuss = currentGeuss.substring(0, currentGeuss.length - 1);
    letters[currentRow * ANSWER_LENGTH + currentGeuss.length].innerText = "";
  }
  function markInvalidWord() {
    alert("Not a valid word");
  }

  document.addEventListener("keydown", function handleKeyPress(event) {
    if (done || isLoading) {
      return;
      // Do nothing
    }
    const action = event.key;
    if (action === "Enter") {
      commit();
    } else if (action === "Backspace") {
      backspace();
    } else if (isLetter(action)) {
      addLetter(action.toUpperCase());
    } else {
      // Ignore other keys
    }
  });
}
function isLetter(letter) {
  return /^[a-zA-Z]$/.test(letter);
}
function showLoading(isLoading) {
  loadingDiv.classList.toggle("hidden", !isLoading);
}
function makeMap(array) {
  const obj = {};
  for (let i = 0; i < array.length; i++) {
    const letter = array[i];
    if (obj[letter]) {
      obj[letter]++;
    } else {
      obj[letter] = 1;
    }
  }
  return obj;
}
init();
