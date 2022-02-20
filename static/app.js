const boggle_guess_form = document.getElementById("boggle-guess");
const guess_input = document.getElementById("guess-input");
const score_span = document.getElementById("score");
const timer_span = document.getElementById("timer");

let score = 0;
let timeRemaining = 60;

boggle_guess_form.addEventListener("submit", handleGuess);

async function handleGuess(event) {
	event.preventDefault();
	guess = guess_input.value.trim();
	result = await submitGuess(guess);
	displayResult(guess, result);
	guess_input.value = "";
}

async function submitGuess(guess) {
	response = await axios.get(`/guess?word=${guess}`);
	result_message = document.querySelector(".result-message");
	if (result_message) result_message.remove(); //Remove the result-message from DOM to make way for the new one
	return response.data.result;
}

function displayResult(guess, result) {
	//Make a paragraph tag with the result and add it to the DOM
	const messages = {
		ok: `${guess} is on the board!`,
		"not-on-board": `Sorry, ${guess} is not on the board.  Try again!`,
		"not-word": `Sorry, ${guess} is not an accepted word.  Try again!`,
	};

	message = document.createElement("p");
	message.id = result;
	message.classList.add("result-message");
	message.innerText = messages[result];
	document.querySelector("main").prepend(message);

	//Update score in DOM
	if (result === "ok") {
		score += guess.length;
		score_span.innerText = score;
	}
}

//Update the timer for 60 seconds in the DOM
const timerInterval = setInterval(() => {
	if (timeRemaining === 0) clearInterval();
	timeRemaining--;
	timer_span.innerText = timeRemaining;
}, 1000);

//Set a timer for 60 seconds and disable guesses once time is up
setTimeout(() => {
	guess_input.disabled = true;
	clearInterval(timerInterval);
}, 60000);
