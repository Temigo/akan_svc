function make_slides(f) {
  var   slides = {};

  slides.i0 = slide({
    name : "i0",
    start: function() {
      exp.startT = Date.now();
      $("#myProgressBar").hide();
    },
    button: function() {
      window.scrollTo(0, 0);
    }
  });

  slides.registration = slide({
    name : "registration",
    start: function() {
      $("#myProgressBar").show();
    },
    button : function() {
      if ($("#name").val().length > 0 && $("#phone").val().length > 0) {
        var data = {
          "user_id": exp.userId,
          "group_id": exp.assignedGroup,
          "name": $("#name").val(),
          "phone": $("#phone").val(),
          "timestamp": Date.now()
        }
        if (exp.record) {
          axios.post(exp.backendURL + '/new/users', data)
          .then(function(response) {
            console.log(response);
          }).catch(function(error) {
            console.log(error);
          });
        }
        window.scrollTo(0, 0);
        exp.go(); //use exp.go() if and only if there is no "present" data.
      }
      else {
        alert("Please fill in your name and phone number.");
      }
    }
  });

  slides.instructions = slide({
    name : "instructions",
    button : function() {
      $("#myProgressBar").show();
      window.scrollTo(0, 0);
      exp.go(); //use exp.go() if and only if there is no "present" data.
    }
  });

//////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////// PRACTICE /////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////

  slides.practice = slide({
    name : "practice",
    start: function() {
      var player = videojs('practice-video', {
        controls: true,
        autoplay: false,
        preload: 'auto',
        inactivityTimeout: 0, // keep control bar visible
        //fluid: true, // center and adapt to video ratio
        aspectRatio: "16:9",
        controlBar: {
          children: [
            //"playToggle", // remove play button
            //"volumePanel",
            //"volumeMenuButton",
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
        player.src({src: 'data/training1.mp4', type: 'video/mp4', width: 426, height: 240});
        player.poster('data/practice.jpg');
        player.controlBar.progressControl.disable();
        //player.markers.reset([]);
        exp.times = [];
        //Delay to start video
        setTimeout(function() {
          player.play();
        }, 8000);
        var countdown = 7;
        var looper = setInterval(function() {
          $("#countdown-practice").show();
          $("#countdown-practice p").html("Sini no firi aseɛ simma " + countdown);
          countdown = countdown - 1;
          if (countdown < 0) {
            $("#countdown-practice p").html();
            $("#countdown-practice").hide();
            clearInterval(looper);
          }
        }, 1000);
        //player.play();
      });
      this.startT = Date.now();
      // player.on("pause", function() {
      //   player.play();
      // });
      // Disable button until video has finished playing
      if (exp.record) {
        player.on("ended", function() {
          $(".next_video-practice").removeClass("disabled");
          $(".next_video-practice").addClass("positive");
        });
      }
      else {
        $(".next_video-practice").removeClass("disabled");
        $(".next_video-practice").addClass("positive");
      }

      player.markers({
        markers: [],
        markerStyle: {
          'width': '4px',
          'background-color': 'green'
        },
        markerTip: {
          display: false
        },
        onMarkerClick: function(marker) {
          return false;
        },
      });
      // Event on space bar key press
      document.body.onkeyup = function(e){
          if(e.keyCode == 32){
              e.preventDefault();
              var time = player.currentTime();
              player.markers.add([{ time: time /*text: 'hi'*/}]);
              exp.times.push(time);
              $("#practice-video").addClass("redContour");
              setTimeout(function() {
                $("#practice-video").removeClass("redContour");
              }, 300);
          }
      }
      // Event on tap on video
      var hammer = new Hammer(document.getElementById('practice-video'));
      hammer.on('tap', function(ev) {
        ev.preventDefault();
        var time = player.currentTime()
        player.markers.add([{ time: time /*text: 'hi'*/}]);
        exp.times.push(time);
        player.play();
        $("#practice-video").addClass("redContour");
        setTimeout(function() {
          $("#practice-video").removeClass("redContour");
        }, 300);
      });

    },
    button : function() {
      window.scrollTo(0, 0);
      var data = {
        "user_id": exp.userId,
        "response" : exp.times,
        "duration": (Date.now() - this.startT)/60000,
        "timestamp": Date.now(),
      };
      if (exp.record) {
        axios.post(exp.backendURL + '/new/practice', data)
        .then(function(response) {
          console.log(response);
        }).catch(function(error) {
          console.log(error);
        });
      }
      exp.go(); //use exp.go() if and only if there is no "present" data.
    }
  });

//////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////// VIDEO ///////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////

  slides.one_slider = slide({
    name : "one_slider",
    present: exp.videos1, //every element in exp.stims is passed to present_handle one by one as 'stim'
    start: function() {
      $(".question_part").hide();
      $(".video_part").show();
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
            //"volumePanel",
            //"volumeMenuButton",
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
          'background-color': 'green'
        },
        markerTip: {
          display: false
        },
        onMarkerClick: function(marker) {
          return false;
        },
      });
      this.player = player;
      this.startT = Date.now();

      // Disable button until video has finished playing
      if (exp.record) {
        this.player.on("ended", function() {
          $(".next_video-experiment").removeClass("disabled");
          $(".next_video-experiment").addClass("positive");
        });
      }
      else {
        $(".next_video-experiment").removeClass("disabled");
        $(".next_video-experiment").addClass("positive");
      }

      // Event on space bar key press
      document.body.onkeyup = function(e){
        if(e.keyCode == 32){
          e.preventDefault();
          var time = player.currentTime();
          player.markers.add([{ time: time /*, text: 'hi'*/}]);
          exp.times.push(time);
          $("#experiment-video").addClass("redContour");
          setTimeout(function() {
            $("#experiment-video").removeClass("redContour");
          }, 300);
        }
      }
      // Event on tap on video
      var hammer = new Hammer(document.getElementById('experiment-video'));
      //hammer.add(new Hammer.Tap({ event: 'singletap', taps: 1 }));
      hammer.on('tap', function(ev) {
        ev.preventDefault();
        var time = player.currentTime()
        player.markers.add([{ time: time /*, text: 'hi'*/}]);
        exp.times.push(time);
        player.play();
        console.log(time);
        $("#experiment-video").addClass("redContour");
        setTimeout(function() {
          $("#experiment-video").removeClass("redContour");
        }, 300);
      });
    },

    present_handle : function(stim) {
      $(".err").hide();
      this.stim = stim; // store this information in the slide so you can record it later
      // Display sentence
      console.log(stim);

      // $("#experiment-video").hide();
      // $("#experiment-description p").html(stim.svc);
      //if (stim.poster.length > 0) {
      this.player.src({src: stim.src, type: 'video/mp4'});
      this.player.poster(stim.poster);
      //}

      //$(".prompt").html(stim.sentence);
      $("#question1_0").html(stim.question1);
      $("#question1_1").html(stim.question1_1);
      $("#question1_2").html(stim.question1_2);
      $("#question2_0").html(stim.question2);
      $("#question2_1").html(stim.question2_1);
      $("#question2_2").html(stim.question2_2);
      $("#video_title").html(stim.title);
      var player = this.player;

      setTimeout(function() {
        // Reset markers
        player.markers.reset([]);
        exp.times = [];
        // Start playing
        player.play();
      }, 8000);

      var countdown = 7;
      var looper = setInterval(function() {
        $("#countdown-video").show();
        $("#countdown-video p").html("Sini no firi aseɛ simma " + countdown);
        countdown = countdown - 1;
        if (countdown < 0) {
          $("#countdown-video p").html();
          $("#countdown-video").hide();
          clearInterval(looper);
        }
      }, 1000);
    },

    button : function() {
      if ($('input[name="question1"]:checked').length > 0 && $('input[name="question2"]:checked').length > 0) {
        window.scrollTo(0, 0);
        $(".video_part").show();
        $(".question_part").hide();
        this.log_responses();
        $(".next_video-experiment").addClass("disabled");
        $(".next_video-experiment").removeClass("positive");
        /* use _stream.apply(this); if and only if there is
        "present" data. (and only *after* responses are logged) */
        _stream.apply(this);
      }
      else {
        alert("Please answer both questions before continuing.");
      }
    },

    question: function() {
      window.scrollTo(0, 0);
      $(".video_part").hide();
      $(".question_part").show();
    },

    log_responses : function() {
      console.log($('input[name="question1"]:checked').val());
      var data = {
          "user_id": exp.userId,
          "video_id": this.stim.id,
          "src" : this.stim.src,
          "poster": this.stim.poster,
          "description": this.stim.sentence,
          "response" : exp.times,
          "duration": (Date.now() - this.startT)/60000,
          "timestamp": Date.now(),
          "question1": this.stim.question1,
          "response1": $('input[name="question1"]:checked').val(),
          "question2": this.stim.question2,
          "response2": $('input[name="question2"]:checked').val()
      };
      $('input[name="question1"]:checked').removeAttr("checked");
      $('input[name="question2"]:checked').removeAttr("checked");
      console.log(data);
      exp.data_trials.push(data);
      if (exp.record) {
        axios.post(exp.backendURL + '/new/videos', data)
        .then(function(response) {
          console.log(response);
        }).catch(function(error) {
          console.log(error);
        });
      }
    }
  });

