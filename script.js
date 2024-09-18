// let sel = document.getElementById("teamSel");
// let lg = document.getElementById("league");
// let dd = document.getElementById("dropDown");
var games = new Object();
g = [];
d = new Date();
window.onload = function() {
	if (!navigator.share) {
		document.getElementById("sBut").style.display="none";
	}
	document.getElementById("dropDown").value="";
	d.setFullYear(d.getFullYear() + 1);
	if (localStorage.length > 0) {
		for (var i = 0; i < localStorage.length; i++) {
			games[localStorage.key(i)] = localStorage.getItem(localStorage.key(i)).split(",");
		}
	}
	// if (document.cookie.length > 0) {
	// 	c = document.cookie.split("; ");
	// 	console.log(c);
	// 	for (var i = 0; i < c.length; i++) {
	// 		g = c[i].split("=");
	// 		console.log(g);
	// 		games[g[0]] = g[1].split(",");
	// 	}
	// }
	tabs = document.getElementsByClassName("tab");
	for (var i = 0; i < tabs.length; i++) {
		tabs[i].setAttribute("onclick","setActive("+tabs[i].id+")");
	}
}
games.nba = [];
games.mlb = [];
games.nfl = [];
games.nhl = [];
games.menscollegebasketball = [];
games.collegefootball=[];
var h = new XMLHttpRequest();
lgOpts = new Map();
lgOpts.set("baseball",["mlb"]);
lgOpts.set("basketball",["nba","mens-college-basketball"]);
lgOpts.set("football",["nfl","college-football"]);
lgOpts.set("hockey",["nhl"]);
names = new Map();
names.set("mens-college-basketball","NCAAM");
names.set("college-football","NCAAF");
names.set("nfl","NFL");
names.set("mlb","MLB");
names.set("nhl","NHL");
names.set("nba","NBA");
async function setLg() {
	// opts = lgOpts.get(document.getElementById("dropDown").value);
	getData("https://site.api.espn.com/apis/site/v2/leagues/dropdown?lang=en&region=us&calendartype=whitelist&limit=1000&sport="+document.getElementById("dropDown").value).then((opts) => {
	//document.getElementById("icons").className = document.getElementById("dropDown").value;
	console.log(opts);
	lg = document.getElementById("league");
	lg.innerHTML="<option value=''>Select a League</option>";
	for (var i = 0; i < opts.leagues.length; i++) {
		op = document.createElement("option");
		op.value = opts.leagues[i].slug;
		op.innerText = opts.leagues[i].abbreviation || opts.leagues[i].name;//names.get(opts[i]);
		lg.appendChild(op);
		if (!games[opts.leagues[i].slug.replaceAll("-","")]) {
			games[opts.leagues[i].slug.replaceAll("-","")] = [];
		}
	}});
}
function setYr() {
	da = new Date();
	d = da.getFullYear();
	m = da.getMonth();
	if ((document.getElementById("dropDown").value == "basketball" || document.getElementById("dropDown").value == "hockey") && m > 8) {
		d++;
	}
	document.getElementById("season").innerHTML = "<option value=\"\">Select Year</option>";
	for (var i = 2000; i <= d; i++) {
		yr = document.createElement("option");
		yr.setAttribute("value",""+i);
		yr.innerText = i;
		document.getElementById("season").appendChild(yr);
	}
}
function findGames() {
	document.getElementById("gameList").className = document.getElementById("dropDown").value;
	document.getElementById("gameList").innerHTML="";
	g = new XMLHttpRequest();
	sport = document.getElementById("dropDown").value;
	league = document.getElementById("league").value;
	year = document.getElementById("season").value;
	id = document.getElementById("teamSel").value;
	if (sport != "soccer") {
		g.open("GET","https://site.api.espn.com/apis/site/v2/sports/"+sport+"/"+league+"/teams/"+ id + "/schedule?season="+year+"&seasontype="+document.getElementById("regPost").value);
	} else {
		g.open("GET","https://site.api.espn.com/apis/site/v2/sports/"+sport+"/"+league+"/teams/"+ id + "/schedule?season="+year);
	}
	g.responseType = 'json';
	g.onload = function() {
		console.log("loaded");
		game=g.response;
		console.log(game);
		for (var i = 0; i < game.events.length; i++) {
			ins = "";
			if (game.events[i].competitions[0].status.type.completed) {
			if (league.includes("college")) {
		ins += game.events[i].competitions[0].competitors[1].team.nickname + " " + game.events[i].competitions[0].competitors[1].score.value + " @ " + game.events[i].competitions[0].competitors[0].team.nickname + " " + game.events[i].competitions[0].competitors[0].score.value;
			} else {
			ins += game.events[i].competitions[0].competitors[1].team.shortDisplayName + " " + game.events[i].competitions[0].competitors[1].score.value + " @ " + game.events[i].competitions[0].competitors[0].team.shortDisplayName + " " + game.events[i].competitions[0].competitors[0].score.value;
			}
		if (game.events[i].competitions[0].notes && game.events[i].competitions[0].notes[0]) {
			ins+= " ["+ game.events[i].competitions[0].notes[0].headline + "]";
		}
				ins+=" - "+game.events[i].competitions[0].date.substring(0,10);
		ins+= /*" (<a href=\""+game.events[i].links[0].href+"\" target=\"blank\">ESPN</a>)*/"<button class=\"addG\" onclick=\"addGame('"+league+"','"+game.events[i].id+"')\"";
				if (games[league.replaceAll("-","")].includes(game.events[i].id)) {
					ins+=" disabled>Already Added!";
				} else {
					ins+= ">Add Game";
				}
				ins+= "</button>";
		item = document.createElement("li");
		item.innerHTML = ins;
		item.id = game.events[i].id;
		document.getElementById("gameList").appendChild(item);
		}}
	}
		console.log("sending");
		g.send();
}
function getGames() {
	printGames(document.getElementById("dropDown").value,document.getElementById("league").value);
}
async function printGames(sport,league) {
	document.getElementById("gameList").className = document.getElementById("dropDown").value;
	gms = games[league.replaceAll("-","")];
	document.getElementById("gameList").innerHTML="";
	// console.log(gms);
	g = [];
	for (var i = 0; i < gms.length; i++) {
		// console.log(league);
		g.push(new XMLHttpRequest());
		var game;
		url = "https://site.api.espn.com/apis/site/v2/sports/"+sport+"/"+league+"/summary?event="+gms[i];
		 var e = await fetch(url);//.then(response => {
		// 	game = response.json();
		// })
		game = await e.json();
		console.log(game);
		ins = "";
		// /*game = await makeRequest*/g[i].open("GET","https://site.api.espn.com/apis/site/v2/sports/"+sport+"/"+league+"/summary?event="+gms[i]);
		item = document.createElement("li");
		// g[i].responseType='json';
		// g[i].onload = function() {
		// console.log(g);
		// game=g[i].response;
		// console.log(game);
		if (league.includes("college") && (league.includes("basket") || league.includes("foot"))) {
			ins = game.header.competitions[0].date.substring(0,10) + " - " + game.header.competitions[0].competitors[1].team.nickname + " " + game.header.competitions[0].competitors[1].score;
			if (game.header.competitions[0].neutralSite) {
				ins+= " vs ";
			} else {
				ins+= " @ ";
			}
			ins+= game.header.competitions[0].competitors[0].team.nickname + " " + game.header.competitions[0].competitors[0].score;
		} else {
			ins = game.header.competitions[0].date.substring(0,10) + " - " + game.header.competitions[0].competitors[1].team.name + " " + game.header.competitions[0].competitors[1].score;
			if (game.header.competitions[0].neutralSite) {
				ins+= " vs ";
			} else {
				ins+= " @ ";
			}
			ins+= game.header.competitions[0].competitors[0].team.name + " " + game.header.competitions[0].competitors[0].score;
		}
		if (game.header.gamenotes) {
			ins+= " ["+ game.header.gamenotes + "]";
		} else if (game.header.gameNote) {
			ins+= " [" + game.header.gameNote + "]";
		}
		// ins+= " (<a href=\""+game.header.links[0].href+"\" target=\"blank\">ESPN</a>)";
		// ins="";
		if (document.getElementsByClassName("activeTab").length > 0 && document.getElementsByClassName("activeTab")[0].id == "rem") {
			ins+="<button onclick=\"remove('"+league+"','"+game.header.id+"')\">Remove Game</button>";
		} else {
			// ins+="<button onclick=\"showBox('"+url+"')\">Show Box Score</button>";
		item.setAttribute("onclick","showBox(\""+url+"\")");
		}
			item.innerHTML = ins;
		item.id = game.header.id;
		document.getElementById("gameList").appendChild(item);
		setTimeout(() => {
		if (item.clientHeight > 170) {
			item.className = 'fourLines';
			console.log(item.clientHeight);
		} else if (item.clientHeight > 150) {//(item.innerText.length > 73) {
			item.className = 'threeLines';
			console.log(item.clientHeight);
		} else if (item.innerText.length > 42) {
			item.className = 'twoLines';
		}
		},2);
		// }
		// console.log("sending");
		// g[i].send();
	}
}
async function findTeams() {
	document.getElementById("teamSel").innerHTML = "<option value=\"\">Select a Team</option>";
	g = new XMLHttpRequest();
	url = "";
	if (document.getElementById("league").value == "college-football") {
		/*g.open("GET",*/url="https://site.api.espn.com/apis/site/v2/sports/football/college-football/teams?groupType=conference&enable=groups&groups=80";
	} else if (document.getElementById("league").value == "mens-college-basketball") {
		/*g.open("GET",*/url="https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/teams?groupType=conference&enable=groups&groups=50";
	} else {
		/*g.open("GET",*/url="https://site.api.espn.com/apis/site/v2/sports/"+document.getElementById("dropDown").value+"/"+document.getElementById("league").value+"/teams";
	}
	/*g.responseType='json';
	g.onload = function() {
		console.log(g.response);*/
	e = await fetch(url);
		if (document.getElementById("league").value.includes("college") && (document.getElementById("league").value.includes("basket") || document.getElementById("league").value.includes("foot"))) {
			l = await e.json();
			confs = l.sports[0].leagues[0].groups;//g.response.sports[0].leagues[0].groups;
			console.log(confs);
			for (var i = 0; i < confs.length; i++) {
				head = document.createElement("optgroup");
				head.setAttribute("label",confs[i].midsizeName);
				document.getElementById("teamSel").appendChild(head);
				for (var j = 0; j < confs[i].teams.length; j++) {
					tmName = document.createElement("option");
					tmName.setAttribute("value",confs[i].teams[j].id);
					tmName.innerText = confs[i].teams[j].nickname;
					document.getElementById("teamSel").appendChild(tmName);
				}
			}
		} else {
			t = await e.json();
			console.log(t);
			teams = t.sports[0].leagues[0].teams;//g.response.sports[0].leagues[0].teams;
			for (var i = 0; i < teams.length; i++) {
				tmName = document.createElement("option");
				tmName.value = teams[i].team.id;
				tmName.innerText = teams[i].team.displayName;
				document.getElementById("teamSel").appendChild(tmName);
			}
		}
	//}
	// g.send()
}
function addGame(league,id) {
	b = document.getElementById(id).children[0];
	b.setAttribute("disabled","true");
	b.innerText = "Added!";
	league = league.replaceAll("-","");
	if (!games[league].includes(id)) {
			games[league].push(id);
	}
	games[league] = games[league].sort(function(a,b){return parseInt(a) - parseInt(b)});
	localStorage[league] = games[league];
	//document.cookie = league+"="+games[league]+";expires="+d.toUTCString()+";path=/";
}
function setActive(id) {
	if (id.id != 'fou') {
		hideBox();
	}
	document.getElementById("icons").className="";
	console.log(id);
	tabs = document.getElementsByClassName("tab");
	for (var i = 0; i < tabs.length; i++) {
		tabs[i].className = tabs[i].className.replace(" activeTab","");
	}
	document.getElementById(id.id).className+= " activeTab";
	setPg(id.id);
}

