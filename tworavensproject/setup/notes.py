
"""
import requests

data = '''{"zdata":"fearonLaitin.tab","zedges":[["country","ccode"],["ccode","cname"]],"ztime":[],"znom":[],"zcross":[],"zmodel":"","zvars":["ccode","country","cname"],"zdv":[],"zdataurl":"https://dataverse.harvard.edu/api/access/datafile/3044420?key=","zsubset":[["",""],[],[]],"zsetx":[["",""],["",""],["",""]],"zmodelcount":0,"zplot":[],"zsessionid":"","zdatacite":"Dataverse Team, 2015"}'''

url = 'http://0.0.0.0:8080/custom/dataapp'

app_data = dict(solaJSON=data)

r = requests.post(url, data=app_data)
r.text
r.status_code
"""
