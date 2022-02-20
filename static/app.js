const boggle_guess_form = document.getElementById("boggle-guess");
const guess_input = document.getElementById("guess-input");
const score_span = document.getElementById("score");

let score = 0;

boggle_guess_form.addEventListener("submit", async (event) => {
	event.preventDefault();
	guess = guess_input.value.trim();
	result = await submitGuess(guess);
	displayResult(guess, result);
	guess_input.value = "";
});

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
	result_message = document.createElement("p");
	result_message.id = result;
	result_message.classList.add("result-message");
	result_message.innerText = messages[result];
	document.querySelector("main").prepend(result_message);

	//Update score in DOM
	if (result === "ok") {
		score += guess.length;
		score_span.innerText = score;
	}
}
