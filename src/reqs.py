#!/usr/bin/env python
# Copyright 2009 Simon Poirier
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from sys import path
path.append('/usr/local/lib/python2.5/site-packages/')
import xmmsclient
from simplejson import JSONEncoder, JSONDecoder


def test(**kwargs):
    ret = "parms:<br/>"
    for k in kwargs:
        ret += "<br/>&nbsp;%s : %s" % (k, kwargs[k])
    return ret

class Cli(object):
    def __init__(self):
        self.c = xmmsclient.XMMS()
        self.c.connect()

    def prev(self):
        self.c.playlist_set_next_rel(-1).wait()
        self.c.playback_tickle().wait()

    def play(self):
        r = self.c.playback_status()
        r.wait()
        if r.value() == xmmsclient.PLAYBACK_STATUS_PLAY:
            self.c.playback_pause().wait()
        else:
            self.c.playback_start().wait()


    def stop(self):
        self.c.playback_stop().wait()

    def next(self):
        self.c.playlist_set_next_rel(1).wait()
        self.c.playback_tickle().wait()

    def status(self):
        r = self.c.playback_current_id()
        r.wait()
        r = self.c.medialib_get_info(r.value())
        r.wait()
        info = r.value()
        info = dict([(k[1], info[k]) for k in info])
        r = self.c.playback_playtime()
        r.wait()
        info["playtime"] = r.value()
        return JSONEncoder().encode(info)

    def seek(self, time):
        return self.c.playback_seek_ms(int(time)).wait()

    def list(self):
        r = self.c.playlist_list_entries()
        r.wait()
        list = r.value()
        listing = []
        for id in list:
            r = self.c.medialib_get_info(id)
            r.wait()
            info = r.value()
            listing.append(dict([(k[1], info[k]) for k in info]))
        return JSONEncoder().encode(listing)

    def mlib(self, q, f, add=False):
        coll = xmmsclient.xmmsapi.coll_parse(q)
        r = self.c.coll_query_infos(coll, f.split('+'))
        r.wait()
        if add:
            self.c.playlist_add_collection(coll).wait()
        return JSONEncoder().encode(r.value())

    def clear(self):
        self.c.playlist_clear().wait()

cli = Cli()

