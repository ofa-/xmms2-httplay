
function channel(dst, cb) {
    var o = {};

    o.chan = $.post(dst);
    o.pos = 0;
    o.dst = dst;

    o.read = function() {
        var response = this.chan.responseText;
        var lenstr = response.substring(this.pos).match("[0-9]+!");
        if (lenstr.length == null) {
            this.keepalive();
            return null;
        }
        var msglen = parseInt(lenstr);
        var nextpos = this.pos + msglen;
        var msg = response.substring(this.pos+lenstr.length, nextpos);
        if (msg.length != msglen) {
            this.keepalive();
            return null;
        }
        this.pos = nextpos;
        return this.chan.responseText;
    }

    o.keepalive = function() {
        if (this.chan.readyState == this.chan.DONE) {
            this.chan = $.post(chan.dst);
            this.pos = 0;
        }
    }

    return o;
}

