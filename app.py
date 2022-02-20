from boggle import Boggle

boggle_game = Boggle()

from flask import Flask, request, render_template, redirect, session, jsonify
from flask_debugtoolbar import DebugToolbarExtension


app = Flask(__name__)
app.config['SECRET_KEY'] = "oh-so-secret"

debug = DebugToolbarExtension(app)

@app.route('/')
def index():
    """Index route for Boggle"""
    session['board'] = boggle_game.make_board()
    session['submitted_words'] = list()
    
    return render_template('index.html')

@app.route('/guess')
def guess():
    """Route to check if a result is on the board and respond with the result in JSON"""
    guess = request.args['word']
    submitted_words = session['submitted_words']

    if guess in submitted_words:
        result = 'duplicate-word'
    else:
        result = boggle_game.check_valid_word(session['board'], guess)
        submitted_words.append(guess)
        session['submitted_words'] = submitted_words

    return jsonify({"result": result})

@app.route('/game-over-update', methods=["POST"])
def update_score_and_games():
    """Update the number of times the game has been played and the high score in the session."""
    if 'times_played' in session:
        session['times_played'] = int(session['times_played']) + 1
    else:
        session['times_played'] = 1

    current_score = int(request.json['current_score'])
    if 'high_score' in session:
        if current_score > int(session['high_score']):
            session['high_score'] = current_score
    else:
        session['high_score'] = current_score

    return jsonify({'times_played': session['times_played'], 'high_score': session['high_score']})