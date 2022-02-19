from boggle import Boggle

boggle_game = Boggle()

from flask import Flask, request, render_template, session
from flask_debugtoolbar import DebugToolbarExtension

app = Flask(__name__)
app.config['SECRET_KEY'] = "oh-so-secret"

debug = DebugToolbarExtension(app)

@app.route('/')
def index():
    session['board'] = boggle_game.make_board()
    return render_template('index.html')

 