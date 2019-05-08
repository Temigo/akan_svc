function make_slides(f) {
  var   slides = {};

  slides.i0 = slide({
    name : "i0",
    start: function() {
    exp.startT = Date.now();
    }
  });

  slides.instructions = slide({
    name : "instructions",
    button : function() {
      exp.go(); //use exp.go() if and only if there is no "present" data.
    }
  });

  slides.practice = slide({
    name : "practice",
    start: function() {
      var player = videojs('practice-video', {
        controls: true,
        autoplay: false,
        preload: 'auto',
        inactivityTimeout: 0, // keep control bar visible
        fluid: true, // center and adapt to video ratio
        controlBar: {
          children: [
            //"playToggle", // remove play button
            "volumePanel",
            "volumeMenuButton",
            "durationDisplay",
            "timeDivider",
            "currentTimeDisplay",
            "progressControl",
            "remainingTimeDisplay",
            "fullscreenToggle"
          ]
        }
      }, function() {
        var player = this;
        player.src({src: 'data/fufu2.mp4', type: 'video/mp4'});
        // Delay to start video
        setTimeout(function() {
          player.play();
        }, 0);
        player.controlBar.progressControl.disable();
        // var currentTime = 0;
        // player.on("seeking", function(event) {
        //   player.currentTime(currentTime);
        // });
        // player.on("seeked", function(event) {
        //   player.currentTime(currentTime);
        // });
        //
        // setInterval(function () {
        //   if (!player.paused()) {
        //     currentTime = player.currentTime();
        //   }
        // }, 1000);
      });

      player.markers({
        markers: [],
        markerStyle: {
          'width': '4px',
          'background-color': 'red'
        }
      });

      // Event on space bar key press
      document.body.onkeyup = function(e){
          if(e.keyCode == 32){
              player.markers.add([{ time: player.currentTime(), text: 'hi'}]);
              console.log(player.markers.getMarkers());
          }
      }
    },
    button : function() {
      exp.go(); //use exp.go() if and only if there is no "present" data.
    }
  });

  slides.one_slider = slide({
    name : "one_slider",
    present: exp.videos1, //every element in exp.stims is passed to present_handle one by one as 'stim'
    start: function() {
      this.times = [];
      var player = videojs('experiment-video', {
        controls: true,
        autoplay: false,
        preload: 'auto',
        inactivityTimeout: 0, // keep control bar visible
        fluid: true, // center and adapt to video ratio
        controlBar: {
          children: [
            //"playToggle", // remove play button
            "volumePanel",
            "volumeMenuButton",
            "durationDisplay",
            "timeDivider",
            "currentTimeDisplay",
            "progressControl",
            "remainingTimeDisplay",
            "fullscreenToggle"
          ]
        }
      }, function() {
        var player = this;
        // Delay to start video
        // setTimeout(function() {
        //   player.play();
        // }, 0);
        player.controlBar.progressControl.disable();
      });
      player.markers({
        markers: [],
        markerStyle: {
          'width': '4px',
          'background-color': 'red'
        }
      });
      this.player = player;
      this.startT = Date.now();

      // Event on space bar key press
      document.body.onkeyup = function(e){
        if(e.keyCode == 32){
          e.preventDefault();
          var time = player.currentTime();
          player.markers.add([{ time: time, text: 'hi'}]);
          exp.times.push(time);
        }
      }
    },

    present_handle : function(stim) {
      $(".err").hide();
      this.stim = stim; // store this information in the slide so you can record it later
      // Display sentence
      $(".prompt").html(stim.sentence);
      // Set src
      this.player.src({src: stim.src, type: 'video/mp4'});
      // Reset markers
      this.player.markers.reset([]);
      exp.times = [];
      // Start playing
      this.player.play();
    },

    button : function() {
      // if (exp.sliderPost == null) {
      //   $(".err").show();
      // } else {
      this.log_responses();

      /* use _stream.apply(this); if and only if there is
      "present" data. (and only *after* responses are logged) */
      _stream.apply(this);
      //}
    },


    log_responses : function() {
      var data = {
          "user_id": exp.userId,
          "video_id": this.stim.id,
          "src" : this.stim.src,
          "description": this.stim.sentence,
          "response" : exp.times,
          "duration": (Date.now() - this.startT)/60000,
          "timestamp": Date.now()
      };
      console.log(data);
      exp.data_trials.push(data);
      axios.post(exp.backendURL + '/new/videos', data)
      .then(function(response) {
        console.log(response);
      }).catch(function(error) {
        console.log(error);
      });

    }
  });
////////////////////////////////////////////////////////////////////////////////
slides.preference_slide = slide({
  name : "preference_slide",
  present: exp.videos2, //every element in exp.stims is passed to present_handle one by one as 'stim'
  start: function() {
    this.times = [];
    var player = videojs('preference-video', {
      controls: true,
      autoplay: false,
      preload: 'auto',
      inactivityTimeout: 0, // keep control bar visible
      fluid: true, // center and adapt to video ratio
      controlBar: {
        children: [
          //"playToggle", // remove play button
          "volumePanel",
          "volumeMenuButton",
          "durationDisplay",
          "timeDivider",
          "currentTimeDisplay",
          "progressControl",
          "remainingTimeDisplay",
          "fullscreenToggle"
        ]
      }
    }, function() {
      var player = this;
      // Delay to start video
      // setTimeout(function() {
      //   player.play();
      // }, 0);
      player.controlBar.progressControl.disable();
    });
    // player.markers({
    //   markers: [],
    //   markerStyle: {
    //     'width': '4px',
    //     'background-color': 'red'
    //   }
    // });
    this.player = player;
    this.startT = Date.now();

    // Event on space bar key press
    // document.body.onkeyup = function(e){
    //   if(e.keyCode == 32){
    //     e.preventDefault();
    //     var time = player.currentTime();
    //     player.markers.add([{ time: time, text: 'hi'}]);
    //     exp.times.push(time);
    //   }
    // }
  },

  present_handle : function(stim) {
    $(".err").hide();
    this.stim = stim; // store this information in the slide so you can record it later
    // Display sentence
    $(".svc-sentence").html(stim.svc);
    $(".cc-sentence").html(stim.cc);
    // Set src
    this.player.src({src: stim.roi, type: 'video/mp4'});
    // Reset markers
    // this.player.markers.reset([]);
    // exp.times = [];
    // Start playing
    this.player.play();
  },

  button : function() {
    // if (exp.sliderPost == null) {
    //   $(".err").show();
    // } else {
    this.log_responses();

    /* use _stream.apply(this); if and only if there is
    "present" data. (and only *after* responses are logged) */
    _stream.apply(this);
    //}
  },

  log_responses : function() {
    var data = {
        "user_id": exp.userId,
        "video_id": this.stim.id,
        //"src" : this.stim.roi,
        "svc_description": this.stim.svc,
        "cc_description": this.stim.cc,
        "duration": (Date.now() - this.startT)/60000,
        "preference": $('input[name="sentence"]:checked').val(),
        "timestamp": Date.now()
    };
    exp.data_trials.push(data);
    axios.post(exp.backendURL + '/new/preferences', data)
    .then(function(response) {
      console.log(response);
    }).catch(function(error) {
      console.log(error);
    });
  }
});



////////////////////////////////////////////////////////////////////////////////
  slides.subj_info =  slide({
    name : "subj_info",
    submit : function(e){
      exp.subj_data = {
        user_id: exp.userId,
        language : $("#language").val(),
        //enjoyment : $("#enjoyment").val(),
        assess : $('input[name="assess"]:checked').val(),
        age : $("#age").val(),
        gender : $("#gender").val(),
        education : $("#education").val(),
        comments : $("#comments").val(),
        problems: $("#problems").val(),
        //fairprice: $("#fairprice").val()
        email: $("#email").val(),
        name: $("#name").val(),
      };
      exp.go(); //use exp.go() if and only if there is no "present" data.
    }
  });

  slides.thanks = slide({
    name : "thanks",
    start : function() {
      exp.data= {
          "trials" : exp.data_trials,
          "catch_trials" : exp.catch_trials,
          "system" : exp.system,
          //"condition" : exp.condition,
          "subject_information" : exp.subj_data,
          "time_in_minutes" : (Date.now() - exp.startT)/60000
      };
      console.log(exp.data);
      //setTimeout(function() {turk.submit(exp.data);}, 1000);
      axios.post(exp.backendURL + '/new/users', exp.subj_data)
      .then(function(response) {
        console.log(response);
      }).catch(function(error) {
        console.log(error);
      });
      axios.post(exp.backendURL + '/new/systems', exp.system)
      .then(function(response) {
        console.log(response);
      }).catch(function(error) {
        console.log(error);
      });
    }
  });

  return slides;
}

