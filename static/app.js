const boggle_guess_form = document.getElementById("boggle-guess");
const guess_input = document.getElementById("guess-input");
const score_span = document.getElementById("score");
const timer_span = document.getElementById("timer");
const form_div = document.getElementById("form-div");

class BoggleGame {
	constructor() {
		this.score = 0;
		this.timeRemaining = 60;
		this.handleGuess = this.handleGuess.bind(this);
		boggle_guess_form.addEventListener("submit", this.handleGuess);
		this.setTimers();
	}

	async handleGuess(event) {
		console.log(this);
		event.preventDefault();
		const guess = guess_input.value.trim();
		const result = await this.submitGuess(guess);
		this.displayResult(guess, result);
		guess_input.value = "";
	}

	async submitGuess(guess) {
		const result_message = document.querySelector(".result-message");
		const response = await axios.get(`/guess?word=${guess}`);
		if (result_message) result_message.remove(); //Remove the result-message from DOM to make way for the new one
		return response.data.result;
	}

	displayResult(guess, result) {
		const messages = {
			ok: `${guess} is on the board!`,
			"not-on-board": `Sorry, ${guess} is not on the board.  Try again!`,
			"not-word": `Sorry, ${guess} is not an accepted word.  Try again!`,
			"duplicate-word": `You've already guessed ${guess}.  Try again!`,
		};

		//Make a paragraph tag with the result and add it to the DOM
		const message = document.createElement("p");
		message.id = result;
		message.classList.add("result-message");
		message.innerText = messages[result];
		document.querySelector("main").prepend(message);

		//Update score in DOM
		if (result === "ok") {
			this.score += guess.length;
			score_span.innerText = this.score;
		}
	}

	showRestartButton() {
		//Remove form for guesses and show the button to restart the game;
		const restartButton = document.createElement("a");
		restartButton.innerText = "Restart Game!";
		restartButton.setAttribute("href", "/");
		restartButton.classList.add("restart-button", "mt-1");

		form_div.innerHTML = "";
		form_div.append(restartButton);
	}

	setTimers() {
		//Update the timer for 60 seconds in the DOM
		const timerInterval = setInterval(() => {
			if (this.timeRemaining === 0) clearInterval();
			this.timeRemaining--;
			timer_span.innerText = this.timeRemaining;
		}, 1000);

		//Set a timer for 60 seconds and disable guesses once time is up
		setTimeout(async () => {
			guess_input.disabled = true;
			clearInterval(timerInterval);
			await axios.post("/game-over-update", {
				current_score: this.score,
			});
			this.showRestartButton();
		}, 60000);
	}
}

new BoggleGame();
