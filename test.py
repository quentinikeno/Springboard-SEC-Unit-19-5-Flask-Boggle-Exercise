from unittest import TestCase
from app import app
from flask import session
from boggle import Boggle

boggle_game = Boggle()

class FlaskTests(TestCase):
    
    def setUp(self):
        """Configs to run before each test"""
        app.config['TESTING'] = True
        app.config['DEBUG_TB_HOSTS'] = ['dont-show-debug-toolbar']
    
    def test_boggle_root_route(self):
        """Test the root route."""
        with app.test_client() as client:
            res = client.get('/')
            html = res.get_data(as_text=True)
            
            self.assertEqual(res.status_code, 200)
            self.assertIn("<h1>Boggle!</h1>", html)
            self.assertEqual(session['submitted_words'], [])
            
    def test_guess(self):
        """Test the guess route."""
        with app.test_client() as client:
            client.get('/')
                
            res = client.get('/guess?word=test')
            json = res.get_data(as_text=True)

            self.assertIn("result", json)
            self.assertEqual(res.status_code, 200)

    def test_guess_duplicate(self):
        """Test the guess route for a duplicated word."""
        with app.test_client() as client:
            with client.session_transaction() as change_session:
                change_session['submitted_words'] = ['test']
                
            res = client.get('/guess?word=test')
            json = res.get_data(as_text=True)
            
            self.assertIn("duplicate-word", json)
            self.assertIn("result", json)
            self.assertEqual(res.status_code, 200)
            
    def test_valid_guess(self):
        """Test when a guess is valid."""
        with app.test_client() as client:
            client.get('/')
            with client.session_transaction() as change_session:
                change_session['board'] = [["T", "E", "S", "T", "T"], 
                                 ["T", "E", "S", "T", "T"], 
                                 ["T", "E", "S", "T", "T"], 
                                 ["T", "E", "S", "T", "T"], 
                                 ["T", "E", "S", "T", "T"]]
            res = client.get('/guess?word=test')
            self.assertEqual(res.json['result'], 'ok')
            
    def test_invalid_guess(self):
        """Test the response for an invalid guess."""
        with app.test_client() as client:
            client.get('/')
            res = client.get('/guess?word=thiswordisnotevenpossibleinboggle')
            self.assertEqual(res.json['result'], 'not-word')
    
    def test_guess_not_on_board(self):
        """Test the response for a guess that is not on the board."""
        with app.test_client() as client:
            client.get('/')
            res = client.get('/guess?word=thiswordisnotevenpossibleinboggle')
            self.assertEqual(res.json['result'], 'not-word')
            
    def test_game_over_update(self):
        """Test the game over post route"""
        with app.test_client() as client:
            res = client.post('/game-over-update', json = {"current_score": 100})
            json = res.get_data(as_text=True)
            
            self.assertEqual(res.status_code, 200)
            self.assertEqual(session['times_played'], 1)
            self.assertEqual(session['high_score'], 100)
            self.assertIn('times_played', json)
            self.assertIn('high_score', json)
            
    def test_game_over_update_high_score(self):
        """Test that the high score is updated in the session."""
        with app.test_client() as client:
            with client.session_transaction() as change_session:
                change_session['high_score'] = 50
            res = client.post('/game-over-update', json = {"current_score": 100})
            
            self.assertEqual(res.status_code, 200)
            self.assertEqual(session['high_score'], 100)
            
    def test_game_over_dont_update_high_score(self):
        """Test that high score is not updated in the session, when the current score is lower than the all-time high score."""
        with app.test_client() as client:
            with client.session_transaction() as change_session:
                change_session['high_score'] = 110
            res = client.post('/game-over-update', json = {"current_score": 100})
            
            self.assertEqual(res.status_code, 200)
            self.assertEqual(session['high_score'], 110)
            
    def test_game_over_update_times_played(self):
        """Test that times_played is updated in the session."""
        with app.test_client() as client:
            with client.session_transaction() as change_session:
                change_session['times_played'] = 99
            res = client.post('/game-over-update', json = {"current_score": 100})
            
            self.assertEqual(res.status_code, 200)
            self.assertEqual(session['times_played'], 100)