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

import BaseHTTPServer
import reqs
import traceback, sys, os
from config import *

class Service(BaseHTTPServer.BaseHTTPRequestHandler):
    def do_GET(self, *args):
        try:
            try:
                path, kwargs = self.path.split('?')
                kwargs = dict([kv.split('=') for kv in kwargs.split('&')])
            except:
                path = self.path
                kwargs = {}

            path = path.strip('/')
            if not path:
                return self.servefile(DEFAULTFILE)
            if not hasattr(reqs, path.split('/')[0]):
                # try serving data file
                return self.servefile(path)

            cmd = "reqs."+path.replace('/', '.')
            resp = eval(cmd, {"reqs":reqs}, {})(**kwargs)

            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(resp)
            return
        except Exception, ee:
            return self.err_server(ee)

    def err_server(self, error):
        trace = sys.exc_info()[2]

        self.send_response(500)
        self.send_header('Content-type', 'text/html')
        self.end_headers()
        self.wfile.write('<html><h1>500 internal error: %s</h1><br/>%s</html>' % 
                (error.message, '<br>'.join(traceback.format_tb(trace))))
        return

    def err_notfound(self):
        self.send_response(404)
        self.send_header('Content-type', 'text/html')
        self.end_headers()
        self.wfile.write('<html><h1>404 not found: %s</h1></html>' % self.path)
        return

    def do_POST(self, *args):
        return self.do_GET(*args)

    def servefile(self, path):
        try:
            f = file(os.path.join(DATAPATH, path), 'r')
            self.send_response(200)
            self.end_headers()
            self.wfile.write(f.read())
            f.close()
        except IOError:
            return self.err_notfound()

