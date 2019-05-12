from flask import Flask
from flask import g
from flask import request
from flask import jsonify
#from flask_cors import CORS
import sqlite3
#from flask_restful import Resource, Api
import json

DATABASE = 'database.db'

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
    return db

app = Flask(__name__)
#api = Api(app)

@app.route('/')
def hello_world():
    cur = get_db().cursor()
    return 'Hello, World!'

def insert(table, fields=(), values=()):
    # g.db is the database connection
    cur = get_db().cursor()
    query = 'INSERT INTO %s (%s) VALUES (%s)' % (
        table,
        ', '.join(fields),
        ', '.join(['?'] * len(values))
    )
    cur.execute(query, values)
    get_db().commit()

@app.route('/new/<string:table>', methods=['GET', 'POST', 'OPTIONS'])
def new_video(table):
    data = {}
    if request.method == 'POST':
        post_data = request.get_json()
        data['data'] = post_data
        keys = post_data.keys()
        insert(table, fields=tuple(keys), values=tuple([repr(post_data[key]) if type(post_data[key]) == list else post_data[key] for key in keys]))
        data['times'] = post_data['response']
    response = jsonify(data)
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
    return response


@app.route('/list/<string:table>', methods=['GET'])
def list_videos(table):
    data = {}
    cur = get_db().cursor()
    query = "SELECT * FROM %s" % table
    data[table] = cur.execute(query).fetchall()
    response = jsonify(data)
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
    return response



@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

