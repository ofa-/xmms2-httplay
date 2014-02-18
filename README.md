# xmms2-httplay #

This is a fork from Vanicat's [xmms2-httplay][2],
which is a fork from Simon Poirier's [xmms2-httplay][1].

This version is slicker, and provides album-art display and playlist jump.

Change are:
 - no fancy background images for controls, just plain html
 - album-art display, based on google images search
 - click in playlist jumps to selected song
 - better handling of searching
 - buttons for adding and removing songs
 - xmms2-httplay waits for xmms2d if it doesn't find it
 - xmms2-httplay exits on xmms2d shutdown

# Where to find this version #
This version is on [ofa-'s github][3].

# Requirements #
 - python >= 2.5
 - python-simplejson
 - xmms2 with python support (tested against  0.8 DrO_o)

# Running #

    cd src
    python main.py

then browse to http://localhost:8000/

Feel free to use the github project tracker.


[1]: http://code.google.com/p/xmms2-httplay/
[2]: https://github.com/vanicat/xmms2-httplay
[3]: https://github.com/ofa-/xmms2-httplay
