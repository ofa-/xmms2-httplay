#!/usr/bin/env python

import urllib2 as urllib
import json

DATA_URL = "http://www.fipradio.fr/sites/default/files/" \
		"import_si/si_titre_antenne/FIP_player_current.json"

class SongInfo:
	def __init__(self, song):
		self.artist = song.get("interpreteMorceau")
		self.year   = song.get("anneeEditionMusique")
		self.album  = song.get("titreAlbum")
		self.title  = song.get("titre")
		self.cover  = song["visuel"]["medium"]
		self.duration = song["endTime"] - song["startTime"]
		self.startTime = song["startTime"]

def get_info(items=["current"]):
	json_data = json.loads(urllib.urlopen(DATA_URL).read())
	return [ SongInfo(json_data[item]["song"]) \
			if item in json_data else None \
			for item in items ]
	

def main():
	items = [ "previous2", "previous1", "current", "next1", "next2" ]
	infos = get_info(items)
	for item, info in zip(items, infos):
		if not info:
			continue
		p = "=>" if item == "current" else "  "
		print p, u"{title} / {artist} ({year})".format(**vars(info))
	
import time

def update_info(xmms_info):
	'''called by cli/status (reqs.py) when changing titles'''
	curr, next = get_info(["current", "next1"])
	now = int(time.time())
	info = curr if (curr.startTime + curr.duration) > now else next
	if not info:
		info = curr
		info.title = "(no info)"
		info.artist = ""
		info.album = ""
		info.year = ""
		info.duration = 30
		info.startTime = now

	xmms_info["title"]	= info.title
	xmms_info["artist"]	= info.artist
	xmms_info["album"]	= info.album
	xmms_info["date"]	= info.year
	xmms_info["duration"]	= info.duration * 1000
	xmms_info["playtime"]	= (now - info.startTime) * 1000
	xmms_info["url"]	= "[FIP] mp3"

#	print "=======\nplaytime={}/{} start={}".format(
#		xmms_info["playtime"], info.duration, info.startTime)


if __name__ == "__main__":
	main()
