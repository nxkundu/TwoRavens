#! usr/bin/python

#sorts a file alphabetically since my editor lacks that functionality

url = "/home/marcus/Documents/TwoRavens_Su17/Vito TwoRavens/data/dict_work/"
fileR = open(url + "from_PETRARCH/Petrarch_clean_dict.txt", "r")

data = []
for l in fileR:
	data.append(l.rstrip())

data.sort()

fileR.close()

#~ fileW = open(url + "CAMEO_FULL_SORTED.txt", "w")
#~ for l in data:
	#~ fileW.write("%s\n" %l)
#~ fileW.close()
print(len(data))
print("done")