//////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////// PREFERENCE ///////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////

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
          "playToggle", // remove play button
          //"volumePanel",
          //"volumeMenuButton",
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

    this.player = player;
    this.startT = Date.now();

    // Disable button until video has finished playing
    if (exp.record) {
      this.player.on("ended", function() {
        $(".next_video").removeClass("disabled");
        $(".next_video").addClass("positive");
      });
    }
    else {
      $(".next_video").removeClass("disabled");
      $(".next_video").addClass("positive");
    }
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
    if ($('input[name="sentence"]:checked').length > 0) {
      window.scrollTo(0, 0);
      this.log_responses();

      /* use _stream.apply(this); if and only if there is
      "present" data. (and only *after* responses are logged) */
      _stream.apply(this);
      // reset player?
      this.player.src();
      //}
    }
    else {
      alert("Please choose your preferred sentence.");
    }
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
    console.log(data);
    console.log($('input[name="sentence"]:checked'));
    $('input[name="sentence"]:checked').removeAttr("checked");
    exp.data_trials.push(data);
    if (exp.record) {
      axios.post(exp.backendURL + '/new/preferences', data)
      .then(function(response) {
        console.log(response);
      }).catch(function(error) {
        console.log(error);
      });
    }
  }
});

//////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////// INFO  ////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////

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
        duration : (Date.now() - exp.startT)/60000
        //fairprice: $("#fairprice").val()
        //email: $("#email").val(),
        //name: $("#name").val(),
      };
      window.scrollTo(0, 0);
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
      if (exp.record) {
        axios.post(exp.backendURL + '/new/infos', exp.subj_data)
        .then(function(response) {
          console.log(response);
        }).catch(function(error) {
          console.log(error);
        });
        exp.system.timestamp = Date.now();
        axios.post(exp.backendURL + '/new/systems', exp.system)
        .then(function(response) {
          console.log(response);
        }).catch(function(error) {
          console.log(error);
        });
      }
    }
  });

  return slides;
}

