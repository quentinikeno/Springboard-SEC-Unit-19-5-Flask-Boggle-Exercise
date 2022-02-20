from boggle import Boggle

boggle_game = Boggle()

from flask import Flask, request, render_template, session, jsonify
from flask_debugtoolbar import DebugToolbarExtension

app = Flask(__name__)
app.config['SECRET_KEY'] = "oh-so-secret"

debug = DebugToolbarExtension(app)

@app.route('/')
def index():
    """Index route for Boggle"""
    session['board'] = boggle_game.make_board()
    return render_template('index.html')

@app.route('/guess')
def guess():
    """Route to check if a result is on the board and respond with the result in JSON"""
    guess = request.args['word']
    result = boggle_game.check_valid_word(session['board'], guess)
    return jsonify({"result": result})