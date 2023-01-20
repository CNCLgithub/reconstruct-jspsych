/*
 * Requires:
 *     psiturk.js
 *     utils.js
 *     instrunctions.js
 *     static/data/condlist.json
 */


// Initalize psiturk object
var psiTurk = new PsiTurk(uniqueId, adServerLoc, mode);

// Define global experiment variables
var N_TRIALS = 10;

// Debug Variables
var SKIP_SUBJECT_ID = true;
var SKIP_INSTRUCTIONS = false;

// All pages to be loaded
var pages = [
    "trial.html",
    "postquestionnaire.html"
];

const init = (async () => {
    await psiTurk.preloadPages(pages);
})()

psiTurk.preloadPages(pages);

/**************
 * Experiment *
 **************/


var Experiment = function(condlist, trials) {
    // empty html template for jsPsych to use
    psiTurk.showPage('trial.html');

    // shuffle conditions
    shuffle(condlist);

    // all images are used in standard trials that can be automatically preloaded (as well as being used in trials 
    // that use timeline variables), so we can preload all image files with the auto_preload option
    var preload = {
        type: jsPsychPreload,
        auto_preload: true,
    };

    trials.push(preload);

    // ask for participant ID
    var participant_id = {
        type: jsPsychSurveyText,
        questions: [{
            prompt: 'What is your Participant ID?'
        }],
        data: {
            // add any additional data that needs to be recorded here
            type: "participant_id",
        }
    }

    // instructions trial
    var instructions = {
        type: jsPsychInstructions,
        pages: [
            "<b>Hi, thank you for volunteering to help out with our study!</b><br><br>" +
            "Please take a moment to adjust your seating so that you can comfortably watch the monitor and use the keyboard/mouse.<br>" +
            "Feel free to dim the lights as well. " +
            "Close the door or do whatever is necessary to minimize disturbance during the experiment. <br>" +
            "Please also take a moment to silence your phone so that you are not interrupted by any messages mid-experiment." +
            "<br><br>" +
            "Click <b>Next</b> when you are ready to continue.",
            "INSTRUCTIONS P2 <br> <br>" +
            "Click <b>Next</b> to continue.",
            "INSTRUCTIONS P3 <br> <br>" +
            "Click <b>Next</b> to begin the study.",
        ],
        show_clickable_nav: true,
        show_page_number: true,
        page_label: "<b>Instructions</b>",
        allow_backward: false,
    }

    // add the following trial pages to be displayed in their respective order
    if (SKIP_SUBJECT_ID == false) {trials.push(participant_id)};
    if (SKIP_INSTRUCTIONS == false) {trials.push(instructions)};
    
    for (i = 0; i < condlist.length; i++) {
        var vid = condlist[i][0];
        var img = condlist[i][1];

        var stim_vid = {
            type: jsPsychVideoButtonResponse,
            stimulus: [
                // placeholder data
                'static/data/movies/' + vid,
            ],
            choices: [],
            prompt: "<p></p>",
            response_allowed_while_playing: false,
            trial_ends_after_video: true,
            trial_duration: 900,
          };

        var sketchpad = {
            type: jsPsychSketchpad,
            prompt: '<p>Please draw the complete trajectory of the ball from the previous video.</p>',
            prompt_location: 'abovecanvas',
            stroke_color_palette: ['blue', 'pink', 'green', 'orange'],
            stroke_color: 'blue',
            background_image: "static/data/images/" + img, // placeholder data
            canvas_width: 750,
            canvas_height: 500,
            save_strokes: false,
            save_final_image: true
          }

        // display fixation cross then stimulus
        trials.push(stim_vid, sketchpad);
    }

    // end message
    var end_trial = {
        type: jsPsychHtmlButtonResponse,
        stimulus: "<h2><b>Thank you for volunteering to help out with our study! :) </b></h2><br><br>" +
        "Click <b>Done</b> to submit your responses. <br>",
        choices: ['<b>Done</b>'],
    };

    // display end message
    trials.push(end_trial);
};

/*******************
 * Run Task
 ******************/

$(window).on('load', async () => {
    await init;
    
    function load_condlist() {
        $.ajax({
            dataType: 'json',
            url: "static/data/condlist.json",
            async: false,
            success: function(data) {
                condlist = data;
                condlist = condlist.slice(0, N_TRIALS);
                var trials = [];

                var jsPsych = initJsPsych({
                    show_progress_bar: true,
                    on_trial_finish: function () {
                        // record data for psiturk database after every trial
                        psiTurk.recordTrialData(jsPsych.data.getLastTrialData());
                    },
                    on_finish: function () {
                        // save all recorded data to psiturk database
                        psiTurk.saveData();
                    }
                });

                Experiment(condlist, trials);
                jsPsych.run(trials);
            }
        });

    };
  
    if (isMobileTablet()){
        console.log("mobile browser detected");
        alert(`Sorry, but mobile or tablet browsers are not supported. Please switch to a desktop browser or return the hit.`);
        return;
    }

    load_condlist();
});


// not being used for this EEG experiment -- chloë 01/19/2023
// only needed if you want a post-questionnnaire
/****************
 * Questionnaire *
 ****************/

var Questionnaire = function() {

    var error_message = "<h1>Oops!</h1><p>Something went wrong submitting your HIT. This might happen if you lose your internet connection. Press the button to resubmit.</p><button id='resubmit'>Resubmit</button>";

    record_responses = function() {

        psiTurk.recordTrialData({
            'phase': 'postquestionnaire',
            'status': 'submit'
        });

        $('textarea').each(function(i, val) {
            psiTurk.recordUnstructuredData(this.id, this.value);
        });
        $('select').each(function(i, val) {
            psiTurk.recordUnstructuredData(this.id, this.value);
        });

    };

    prompt_resubmit = function() {
        document.body.innerHTML = error_message;
        $("#resubmit").click(resubmit);
    };

    resubmit = function() {
        document.body.innerHTML = "<h1>Trying to resubmit...</h1>";
        reprompt = setTimeout(prompt_resubmit, 10000);

        psiTurk.saveData({
            success: function() {
                clearInterval(reprompt);
                psiTurk.computeBonus('compute_bonus', function() {
                    finish()
                });
            },
            error: prompt_resubmit
        });
    };

    // Load the questionnaire snippet
    psiTurk.showPage('postquestionnaire.html');
    psiTurk.recordTrialData({
        'phase': 'postquestionnaire',
        'status': 'begin'
    });

    $("#next").click(function() {
        record_responses();
        psiTurk.saveData({
            success: function() {
                psiTurk.completeHIT(); // when finished saving compute bonus, the quit
                //window.location.replace(PROLIFIC_RETURN_URL); // redirecting back to Prolific
            },
            error: prompt_resubmit
        });
    });


};