function setPg(mode) {
	document.getElementById("dropDown").value="";
	document.getElementById("league").value="";
	document.getElementById("gameList").innerHTML="";
	document.getElementById("season").value="";
	if (mode =="adG") {
		document.getElementById("header").innerText = 'Add Game';
		document.getElementById('set').setAttribute("hidden","true");
		document.getElementById("content").removeAttribute("hidden");
		document.styleSheets.item(0).rules[11].style.display = "block";
				document.styleSheets.item(0).rules[23].cssRules[3].style.display = "inline";
		document.getElementById("btn").setAttribute("onclick","setPg('hm')");
		document.getElementById("btn").innerHTML='\ue88a';
		document.getElementById("btn").style.fontFamily = "Material Symbols Outlined";
		document.getElementById("league").setAttribute("onchange","findTeams()");
		document.getElementById("teamSel").value="";
		document.getElementById("season").value="";
	} else if (mode =="hm") {
		document.getElementById("header").innerText = 'Home';
		document.getElementById('set').setAttribute("hidden","true");
		document.getElementById("content").removeAttribute("hidden");
		document.styleSheets.item(0).rules[11].style.display = "none";
		document.styleSheets.item(0).rules[23].cssRules[3].style.display = "none";
		document.getElementById("btn").setAttribute("onclick","setPg('adG')");
		document.getElementById("btn").innerText="Add Game";
		document.getElementById("btn").style.fontFamily = "Verdana, sans-serif";
		document.getElementById("league").setAttribute("onchange","getGames()");
	} else if (mode=="rem") {
		setPg('hm');
		document.getElementById("header").innerText = 'Remove Games';
	} else if (mode=="fou") {
		document.getElementById('content').setAttribute("hidden","true");
		document.getElementById("set").removeAttribute("hidden");
	}
}
function remove(league, id) {
	league = league.replaceAll("-","");
	sure = confirm("Are you sure you want to remove this game?");
	ind = games[league].indexOf(id);
	if (ind >=0 && sure) {
		games[league].splice(ind,1);
		document.getElementById(id).style.display="none";
	}
	localStorage[league] = games[league];
}
function clearAll() {
	del = confirm("Are you sure you want to delete all games from memory?\nThis cannot be undone.");
	if (del) {
		localStorage.clear();
	}
}
function createLineScore(sport,teams) {
	ret = document.createElement("div");
	topRow = document.createElement("tr");
	topRow.appendChild(document.createElement("th"));
	away = document.createElement("tr");
	aTm = document.createElement("td");
	aTm.innerText = teams[1].team.abbreviation;
	away.appendChild(aTm);
	hTm = document.createElement("td");
	hTm.innerText = teams[0].team.abbreviation;
	home = document.createElement("tr");
	home.appendChild(hTm);
	for (var i = 0; i < teams[1].linescores.length; i++) {
		pd = document.createElement("th");
		if ((sport=="hockey" && i > 2) || ((sport == "basketball" || sport == "football") && i > 3)) {
			pd.innerText = "OT";
		} else {
			pd.innerText = "" + (i+1);
		}
		topRow.appendChild(pd);
		hS = document.createElement("td");
		if (teams[0].linescores[i]) {
			hS.innerText = teams[0].linescores[i].displayValue;
		} else {
			hS.innerText = '\u00d7';
		}
		home.appendChild(hS);
		aS = document.createElement("td");
		aS.innerText = teams[1].linescores[i].displayValue;
		away.appendChild(aS);
	}
	score = document.createElement("th");
	topRow.appendChild(score);
	hF = document.createElement("td");
	hF.innerText = teams[0].score;
	home.appendChild(hF);
	aF = document.createElement("td");
	aF.innerText = teams[1].score;
	away.appendChild(aF);
	if (sport == "baseball") {
		hits = document.createElement("th");
		score.innerText = "R";
		hits.innerText = "H";
		err = document.createElement("th");
		err.innerText = "E";
		topRow.append(hits,err);
		hH = document.createElement("td");
		hH.innerText = teams[0].hits;
		home.append(hH);
		aH = document.createElement("td");
		aH.innerText = teams[1].hits;
		away.append(aH);
		hE = document.createElement("td");
		hE.innerText = teams[0].errors;
		home.append(hE);
		aE = document.createElement("td");
		aE.innerText = teams[1].errors;
		away.append(aE);
	}
	ret.append(topRow,away,home);
	ret.className = "line";
	return ret;
}
function createBox(stats) {
	ret = document.createElement("div");
	topRow = document.createElement("tr");
	topRow.appendChild(document.createElement("th"));
	for (var i = 0; i < stats.labels.length; i++) {
		tS = document.createElement("th");
		tS.innerText=stats.labels[i];
		topRow.appendChild(tS);
	}
	ret.appendChild(topRow);
	for (var i = 0; i < stats.athletes.length; i++) {
		ath = document.createElement("tr");
		nm = document.createElement("td");
		nm.innerText = stats.athletes[i].athlete.shortName || stats.athletes[i].athlete.displayName;
		if (stats.athletes[i].starter) {
			nm.innerHTML+= " <span class='stP'>" + stats.athletes[i].athlete.position.abbreviation+"</span>";
		}
		ath.appendChild(nm);
		if (stats.athletes[i].didNotPlay) {
			dnp = document.createElement("td");
			dnp.innerText = "DNP";
			dnp.className = "dnp";
			dnp.setAttribute("colspan",stats.names.length + "");
			ath.appendChild(dnp);
		} else {
			for (var j = 0; j < stats.athletes[i].stats.length; j++) {
				st = document.createElement("td");
				st.innerText = stats.athletes[i].stats[j];
				ath.appendChild(st);
			}
		}
		ret.appendChild(ath);
	}
	ret.className="scrollable";
	return ret;
}

