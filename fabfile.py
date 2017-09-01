import os
#from os.path import abspath, dirname, join

import signal

import sys
from fabric.api import local

import django
import subprocess

import re

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
FAB_BASE_DIR = os.path.dirname(os.path.abspath(__file__))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tworavens.settings.local_settings')
try:
    django.setup()
except Exception as e:
    print("WARNING: Can't configure Django. %s" % e)

def stop():
    """Kill any python/npm processes"""
    try:
        local("killall npm")
    except:
        pass

    try:
        local("killall python")
    except:
        pass

def restart():
    """Kill any python/npm processes and then run"""
    stop()
    run()

def run():
    """Run the django dev server and webpack--webpack watches the assets directory and rebuilds when appTwoRavens changes"""

    clear_js()  # clear any dev css/js files

    commands = [
        # start webpack
        #'./node_modules/.bin/webpack --watch'
        'npm start',
        #'python manage.py runserver 8080'
        #'celery -A firmament worker --loglevel=info -B'
    ]

    proc_list = [subprocess.Popen(command, shell=True, stdin=sys.stdin, stdout=sys.stdout, stderr=sys.stderr) for command in commands]
    try:
        local("python manage.py runserver 127.0.0.1:8080")
    finally:
        for proc in proc_list:
            os.kill(proc.pid, signal.SIGKILL)

def webpack_prod():
    """Generate the webpack dist files for prod"""

    #cmd_webpack = './node_modules/.bin/webpack --config webpack.config-prod.js --watch'
    cmd_webpack = './node_modules/.bin/webpack --config webpack.prod.config.js'
    local(cmd_webpack)

def clear_js():
    """Delete old webpack dev. build files"""
    print(clear_js.__doc__)

    # webpack build directory
    webpack_build_dir = os.path.join(FAB_BASE_DIR, 'assets', 'build')

    # find files
    pat1 = r'^tworavens_(app|styles)\-(\w|-){20,50}\.(js|css)$'

    build_file_names = [x for x in os.listdir(webpack_build_dir)
                        if re.match(pat1, x) is not None]

    #if (x.startswith('log_') and x.endswith('.txt'))\
    #                      or (x.startswith('output') and x.endswith('.png'))]
    if not build_file_names:
        print('No files found')
        return

    print('Deleting %s file(s)' % len(build_file_names))
    print('-' * 40)
    for fname in [os.path.join(webpack_build_dir, x) for x in build_file_names]:
        print('removing... %s' % fname)
        os.remove(fname)
    print('-' * 40)
    print('Deleted %s file(s)' % len(build_file_names))


def clear_logs():
    """Delete log files and images in the rook directory"""
    print(clear_logs.__doc__)

    # rook directory
    rook_log_dir = os.path.join(FAB_BASE_DIR, 'rook')

    # find files
    pat1 = r'^log_(\w|-){25,50}\.txt$'
    pat2 = r'^output(\w|-){2,10}\.png$'

    log_files_names = [x for x in os.listdir(rook_log_dir)
                       if re.match(pat1, x) is not None or
                       re.match(pat2, x) is not None]

    if not log_files_names:
        print('No log files found')
        return

    print('Deleting %s log file(s)' % len(log_files_names))
    print('-' * 40)
    for fname in [os.path.join(rook_log_dir, x) for x in log_files_names]:
        print('removing... %s' % fname)
        os.remove(fname)
    print('-' * 40)
    print('Deleted %s log file(s)' % len(log_files_names))


def init_db():
    """Run django check and migrate"""
    local("python manage.py check")
    local("python manage.py migrate")
    #local("python manage.py loaddata fixtures/users.json")
    #Series(name_abbreviation="Mass.").save()

def test_front_matter():
    pass
    #from firmament.models import Volume
    #Volume.objects.first().generate_front_matter()

def ubuntu_help():
    """Set up directories for ubuntu 16.04 (in progress)"""
    from setup.ubuntu_setup import TwoRavensSetup
    trs = TwoRavensSetup()

def virtualenv_start():
    """Make the virtualenv"""
    local('ln -s /usr/bin/python3 /usr/bin/python')
    local('pip3 install virtualenvwrapper==4.7.2')
    local('mkdir /root/virtualenvs')
    local('mkdir /root/Devel')
    local('cp /root/.bashrc /root/.bashrc-org')
    local("echo 'export WORKON_HOME=/root/virtualenvs' >> /root/.bashrc")
    local("echo 'export PROJECT_HOME=/root/Devel' >> /root/.bashrc")
    local("echo 'export VIRTUALENVWRAPPER_PYTHON=/usr/bin/python3' >> /root/.bashrc")
    local("source /bin/bash /usr/local/bin/virtualenvwrapper.sh")
    local("source /root/.bashrc")
    local('cd /srv/webapps/TwoRavens')

    '''
    mkdir /srv/webapps/scripts
    pip3 install Fabric3==1.13.1.post1 && \
    mkdir /root/virtualenvs && \
    mkdir /root/Devel && \
    cp /root/.bashrc /root/.bashrc-org && \
    echo 'export WORKON_HOME=/root/virtualenvs' >> /root/.bashrc && \
    echo 'export PROJECT_HOME=/root/Devel' >> /root/.bashrc && \
    echo 'export VIRTUALENVWRAPPER_PYTHON=/usr/bin/python3' >> /root/.bashrc

#RUN export WORKON_HOME=/root/virtualenvs && \
#    export PROJECT_HOME=/root/Devel && \
#    export VIRTUALENVWRAPPER_PYTHON=/usr/bin/python3 && \
#    /bin/bash -c "source /bin/bash /usr/local/bin/virtualenvwrapper.sh"  && \
#    /bin/bash -c "source /root/.bashrc"


# ---------------------------------------------
# Virtualenv creation
# ---------------------------------------------
RUN /bin/bash -c "source /bin/bash /usr/local/bin/virtualenvwrapper.sh"  && \
    /bin/bash -c "source /root/.bashrc"
    cd /srv/webapps/TwoRavens && \
    mkvirtualenv -p python3 2ravens && \
    pip3 install -r requirements/prod.txt && \
    echo 'export DJANGO_SETTINGS_MODULE=tworavensproject.settings.dev_container' >> /root/virtualenvs/2ravens/bin/postactivate && \
    source /root/virtualenvs/2ravens/bin/postactivate && \
    fab init_db
'''