
def update_info(xmms_info):
	'''called by cli/status (reqs.py) when changing titles'''

	(artist, title) = xmms_info["icy_title"].split(" - ")
	album = artist + " - " + title
	year  = ""
	duration = 10
	playtime = 0

	xmms_info["title"]	= title
	xmms_info["artist"]	= artist
	xmms_info["album"]	= album
	xmms_info["date"]	= year
	xmms_info["duration"]	= duration * 1000
	xmms_info["playtime"]	= playtime
	xmms_info["url"]	= "[CAMPUS] mp3"
	xmms_info["polling"]	= 1
