SEARCH="$1"
curl -s "https://www.google.fr/search?q=$SEARCH&tbm=isch" \
	 -A "Mozilla/5.0 (compatible; MSIE 7.01; Windows NT 5.0)" \
| tr '>' '\n' \
| grep '<img' -m 1 \
| sed 's:.*src="::; s:".*::'
