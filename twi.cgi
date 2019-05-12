#!/usr/bin/python2.7
#from pip.operations import freeze
#x = freeze.freeze()
#print(x)

#import sys
#sys.path.insert(0, '/afs/.ir/users/l/d/ldomine/.local/lib/python2.7/site-packages')
#sys.path.append('/afs/.ir/users/l/d/ldomine/.local/lib/python2.7/site-packages')
#sys.path.insert(0, '/afs/ir.stanford.edu/users/l/d/ldomine/.local/lib/python2.7/site-packages/flask_restful')
from wsgiref.handlers import CGIHandler
#import flask
#print flask.__file__
#print sys.executable
#import os
#print os.environ
#print os.listdir('/afs/ir.stanford.edu/users/l/d/ldomine/.local/lib/python2.7/site-packages')
#print sys.path
#print sys.version
#import flask_restful
from twi import app
#from twi0 import app

CGIHandler().run(app)


