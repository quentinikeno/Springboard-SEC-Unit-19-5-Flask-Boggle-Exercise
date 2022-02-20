const boggle_guess_form = document.getElementById("boggle-guess");
const guess_input = document.getElementById("guess-input");
const score_span = document.getElementById("score");
const timer_span = document.getElementById("timer");
const form_div = document.getElementById("form-div");

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
	const result_message = document.querySelector(".result-message");
	response = await axios.get(`/guess?word=${guess}`);
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

function showRestartButton() {
	//Remove form for guesses and show the button to restart the game;
	const restartButton = document.createElement("a");
	restartButton.innerText = "Restart Game!";
	restartButton.setAttribute("href", "/");
	restartButton.classList.add("restart-button", "mt-1");

	form_div.innerHTML = "";
	form_div.append(restartButton);
}

//Update the timer for 60 seconds in the DOM
const timerInterval = setInterval(() => {
	if (timeRemaining === 0) clearInterval();
	timeRemaining--;
	timer_span.innerText = timeRemaining;
}, 1000);

//Set a timer for 60 seconds and disable guesses once time is up
setTimeout(async () => {
	guess_input.disabled = true;
	clearInterval(timerInterval);
	let response = await axios.post("/game-over-update", {
		current_score: score_span.innerText,
	});
	showRestartButton();
}, 60000);
