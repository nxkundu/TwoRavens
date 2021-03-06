"""
WSGI config for tworavensproject project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/1.11/howto/deployment/wsgi/
"""

# ------------------------------------------------
# defining execfile for python 3 use
# ------------------------------------------------
def execfile(filename):
    globals = dict( __file__ = filename )
    exec( open(filename).read(), globals )

python_home = '/srv/.virtualenvs/2ravens'

activate_this = python_home + '/bin/activate_this.py'
execfile(activate_this)   #, dict(__file__=activate_this))

# ------------------------------------------------
# back to the standard Django WSGI code...
# ------------------------------------------------
import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "tworavensproject.settings.dev_container")

application = get_wsgi_application()
