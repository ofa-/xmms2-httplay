statusTimerID = null;
listupdate = 12;
timeTimerID = null;
revtime = false;
g_info = null;
TIME_DELAY = 200;
LIST_FIELDS = ['artist', 'title', 'tracknr', 'album'];
LIST_ORDER  = ['artist', 'album', 'tracknr']
slider_visible = "";

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
            field = document.createElement("td");
            $("<a href=\"#\" onclick=\"remove_song(" + i + ")\">[-]</a>").appendTo(field);
            row.appendChild(field);
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
    if (slider_visible == "") {
        $("#"+content).fadeIn("slow");
        slider_visible = content;
    } else if (content != slider_visible) {
        $("#"+slider_visible).fadeOut("slow");
        slider_visible = content;
        $("#"+content).fadeIn("slow");
    } else {
        $("#"+slider_visible).fadeOut("slow");
        slider_visible = "";
    }
}

function fliptime() {
    revtime = !revtime;
}

function update_status() {
    $.getJSON("cli/status",
        function(info) {
            if (!g_info || info.album != g_info.album)
                update_album(info);
            g_info = info;
            $("#banner").html(info.title + '<br>' + info.artist);
            $("#media").html(media_str(info));
        }
    );
}

function media_str(info) {
	//return JSON.stringify(info);
	return channels_str(info.channels)
		 + " " + info.url.replace(/.*\./, "")
		 + " " + Math.round(info.bitrate/1000) + "kbps"
}

function channels_str(nb_channels) {
	switch (nb_channels) {
	case 1: return "mono";
	case 2: return "";
	default: return nb_channels + " ch";
	}
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
    if ( listupdate == 0) {
        listupdate = 12
        update_list();
    } else
        listupdate = listupdate - 1;
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
    query = $('#querytxt').val().trim().replace(/^|\s+/g, " ~");
    $.getJSON("cli/search?q=" + encodeURIComponent(query)
		+"&o="+LIST_ORDER.join('+')
		+"&f=id+"+LIST_FIELDS.join('+')+(!add?'&add=True':''),
        function(result) {
            $('#filtered_mlib').children().remove();
            for (i in result) {
                row = document.createElement("tr");
                for (j in LIST_FIELDS) {
                    field = document.createElement("td");
                    field.appendChild(document.createTextNode(result[i][LIST_FIELDS[j]]));
                    row.appendChild(field);
                }
                field = document.createElement("td");
                $("<a href=\"#\" onclick=\"add_song(" + result[i]['id'] + ")\">[+]</a>").appendTo(field);
                row.appendChild(field);
                $('#filtered_mlib').append(row);
            }
        }
    );
    return false;
}

function add_song(add) {
    $.post("cli/add_song?q="+add);
    return false;
}

function remove_song(pos) {
    $.post("cli/remove_song?q="+pos);
    update_list();
    return false;
}

function update_album(info) {
    $("#cover").attr("src", "");
    $("#albuminfo").html(album_info(info));
    $.getJSON("cli/cover?q="
               + encodeURIComponent(info.artist + " " + info.album),
        function(info) {
            $("#cover").attr("src", info.responseData.results[0].tbUrl);
        }
    );
}

function album_info(info) {
       return    "<p>" + info.album + "</p>"
               + "<p>" + info.artist + "</p>"
               + "<p>" + info.date + "</p>"
}

function initialize_buttons() {
	var buttons = {
		pls:  function () { toggle_slider("plist") },
		lib:  function () { toggle_slider("mlib") },
		play: function () { $.get("cli/play") },
		next: function () { $.get("cli/next") },
		prev: function () { $.get("cli/prev") },
		time: function () { fliptime() },
		mlibSearch: function () { filter_mlib(true) },
		mlibAdd:    function () { filter_mlib(false) },
		plistClear: function () { pls_clear() },
	};
	for (butt in buttons)
		$("#"+butt).click(buttons[butt]);
}

$(document).ready(function() {
        initialize_timers();
        initialize_buttons();
        $("#timebar").click(seek);
        update_list();
        $("#mlibForm").submit(filter_mlib);
        $("#mlib").toggle();
        $("#plist").toggle();
});
