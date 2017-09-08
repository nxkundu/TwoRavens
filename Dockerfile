# Note: This only runs the Django app, not the rook services
FROM ubuntu:16.04
MAINTAINER Raman Prasad (raman_prasad@harvard.edu)

RUN apt-get update && \
    apt-get upgrade  && \
    apt-get -y install vim && \
    apt-get -y install sqlite3 && \
    apt-get -y install python3-pip && \
    ln -sf /usr/bin/python3 /usr/bin/python

# Local directory with project source
#ENV DJANGO_SETTINGS_MODULE=tworavensproject.settings.dev_container
ENV DJANGO_SETTINGS_MODULE=tworavensproject.settings.dev_container2

RUN mkdir -p /var/webapps/TwoRavens

# Copy over the repository
COPY . /var/webapps/TwoRavens

WORKDIR /var/webapps/TwoRavens

# Install requirements
RUN pip3 install --no-cache-dir -r requirements/dev.txt && \
    fab init_db && \
    fab create_django_superuser


EXPOSE 8080

# Run dev server
#CMD cd TwoRavens && fab init_db && python manage.py runserver 8080
# python manage.py runserver 0.0.0.0:8080