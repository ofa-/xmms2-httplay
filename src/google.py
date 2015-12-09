import urllib
import re

def get_img_url(q):
	url = "https://www.google.fr/search?q=" + q + "&tbm=isch"
	req = urllib.URLopener()
	req.addheaders = [('User-agent', 'Mozilla/5.0')]
	html = req.open(url).read()
	img_url = re.search('<img .*? src="(.*?)"', html).group(1)

	return img_url
