#!/usr/bin/env python

import urllib2 as urllib
import json

DATA_URL = "http://www.fip.fr/livemeta"
(previous3, previous2, previous1, current, next1, next2) = range(6)

class SongInfo:
	def __init__(self, song):
		self.artist = song["authors"]
		self.year   = song.get("anneeEditionMusique")
		self.album  = song["titreAlbum"]
		self.title  = song["title"]
		self.cover  = song.get("visual")
		self.duration = song["end"] - song["start"]
		self.startTime = song["start"]

def get_info(items=[current]):
	json_data = json.loads(urllib.urlopen(DATA_URL).read())
	return [ SongInfo(json_data["steps"] \
				[json_data["levels"][0]["items"][item]]) \
			for item in items ]
	

def main():
	items = [ previous2, previous1, current, next1, next2 ]
	infos = get_info(items)
	for item, info in zip(items, infos):
		if not info:
			continue
		p = "=>" if item == current else "  "
		print p, u"{title} / {artist} ({year})".format(**vars(info))
	
import time

def update_info(xmms_info):
	'''called by cli/status (reqs.py) when changing titles'''
	curr, next = get_info([current, next1])
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
		polling = 1
	else:
		polling = 0

	xmms_info["title"]	= info.title
	xmms_info["artist"]	= info.artist
	xmms_info["album"]	= info.album
	xmms_info["date"]	= info.year
	xmms_info["duration"]	= info.duration * 1000
	xmms_info["playtime"]	= (now - info.startTime) * 1000
	xmms_info["url"]	= "[FIP] mp3"
	xmms_info["polling"]	= polling

#	print "=======\nplaytime={}/{} start={}".format(
#		xmms_info["playtime"], info.duration, info.startTime)


if __name__ == "__main__":
	main()