function bsbBatBox(stats) {
	ret = document.createElement("div");
	topRow = document.createElement("tr");
	console.log(topRow);
	topRow.append(document.createElement("th"));
	for (var i = 0; i < stats.names.length; i++) {
		tS = document.createElement("th");
		tS.innerText=stats.names[i];
		topRow.appendChild(tS);
	}
	ret.appendChild(topRow);
	var notes = [];
	for (var i = 0; i < stats.athletes.length; i++) {
		ath = document.createElement("tr");
		nm = document.createElement("td");
		if (stats.athletes[i].starter) {
			nm.innerText = stats.athletes[i].batOrder + " ";
		} else {
			console.log(stats.athletes[i]);
			try {
				if (stats.athletes[i].notes[0].type != "pitchingDecision") {
					nm.innerText = "("+stats.athletes[i].notes[0].text.split("-")[0]+") ";//"";
					notes.push(stats.athletes[i].notes[0].text);
				} else {
					nm.innerText = "";
				}
			} catch (err) {
				nm.innerText = "";
			}
			// notes.appendChild(note);
			nm.className = "reserve";
		}
		nm.innerText+= stats.athletes[i].athlete.shortName;
		if (stats.athletes[i].positions) {
			poss = stats.athletes[i].positions.reverse().map(e => e.abbreviation).join("-");
			nm.innerText+= "\t"+poss;
		} else {
			nm.innerText+="\t"+stats.athletes[i].position.abbreviation;
		}
		ath.appendChild(nm);
		for (var j = 0; j < stats.athletes[i].stats.length; j++) {
			st = document.createElement("td");
			st.innerText = stats.athletes[i].stats[j];
			ath.appendChild(st);
		}
		ret.appendChild(ath);
	}
	var noteRow = document.createElement("tr");
	// noteRow.append(notes);
	var noteData = document.createElement("td");
	noteData.setAttribute("colspan","13");
	noteData.innerText=notes.join("\n");
	noteRow.append(noteData);
	noteRow.style = "text-align: left !important;";
	ret.append(noteRow);
	ret.className = "scrollable"
	return ret;
}
function pitchBox(stats) {
	ret = document.createElement("div");
	topRow = document.createElement("tr");
	topRow.appendChild(document.createElement("th"));
	for (var i = 0; i < stats.names.length; i++) {
		tS = document.createElement("th");
		tS.innerText=stats.names[i];
		topRow.appendChild(tS);
	}
	ret.appendChild(topRow);
	for (var i = 0; i < stats.athletes.length; i++) {
		ath = document.createElement("tr");
		nm = document.createElement("td");
		nm.innerText = stats.athletes[i].athlete.shortName;
		if (stats.athletes[i].notes) {
			nm.innerText += " (" + stats.athletes[i].notes[0].text+")";
		}
		ath.appendChild(nm);
		for (var j = 0; j < stats.athletes[i].stats.length; j++) {
			st = document.createElement("td");
			st.innerText = stats.athletes[i].stats[j];
			ath.appendChild(st);
		}
		ret.className="scrollable";
		ret.appendChild(ath);
	}
	return ret;
}
async function showBox(url) {
	// document.getElementById("content").setAttribute("hidden","true");
	document.getElementById("content").style.marginLeft = "-100vw";
	document.getElementById("content").style.marginRight = "150vw";
	document.styleSheets[0].rules[4].style.borderBottomColor = "rgba(255,255,255,0.0)";
	document.getElementById("content").style.overflow = "scroll";
	// document.getElementById("bsbBox").removeAttribute("hidden");
	setTimeout(() => {
		document.getElementById("content").style.height = document.getElementById("bsbBox").clientHeight + "px";
	},350);
	var box = document.getElementById("bsbBox");
	box.style.display="block";
	setTimeout(() => {
		box.style.marginLeft="0vw";
		box.style.marginRight="0vw";
	},3);
	
	var aft;
	// box.innerHTML += "Loading...";
	getData(url).then((gameJ) => {	box.appendChild(createLineScore(document.getElementById("dropDown").value,gameJ.header.competitions[0].competitors));
	if (document.getElementById("dropDown").value == "soccer") {
		box.appendChild(soccerBox(gameJ.keyEvents));
	} else {
	for (var i = 0; i < gameJ.boxscore.players.length; i++) {
		hTN = document.createElement("h3");
		hTN.innerText = gameJ.boxscore.players[i].team.shortDisplayName;
		box.appendChild(hTN);
		for (var j = 0; j < gameJ.boxscore.players[i].statistics.length; j++) {
			he = document.createElement("h4");
			he.innerText = gameJ.boxscore.players[i].statistics[j].text || gameJ.boxscore.players[i].statistics[j].name || gameJ.boxscore.players[i].statistics[j].type || "";
			box.appendChild(he);
			t = document.createElement("table");
			if (document.getElementById("dropDown").value == "baseball" && gameJ.boxscore.players[i].statistics[j].type == "batting") {
				t.appendChild(bsbBatBox(gameJ.boxscore.players[i].statistics[j]));
			} else if (document.getElementById("dropDown").value == "baseball") {
				t.appendChild(pitchBox(gameJ.boxscore.players[i].statistics[j]));
			} else if (document.getElementById("dropDown").value == "soccer") {
				
			} else {
				t.appendChild(createBox(gameJ.boxscore.players[i].statistics[j]));
			}
			box.appendChild(t);
		}
		aft = "<a href=\""+gameJ.header.links[0].href+"\">(ESPN)</a>";
	}
	 // aft = "<a href=\""+url+"\">(ESPN)</a>";
   aP = document.createElement("p");
	 aP.innerHTML = aft;
	 box.appendChild(aP);
 }});
}
async function getData(url) {
	var ret;
	var jso = await fetch(url);
	ret = await jso.json();
	return ret;
}
function hideBox(now) {
	document.styleSheets[0].rules[4].style.borderBottomColor = "white";
	document.getElementById("content").style.height = "";
	document.getElementById("content").style.overflow = "";
	if (!now) {
		document.getElementById("bsbBox").style.marginLeft="100vw";
		document.getElementById("bsbBox").style.marginRight="-100vw";
		document.getElementById("content").style.marginLeft = "0";
		document.getElementById("content").style.marginRight = "0";
		setTimeout(() => {
				// document.getElementById("bsbBox").setAttribute("hidden","true");
				document.getElementById("bsbBox").style.display = "none";
				document.getElementById("content").removeAttribute("hidden");
				document.getElementById("bsbBox").innerHTML="<div id='cls' onclick='hideBox(false)'></div>";
		},350);
	} else {
			document.getElementById("bsbBox").setAttribute("hidden","true");
			document.getElementById("bsbBox").style.display = "none";
			document.getElementById("content").removeAttribute("hidden");
			document.getElementById("bsbBox").innerHTML="<div id='cls' onclick='hideBox(false)'></div>";
	}
	
}
async function share() {
	var toShare = {title: "GameLog", text: "", url: window.location.href,};
		try {
			await navigator.share(toShare);
		} catch (err) {
			
	}
}
function soccerBox(stats) {
	ret = document.createElement("ul");
	ret.setAttribute("id","noBul");
	for (var i = 0; i < stats.length; i++) {
		it = document.createElement("li");
		it.innerHTML = "<span class=\"boldT\">"+stats[i].clock.displayValue + " </span>" + (stats[i].shortText || stats[i].text || stats[i].type.text);
		// it.innerText += (stats[i].shortText || stats[i].text || stats[i].type.text);
		if (stats[i].type.id == 93) {
			it.className = "redCard";
		} else if (stats[i].type.id == 94) {
			it.className = "yellowCard";
		} else if (stats[i].scoringPlay) {
			it.className = "scoreGoal";
		}
		ret.appendChild(it);
	}
	return ret;
}