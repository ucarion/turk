var startDelay = 6000;

var notes = [];
var start;
var musicPlaying = false;

var player;

window.onload = function() {
  MIDI.loadPlugin(function() {
    console.log("Sound being generated with " + MIDI.lang + ".");
    
    if (window.location.hash === '#' || window.location.hash === '') {
      switchTo('tracks/157-Rachmaninov - Flight of the Bumblebee');
    }
  }, "soundfont/acoustic_grand_piano-mp3.js");
}

function switchTo(file) {
  var songName = file.substring(11);
  $('#current-song').text('Currently Playing: ' + songName);

  xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", file, false);
  xmlhttp.send(null);
  var fileContent = xmlhttp.responseText;

  player = MIDI.Player;
  player.timeWarp = 1;

  player.stop();
  musicPlaying = false;
  notes = [];
  timeInSong = -startDelay;
  lastUpdatedTime = null;

  player.loadFile(fileContent, function() {
    midiData = player.data;

    currentTime = 0;

    for (var i = 0; i < midiData.length; i++) {
      midiDatum = midiData[i];

      midiEvent = midiDatum[0].event;
      interval = midiDatum[1];

      currentTime += interval;

      if (midiEvent.subtype === 'noteOn') {
        notes.push({ note: midiEvent.noteNumber, time: currentTime })
      }
    }

    player.addListener(function(data) {
      resetTimer(data.now);
    });

    start = new Date();

    setTimeout(function() { 
      player.start();
    }, startDelay);

    musicPlaying = true;
  });
}
