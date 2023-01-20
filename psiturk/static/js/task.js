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
var N_TRIALS = 3;

// Debug Variables
var SKIP_PROLIFIC_ID = true;
var SKIP_INSTRUCTIONS = true; // variable doesn't work atm -- chloë 01/20/2023

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


var Experiment = function (jsPsych, condlist, trials) {
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
    var prolific_id = {
        type: jsPsychSurveyText,
        questions: [{
            prompt: 'What is your Prolific ID?'
        }],
        data: {
            // add any additional data that needs to be recorded here
            type: "prolific_id",
        }
    }
    // add the following trial pages to be displayed in their respective order
    if (SKIP_PROLIFIC_ID == false) {
        trials.push(prolific_id)
    };

    // welcome page
    var welcome = {
        type: jsPsychInstructions,
        pages: [
            "<h1>Hi, thank you for volunteering to help out with our study!</h1><br><br>" +
            "Please take a moment to adjust your seating so that you can comfortably watch the monitor and use the keyboard/mouse.<br>" +
            "Feel free to dim the lights as well. " +
            "Close the door or do whatever is necessary to minimize disturbance during the experiment. <br>" +
            "Please also take a moment to silence your phone so that you are not interrupted by any messages mid-experiment." +
            "<br><br>" +
            "Click <b>Next</b> when you are ready to continue.",
        ],
        show_clickable_nav: true,
        allow_backward: false,
    }
    trials.push(welcome)

    // TODO: add correct instructions
    // instructions trial
    var instructions = {
        type: jsPsychInstructions,
        pages: [
            "INSTRUCTIONS P1 <br> <br>" +
            "Click <b>Next</b> to continue.",
            "INSTRUCTIONS P2 <br> <br>" +
            "Click <b>Next</b> to begin the study.",
        ],
        show_clickable_nav: true,
        show_page_number: true,
        page_label: "<b>Instructions</b>",
        allow_backward: false,
    }

    // example video
    var sim_vid = {
        type: jsPsychVideoButtonResponse,
        stimulus: [
            // placeholder data
            'static/data/movies/ball-falling.mp4',
        ],
        choices: [],
        prompt: "<h3>Example of a video</h3>",
        response_allowed_while_playing: false,
        trial_ends_after_video: true,
        trial_duration: 900,
    };

    // example sketchpad
    var sim_sketch = {
        type: jsPsychSketchpad,
        prompt: '<h2>Example of the sketchpad</h2>' + '<h3>Please take a moment to familiarize yourself with the sketchpad. </h3>' + '<br><p>Using your mouse, draw the complete trajectory of the ball from the previous video.</p>',
        prompt_location: 'belowcanvas',
        stroke_color_palette: ['blue'],
        stroke_color: 'blue',
        background_image: "static/data/images/empty-room.png", // placeholder data
        canvas_width: 750,
        canvas_height: 500,
        save_strokes: false,
        save_final_image: false,
        show_finished_button: true,
        trial_duration: 10000,
        show_countdown_trial_duration: true
    }

    // TODO: add correct comp check questions
    // comprehension check questions
    var comp_check = {
        type: jsPsychSurveyMultiChoice,
        preamble: "<h2> Comprehension Check</h2>",
        questions: [{
                prompt: "Your task for this experiment is to ~<b>eat bananas</b>~.",
                name: 'check1',
                options: ['True', "False"],
                required: true
            },
            {
                prompt: "Your task for this experiment is to ~<b>order takeout</b>~.",
                name: 'check2',
                options: ['True', "False"],
                required: true
            }
        ],
        // randomize_question_order: true,
        on_finish: function (data) {
            var q1 = data.response.check1;
            var q2 = data.response.check2;

            // set to true if both comp checks are passed
            data.correct = (q1 == 'True' && q2 == "False") ? true : false;
        }
    };


    // comprehension check feedback
    var comp_feedback = {
        type: jsPsychHtmlButtonResponse,
        stimulus: function () {
            var last_resp_correct = jsPsych.data.getLastTrialData().values()[0].correct;

            if (last_resp_correct) {
                return "<span style='color:green'><h2>You passed the comprehension check!</h2></span>" + "<br>Please click <b>Next</b> to begin the study."
            } else {
                return "<span style='color:red'><h2>You failed to respond <b>correctly</b> to all parts of the comprehension check.</h2></span>" + "<br>Please click <b>Next</b> to revisit the instructions."
            }
        },
        choices: ['Next']
    };

    // compcheck: if answer incorrect, compcheck1 will be repeated until correct response inserted
    var comp_loop = {
        timeline: [instructions, sim_vid, sim_sketch, comp_check, comp_feedback],
        loop_function: function (data) {
            // check if comp_check was passed, break loop 
            return (data.values()[3].correct) ? false : true;
        }
    };

    trials.push(comp_loop)


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
            save_final_image: true,
            show_finished_button: false,
            trial_duration: 5000
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
            success: function (data) {
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

                Experiment(jsPsych, condlist, trials);
                jsPsych.run(trials);
            }
        });

    };

    if (isMobileTablet()) {
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

var Questionnaire = function () {

    var error_message = "<h1>Oops!</h1><p>Something went wrong submitting your HIT. This might happen if you lose your internet connection. Press the button to resubmit.</p><button id='resubmit'>Resubmit</button>";

    record_responses = function () {

        psiTurk.recordTrialData({
            'phase': 'postquestionnaire',
            'status': 'submit'
        });

        $('textarea').each(function (i, val) {
            psiTurk.recordUnstructuredData(this.id, this.value);
        });
        $('select').each(function (i, val) {
            psiTurk.recordUnstructuredData(this.id, this.value);
        });

    };

    prompt_resubmit = function () {
        document.body.innerHTML = error_message;
        $("#resubmit").click(resubmit);
    };

    resubmit = function () {
        document.body.innerHTML = "<h1>Trying to resubmit...</h1>";
        reprompt = setTimeout(prompt_resubmit, 10000);

        psiTurk.saveData({
            success: function () {
                clearInterval(reprompt);
                psiTurk.computeBonus('compute_bonus', function () {
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

    $("#next").click(function () {
        record_responses();
        psiTurk.saveData({
            success: function () {
                psiTurk.completeHIT(); // when finished saving compute bonus, the quit
                //window.location.replace(PROLIFIC_RETURN_URL); // redirecting back to Prolific
            },
            error: prompt_resubmit
        });
    });


};