/// init ///
function init() {
  exp.trials = [];
  exp.catch_trials = [];
  exp.nQs = 40;

  exp.userId = 0; // TODO
  exp.backendURL = 'http://stanford.edu/~ldomine/cgi-bin/twi.cgi';

  exp.videos = [
    {
      id: 0,
      sentence: "Fufuo",
      src: "data/fufu2.mp4",
      roi: "data/fufu2_roi.mp4",
      svc: "SVC sentence",
      cc: "CC sentence"
    },
    {
      id: 1,
      sentence: "Market",
      src: "data/market2.mp4",
      roi: "data/market2_roi.mp4",
      svc: "SVC sentence",
      cc: "CC sentence"
    }
  ];
  // Divide into two lists of videos for the 2 parts of the experiment
  exp.videos1 = exp.videos.map(function(video) {
    return {id: video.id, sentence: video.sentence, src: video.src};
  });
  exp.videos2 = exp.videos.map(function(video) {
    return {id:video.id, roi: video.roi, svc: video.svc, cc: video.cc};
  });
  exp.times = []; // used as temporary storage

  exp.system = {
      user_id : exp.userId,
      browser : BrowserDetect.browser,
      os : BrowserDetect.OS,
      height: screen.height,
      //screenUH: exp.height,
      width: screen.width,
      //screenUW: exp.width
    };

  //blocks of the experiment:
  exp.structure=[
    "i0",
    //"registration",
    //"instructions",
    //"practice",
    "one_slider",
    "preference_slide",
    'subj_info',
    'thanks'
  ];

  exp.data_trials = [];
  //make corresponding slides:
  exp.slides = make_slides(exp);

  //exp.nQs = utils.get_exp_length(); //this does not work if there are stacks of stims (but does work for an experiment with this structure)
                    //relies on structure and slides being defined

  $('.slide').hide(); //hide everything

  //make sure turkers have accepted HIT (or you're not in mturk)
  $("#start_button").click(function() {
    if (turk.previewMode) {
      $("#mustaccept").show();
    } else {
      $("#start_button").click(function() {$("#mustaccept").show();});
      exp.go();
    }
  });

  exp.go(); //show first slide
}
