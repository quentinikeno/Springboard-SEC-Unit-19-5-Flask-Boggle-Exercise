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
		this.guess;
		this.result;

		boggle_guess_form.addEventListener("submit", this.handleGuess);
		this.setTimers();
	}

	async handleGuess(event) {
		event.preventDefault();
		this.guess = guess_input.value.trim();
		this.result = await this.submitGuess();
		this.displayResult();
		guess_input.value = "";
	}

	async submitGuess() {
		const result_message = document.querySelector(".result-message");
		const response = await axios.get(`/guess?word=${this.guess}`);
		if (result_message) result_message.remove(); //Remove the result-message from DOM to make way for the new one
		return response.data.result;
	}

	displayResult() {
		//Make a paragraph tag with the result and add it to the DOM
		const message = document.createElement("p");
		message.id = this.result;
		message.classList.add("result-message");
		message.innerText = this.returnMessage(this.guess);
		document.querySelector("main").prepend(message);

		//Update score in DOM
		if (this.result === "ok") {
			this.score += this.guess.length;
			score_span.innerText = this.score;
		}
	}

	returnMessage(guess) {
		const messages = {
			ok: `${guess} is on the board!`,
			"not-on-board": `Sorry, ${guess} is not on the board.  Try again!`,
			"not-word": `Sorry, ${guess} is not an accepted word.  Try again!`,
			"duplicate-word": `You've already guessed ${guess}.  Try again!`,
		};
		return messages[this.result];
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
			clearInterval(timerInterval);
			await axios.post("/game-over-update", {
				current_score: this.score,
			});
			this.showRestartButton();
		}, 60000);
	}
}

new BoggleGame();
