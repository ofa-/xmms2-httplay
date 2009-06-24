statusTimerID = null;
timeTimerID = null;
revtime = false;
g_info = null;
TIME_DELAY = 200;
LIST_FIELDS = ['title', 'artist', 'tracknr', 'album'];
PLIST_HEIGHT = "300px";
slider_visible = "plist";
slider_open = true;

function update_list() {
    $.getJSON("cli/list", function(list) {
        $('#listable').children().remove();
        for (i in list) {
            row = document.createElement("tr");
            for (j in LIST_FIELDS) {
                field = document.createElement("td");
                field.appendChild(document.createTextNode(list[i][LIST_FIELDS[j]]));
                row.appendChild(field);
            }
            $('#listable').append(row);
        }
    });
}

function seek(e) {
    var pos = e.pageX - $("#timebar").offset().left;
    pos = pos / document.getElementById("timebar").offsetWidth;
    $.get("cli/seek?time=" + Math.round(pos*g_info.duration))
    update_status();
}

function asctime(t) {
    var tt = Math.round(t/1000);
    var s = tt % 60;
    var m = (tt-s)/60;
    s = Math.abs(s);
    return m+":"+(s>=10 ? "" : "0")+s;
}

function toggle_slider(content) {
    if (content == 'plist' && slider_visible != 'plist') update_list();
    if (content != slider_visible) {
        $("#"+slider_visible).fadeOut("slow");
        slider_visible = content;
        $("#"+content).fadeIn("slow");
    } else {
        $("#slider").animate({"top": (slider_open?"-=":"+=")+PLIST_HEIGHT}, "slow");
        slider_open = !slider_open;
    }
}

function fliptime() {
    revtime = !revtime;
}

function update_status() {
    $.getJSON("cli/status",
        function(info) {
            g_info = info;
            $("#banner").text(info.title + ' - ' + info.artist);
            $("#bitrate").html(info.channels + " channels   " + Math.round(info.bitrate/1000) + "kbps");
        }
    );
}

function update_time() {
    if (g_info) {
        g_info.playtime = Math.max(Math.min(g_info.playtime+TIME_DELAY, g_info.duration), 0);
        $("#innertimebar").width((g_info.playtime/g_info.duration*100) + "%");
        $("#time").html((revtime ? asctime(g_info.playtime-g_info.duration): asctime(g_info.playtime)) + " / " + asctime(g_info.duration) )
    }
}

function run_status() {
    update_status();
    statusTimerID = self.setTimeout("run_status()", 5000);
}

function pls_clear() {
    $.post('cli/clear');
    update_list();
}

function run_time() {
    update_time();
    timeTimerID = self.setTimeout("run_time()", TIME_DELAY);
}

function initialize_timers() {
    run_status();
    run_time();
}

function filter_mlib(add) {
    $.getJSON("cli/mlib?q="+this.querytxt.value+"&f="+LIST_FIELDS.join('+')+(!add?'':'&add=True'),
        function(result) {
            $('#filtered_mlib').children().remove();
            for (i in result) {
                row = document.createElement("tr");
                for (j in LIST_FIELDS) {
                    field = document.createElement("td");
                    field.appendChild(document.createTextNode(result[i][LIST_FIELDS[j]]));
                    row.appendChild(field);
                }
                $('#filtered_mlib').append(row);
            }
        }
    );
    return false;
}

$(document).ready(function() {
        initialize_timers();
        $("#timebar").click(seek);
        update_list();
        $("#main").draggable();
        $("#mlibForm").submit(filter_mlib);
        $("#mlib").toggle();
});

