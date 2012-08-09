# xmms2-httplay #

This is a fork from Simon Poirier's [xmms2-httplay][1].

Simon Poirier's interface is prettier, but this version is more
feature full.

Change are:
    - the gui is not dragable is the html page
    - the list is not enclosed anymore in a slider
    - the list will update itself periodicaly
    - better handling of searching, adding and removing songs
    - xmms2-httplay do not start xmms2d if it don't find it, but wait
      for it.
    - xmms2-httplay will exit on xmms2d shutdown

# Where to find this version #
This version is on [github][2]

# Requirements #
    - python >= 2.5
    - python-simplejson
    - xmms2 with python support (tested against  0.8 DrO_o, it probably won't work with another DR version)

# Running #

    cd src
    python main.py

then browse to http://localhost:8000/

You may report bugs to https://github.com/vanicat/xmms2-httplay/issues


[1]: http://code.google.com/p/xmms2-httplay/
[2]: https://github.com/vanicat/xmms2-httplay
