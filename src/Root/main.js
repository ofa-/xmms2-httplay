revtime = false;
g_info = {};
LIST_FIELDS = ['artist', 'title', 'tracknr', 'album'];
LIST_ORDER  = ['album', 'tracknr', 'artist']
slider_visible = "";

function update_list() {
    $.getJSON("cli/list", function(list) {
        $('#listable').children().remove();
        for (i in list) {
            row = document.createElement("tr");
            for (j in LIST_FIELDS) {
                value = list[i][LIST_FIELDS[j]];
                field = document.createElement("td");
                if (value) field.appendChild(document.createTextNode(value));
                row.appendChild(field);
            }
            field = document.createElement("td");
            $("<a href='#'>[-]</a>").appendTo(field)
		.click(wrap(remove_song, row));
            row.onclick = wrap(jump_to, row);
            row.appendChild(field);
            row.pos = i;
            $('#listable').append(row);
        }
    });
}

function jump_to(row) {
    player("goto?pos=" + row.pos);
}

function wrap(f, x, y) {
    return function() { return f(x, y) }
}

function seek(e) {
    var pos = e.pageX - $("#timebar").offset().left;
    pos = pos / document.getElementById("timebar").offsetWidth;
    player("seek?time=" + Math.round(pos*g_info.duration))
}

function asctime(t) {
    var tt = Math.round(t/1000);
    var s = tt % 60;
    var m = (tt-s)/60;
    s = Math.abs(s);
    m = Math.abs(m);
    return (t>0 ? "" : "-")+m+":"+(s>=10 ? "" : "0")+s;
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

var updating;
function update_status() {
    if (updating) return;
    updating = true;
    $.getJSON("cli/status",
        function(info) {
            info.timestamp = new Date().getTime();
            if (info.album && info.album != g_info.album)
                update_album(info);
            if (info.playstate != 1 && info.id != g_info.id)
                info.playtime = 0;
            g_info = info;
            $("#banner").html(info.title + '<br>' + info.artist);
            $("#media").html(media_str(info));
            updating = false;
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
    if (!g_info)
        return;
    var playtime = g_info.playtime;
    if (g_info.playstate == 1)
        playtime += new Date().getTime() - g_info.timestamp;
    if (playtime > (g_info.duration - 80)) {
        update_status();
        return;
    }
    var percent = g_info.polling ? 100 : playtime/g_info.duration*100;
    $("#innertimebar").width(percent + "%");

    if (revtime || g_info.polling)
        playtime -= g_info.duration;
    $("#time").html(asctime(playtime) + " / " + asctime(g_info.duration))
}

function pls_clear() {
    $.post('cli/clear');
    update_list();
}

function mk_xmms_query(query) {
    parts = query.match(/"[^"]+"|\S+/g);
    query = "";
    for (i in parts)
        query += " ~" + parts[i]
    return query.substr(1);
}

function filter_mlib(add) {
    query = $('#querytxt').val();
    if (":" == query[0])
        query = query.substr(1);
    else
        query = mk_xmms_query(query);
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
                $("<a href='#'>[+]</a>").appendTo(field)
                    .click(wrap(add_song, result[i]['id']));
                row.appendChild(field);
                $('#filtered_mlib').append(row);
            }
        }
    );
    return false;
}

function add_song(add) {
    $.post("cli/add_song?q="+add, update_list);
    return false;
}

function remove_song(row) {
    $.post("cli/remove_song?q=" + row.pos,
	function() {
		for (var n = row; n = n.nextSibling; )
			n.pos = n.previousSibling.pos;
		row.parentNode.removeChild(row);
	});
    return false;
}

function update_album(info) {
    $("#cover").attr("src", "");
    $("#albuminfo").html(album_info(info));
    $.getJSON("cli/cover?q="
               + encodeURIComponent(info.artist + " " + info.album),
        function(res) {
            if (res.responseData)
                $("#cover").attr("src", res.responseData.results[0].tbUrl);
            else
                update_album(info);
        }
    );
}

function album_info(info) {
       return    "<p>" + str(info.album) + "</p>"
               + "<p>" + str(info.artist) + "</p>"
               + "<p>" + str(info.date) + "</p>"
}

function str(x) {
	return x || "";
}

function player(action) {
	$.get("cli/"+action, update_status);
}

function initialize_buttons() {
	var buttons = {
		pls:  function () { toggle_slider("plist") },
		lib:  function () { toggle_slider("mlib") },
		play: function () { player("play") },
		next: function () { player("next") },
		prev: function () { player("prev") },
		time: function () { fliptime() },
		mlibSearch: function () { filter_mlib(true) },
		mlibAdd:    function () { filter_mlib(false) },
		plistClear: function () { pls_clear() },
	};
	for (butt in buttons)
		$("#"+butt).click(buttons[butt]);
}

$(document).ready(function() {
        setInterval(update_time, 200);
        initialize_buttons();
        $("#mlib").hide();
        $("#plist").hide();
        $("#timebar").click(seek);
        $("#mlibForm").submit(filter_mlib);
        update_status();
        update_list();
        filter_mlib(true);
});