//////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////// SETUP ////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////
function init() {
  exp.trials = [];
  exp.catch_trials = [];
  exp.nQs = 14;

  exp.userId = Math.random().toString(36).substr(2, 9); // TODO
  console.log('User id', exp.userId);
  exp.backendURL = 'http://stanford.edu/~ldomine/cgi-bin/twi.cgi';
  exp.record = true; // whether to send data to backend - for debugging

  exp.groups = [
    ["data/control.jpg", "data/control.jpg", "data/control.jpg", "data/control.jpg", "data/control.jpg", "data/control.jpg"], // Control
    ["data/svc_0.jpg", "data/cc_1.jpg", "data/svc_2.jpg", "data/cc_3.jpg", "data/svc_4.jpg"], // Group 1
    ["data/cc_0.jpg", "data/svc_1.jpg", "data/cc_2.jpg", "data/svc_3.jpg", "data/cc_4.jpg"] // Group 2
  ];
  console.log(exp.groups);
  exp.assignedGroup = Math.floor(Math.random() * exp.groups.length);
  console.log("Assigned group: ", exp.assignedGroup);

  exp.videos = [
    {
      id: 0,
      sentence: "Cook/eat",
      src: "data/cook_eat2.mp4",
      roi: "data/cook_eat2_roi.mp4",
      svc: "Papa no noa ɛmoo di.",
      cc: "Papa no noa ɛmoo na wadi.",
      question1: "Kyensen no a yɛ de noaa ɛmoo no ahosuo yɛ den?",
      question1_1: "Tuntum",
      question1_2: "Fitaa",
      question2: "Nnipa dodoɔ sɛn na edii ɛmoo no?",
      question2_1: "2",
      question2_2: "3",
      title: "Sini a ɛdikan - Dwumadie a ɛdikan (1/5)",
    },
    {
      id: 1,
      sentence: "Buy/ride",
      src: "data/buy_ride2.mp4",
      roi: "data/buy_ride2_roi.mp4",
      svc: "Papa no tɔɔ sakri no twiieɛ.",
      cc: "Papa no tɔɔ sakri no ɛna ɔtwiieɛ.",
      question1: "Tiaseɛnam bɛn na papa no forɔ kɔɔ sikakorabea hɔ?",
      question1_1: "Taasin",
      question1_2: "Trɔtrɔ",
      question2: "Nnipa dodoɔ sɛn na ɛyɛ adwuma wɔ sikakorabea hɔ?",
      question2_1: "1",
      question2_2: "3",
      title: "Sini a ɛtɔso mienu - Dwumadie a ɛtɔso mienu (2/5)"
    },
    {
      id: 2,
      sentence: "Wash/hangup",
      src: "data/wash_hangup2.mp4",
      roi: "data/wash_hangup2_roi.mp4",
      svc: "Maame no sii nneɛma no hataeɛ.",
      cc: "Maame no sii nneɛma no na ɔhataeɛ.",
      question1: "Dwaresen anaa bakiti no a ɔbaa no de esi nnoɔma no ahosuo yɛ den?",
      question1_1: "Tuntum",
      question1_2: "Fitaa",
      question2: "Nneɛma dodoɔ sɛn na ɔbaa no esiieɛ?",
      question2_1: "1",
      question2_2: "3",
      title: "Sini a ɛtɔso mmieɛnsa - Dwumadie a ɛtɔso mmieɛnsa (3/5)"
    },
    {
      id: 3,
      sentence: "Grill/sell",
      src: "data/grill_sell2.mp4",
      roi: "data/grill_sell2_roi.mp4",
      svc: "Papa no toto nsuomu nam tɔn.",
      cc: "Papa no toto nsuomu nam a ɔtɔn.",
      question1: "Ɛkyɛ ben na na papa no hyɛ?",
      question1_1: "Ɛdwafoɔ kyɛ",
      question1_2: "Asogyafoɔ kyɛ",
      question2: "Adwene dodoɔ sen na papa no tɔnn yɛ?",
      question2_1: "1",
      question2_2: "2",
      title: "Sini a ɛtɔso nan - Dwumadie a ɛtɔso nan (4/5)"
    },
    {
      id: 4,
      sentence: "Borrow/wear",
      src: "data/borrow_wear2.mp4",
      roi: "data/borrow_wear2_roi.mp4",
      svc: "Papa no kɔserɛ ɛkyɛ hyɛ.",
      cc: "Papa no kɔserɛ ɛkyɛ na wahyɛ.",
      question1: "Papa no de adeɛ ben na ɛdɔɔ afuo no ",
      question1_1: "Trata",
      question1_2: "Nantwinin",
      question2: "Sɛ wo hwɛ a na ɛwiem mu nsakyerayɛ a ɛwɔ sini no mu no bɛyɛ den?",
      question2_1: "Awia merɛ",
      question2_2: "Awɔ merɛ",
      title: "Sini a ɛtɔso num - Dwumadie a ɛtɔso num (5/5)"
    },
  ];
  // Divide into two lists of videos for the 2 parts of the experiment
  exp.videos1 = exp.videos.map(function(video, index) {
    return {id: video.id, sentence: video.sentence, src: video.src, title: video.title,
      question1: video.question1, question1_1: video.question1_1, question1_2: video.question1_2,
      question2: video.question2, question2_1: video.question2_1, question2_2: video.question2_2,
      svc: video.svc, cc: video.cc, poster: this.groups[this.assignedGroup][index]
    };
  }, exp);
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
    "registration",
    "instructions",
    "practice",
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
    // if (turk.previewMode) {
    //   $("#mustaccept").show();
    // } else {
      $("#start_button").click(function() {$("#mustaccept").show();});
      exp.go();
    // }
  });

  exp.go(); //show first slide
}
